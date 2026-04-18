package com.smartcourier.api_gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String validToken;

    private final String testSecret = "my-test-secret-value-longer-than-32-chars";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", testSecret);
        
        validToken = Jwts.builder()
                .setSubject("testuser")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60))
                .signWith(Keys.hmacShaKeyFor(testSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void validateToken_Success() {
        jwtUtil.validateToken(validToken);
    }

    @Test
    void validateToken_Invalid_ThrowsException() {
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken("invalid.token.here");
        });
    }

    @Test
    void extractUsername_Success() {
        String username = jwtUtil.extractUsername(validToken);
        assertEquals("testuser", username);
    }
}
