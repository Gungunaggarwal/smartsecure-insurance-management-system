package com.smartcourier.claims;

import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.repository.ClaimRepository;
import com.smartcourier.claims.service.ClaimsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    void initiateClaimWithDoc_AndTrack_FullFlow_Success() {
        MultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "dummy-content".getBytes());

        // 1. Initiate claim with document upload
        ClaimResponse response = claimsService.initiateClaimWithDoc(file, 1L, "Theft of courier", "johndoe");

        assertNotNull(response.getId());
        assertEquals("PENDING", response.getStatus());
        assertNotNull(response.getDocumentPath());

        // 2. Track the claim
        ClaimResponse tracked = claimsService.trackClaim(response.getId());
        assertEquals(response.getId(), tracked.getId());
    }

    @Test
    void initiateClaimWithDoc_TwoCalls_CreatesTwoClaims() {
        MultipartFile file1 = new MockMultipartFile(
                "file", "doc1.pdf", "application/pdf", "content1".getBytes());
        MultipartFile file2 = new MockMultipartFile(
                "file", "doc2.pdf", "application/pdf", "content2".getBytes());

        // Each call auto-generates a unique idempotency key, so both should be saved
        claimsService.initiateClaimWithDoc(file1, 1L, "First claim", "johndoe");
        claimsService.initiateClaimWithDoc(file2, 1L, "Second claim", "johndoe");

        assertEquals(2, claimRepository.count());
    }
}

