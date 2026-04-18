package com.smartcourier.api_gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String validToken;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        validToken = Jwts.builder()
                .setSubject("testuser")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60))
                .signWith(Keys.hmacShaKeyFor(JwtUtil.SECRET.getBytes()), SignatureAlgorithm.HS256)
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
