package com.smartcourier.claims;

import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.repository.ClaimRepository;
import com.smartcourier.claims.service.ClaimsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ClaimsServiceIntegrationTest {

    @Autowired
    private ClaimsService claimsService;

    @Autowired
    private ClaimRepository claimRepository;

    @BeforeEach
    void setUp() {
        claimRepository.deleteAll();
    }

    @Test
    void initiateAndTrackClaim_FullFlow_Success() {
        // 1. Initiate Claim
        ClaimInitiateRequest request = new ClaimInitiateRequest();
        request.setPolicyId(1L);
        request.setDescription("Theft of courier");
        request.setIdempotencyKey("unique-key-123");
        request.setDocumentPath("/tmp/uploads/docs.pdf");

        ClaimResponse response = claimsService.initiateClaim(request, "johndoe");
        assertNotNull(response.getId());
        assertEquals("PENDING", response.getStatus());

        // 2. Track Claim
        ClaimResponse tracked = claimsService.trackClaim(response.getId());
        assertEquals(response.getId(), tracked.getId());
    }

    @Test
    void initiateClaim_Idempotency_Success() {
        ClaimInitiateRequest request = new ClaimInitiateRequest();
        request.setPolicyId(1L);
        request.setDescription("Theft of courier");
        request.setIdempotencyKey("same-key");

        claimsService.initiateClaim(request, "johndoe");
        
        // Second initiation with same key
        ClaimResponse response2 = claimsService.initiateClaim(request, "johndoe");
        
        assertEquals(1, claimRepository.count());
        assertNotNull(response2.getId());
    }
}
