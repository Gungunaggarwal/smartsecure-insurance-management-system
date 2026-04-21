package com.smartcourier.auth.service;

import com.smartcourier.auth.dto.AuthResponse;
import com.smartcourier.auth.dto.LoginRequest;
import com.smartcourier.auth.dto.RegisterRequest;
import com.smartcourier.auth.dto.UserResponse;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import com.smartcourier.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // ─── Register ────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register new user: {}", request.getUsername());
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            log.warn("Registration failed: Username {} already taken", request.getUsername());
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed: Email {} already registered", request.getEmail());
            throw new RuntimeException("Email is already registered");
        }
        User user = User.builder()
                .username(request.getUsername())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(request.getRole() != null ? request.getRole() : "USER")
                .build();
        userRepository.save(user);
        log.info("User {} registered successfully with role: {}", user.getUsername(), user.getRole());
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    // ─── Login ───────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User with email {} not found", request.getEmail());
                    return new RuntimeException("Invalid email or password");
                });
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for email {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }
        log.info("User {} logged in successfully via email", user.getUsername());
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    // ─── Get User ────────────────────────────────────────────────────────────
    @Cacheable(value = "users", key = "#username")
    public UserResponse getUserByUsername(String username) {
        log.debug("Fetching user details for: {} (Cache miss if this logs)", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserResponse(user);
    }

    // ─── Update User ─────────────────────────────────────────────────────────
    @CacheEvict(value = "users", key = "#username")
    public UserResponse updateUser(String username, RegisterRequest request) {
        log.info("Admin/User updating profile for: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            user.setAddress(request.getAddress());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            log.info("Changing role for user {} to {}", username, request.getRole());
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        User saved = userRepository.save(user);
        log.info("User {} updated successfully", username);
        return toUserResponse(saved);
    }

    // ─── Delete User ─────────────────────────────────────────────────────────
    @CacheEvict(value = "users", key = "#username")
    public void deleteUser(String username) {
        log.info("Deleting user: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        userRepository.delete(user);
        log.info("User {} deleted successfully", username);
    }

    // ─── Count ───────────────────────────────────────────────────────────────
    public long countUsers() {
        return userRepository.count();
    }

    public long countUsersByRole(String role) {
        return userRepository.countByRole(role);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }
}
