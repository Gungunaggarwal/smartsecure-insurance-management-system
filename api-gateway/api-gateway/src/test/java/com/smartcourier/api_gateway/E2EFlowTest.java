package com.smartcourier.api_gateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureWireMock(port = 8081)
class E2EFlowTest {

    @Autowired
    private WebTestClient webTestClient;

    private static final String SECRET = "4e78a6d91f2c4b8e3a5d7f0c9b1e2a8d4c6f5a3b2d1e0c9b8a7f6d5e4c3b2a1";

    private String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void fullFlow_Simulated_Success() {
        String token = generateToken("johndoe", "ROLE_CUSTOMER");

        // 1. Mock Auth Service Response
        stubFor(post(urlEqualTo("/api/v1/auth/login"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody("{\"token\":\"" + token + "\"}")));

        // 2. Mock Policy Service Response
        stubFor(get(urlEqualTo("/api/v1/policies"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody("[{\"id\":1,\"name\":\"Health Guard\"}]")));

        // 3. Mock Claims Service Response
        stubFor(post(urlEqualTo("/api/v1/claims/initiate"))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody("{\"id\":1,\"status\":\"PENDING\"}")));

        // Execute E2E through Gateway
        
        // Login
        webTestClient.post().uri("/api/v1/auth/login")
                .bodyValue("{\"username\":\"johndoe\",\"password\":\"password\"}")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.token").isEqualTo(token);

        // Get Policies (Secured)
        webTestClient.get().uri("/api/v1/policies")
                .header("Authorization", "Bearer " + token)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].name").isEqualTo("Health Guard");

        // Initiate Claim (Secured)
        webTestClient.post().uri("/api/v1/claims/initiate")
                .header("Authorization", "Bearer " + token)
                .bodyValue("{\"policyId\":1,\"description\":\"Theft\"}")
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.status").isEqualTo("PENDING");
    }
}
