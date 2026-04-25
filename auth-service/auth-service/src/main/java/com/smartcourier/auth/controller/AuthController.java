package com.smartcourier.auth.controller;

import com.smartcourier.auth.dto.AuthResponse;
import com.smartcourier.auth.dto.LoginRequest;
import com.smartcourier.auth.dto.RegisterRequest;
import com.smartcourier.auth.dto.UserResponse;
import com.smartcourier.auth.service.AuthService;
import com.smartcourier.auth.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    /** Send OTP to email before registration */
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        log.info("OTP send requested for email: {}", email);
        otpService.sendOtp(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    /** Verify OTP submitted by user */
    @PostMapping("/verify-otp")
    public ResponseEntity<Boolean> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        log.info("OTP verify requested for email: {}", email);
        boolean valid = otpService.verifyOtp(email, otp);
        return ResponseEntity.ok(valid);
    }

    /** Register a new user */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Received registration request for: {}", request.getUsername());
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    /** Login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Received login request for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }

    /** Get user by username */
    @GetMapping("/user/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        log.info("Received request to get user details for: {}", username);
        return ResponseEntity.ok(authService.getUserByUsername(username));
    }

    /** Update user email / role / password */
    @PutMapping("/user/{username}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String username,
                                                    @RequestBody RegisterRequest request) {
        log.info("Received request to update user: {}", username);
        return ResponseEntity.ok(authService.updateUser(username, request));
    }

    /** Delete a user by username */
    @DeleteMapping("/user/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        log.info("Received request to delete user: {}", username);
        authService.deleteUser(username);
        return ResponseEntity.ok("User '" + username + "' deleted successfully.");
    }

    /** Count all users */
    @GetMapping("/users/count")
    public ResponseEntity<Long> countUsers() {
        log.info("Received request to count all users");
        return ResponseEntity.ok(authService.countUsers());
    }

    /** Count users by role (e.g. USER, ADMIN) */
    @GetMapping("/users/count/role/{role}")
    public ResponseEntity<Long> countUsersByRole(@PathVariable String role) {
        log.info("Received request to count users with role: {}", role);
        return ResponseEntity.ok(authService.countUsersByRole(role));
    }
}
