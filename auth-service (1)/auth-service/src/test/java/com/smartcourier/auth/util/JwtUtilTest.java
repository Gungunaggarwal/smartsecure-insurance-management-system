package com.smartcourier.auth.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Set properties using ReflectionTestUtils manually since it's a @Value injected field
        ReflectionTestUtils.setField(jwtUtil, "secret", "4e78a6d91f2c4b8e3a5d7f0c9b1e2a8d4c6f5a3b2d1e0c9b8a7f6d5e4c3b2a1");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
    }

    @Test
    void generateAndValidateToken_Success() {
        String username = "testuser";
        String role = "ROLE_USER";
        String token = jwtUtil.generateToken(username, role);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        assertDoesNotThrow(() -> jwtUtil.validateToken(token));
    }
}
