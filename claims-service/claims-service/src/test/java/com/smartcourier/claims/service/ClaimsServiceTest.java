package com.smartcourier.claims.service;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.entity.Claim;
import com.smartcourier.claims.repository.ClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimsServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private FileStorageUtil fileStorageUtil;

    @InjectMocks
    private ClaimsService claimsService;

    private Claim testClaim;
    private ClaimInitiateRequest testRequest;

    @BeforeEach
    void setUp() {
        testClaim = Claim.builder()
                .id(1L)
                .policyId(10L)
                .username("testusr")
                .description("Test Description")
                .idempotencyKey("uid-1234")
                .status("PENDING")
                .build();

        testRequest = new ClaimInitiateRequest();
        testRequest.setPolicyId(10L);
        testRequest.setDescription("Test Description");
        testRequest.setIdempotencyKey("uid-1234");
    }

    @Test
    void uploadDocument_ShouldReturnPath() {
        MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        when(fileStorageUtil.storeFile(file, "testusr")).thenReturn("/tmp/uploads/test.txt");

        String path = claimsService.uploadDocument(file, "testusr");

        assertEquals("/tmp/uploads/test.txt", path);
        verify(fileStorageUtil, times(1)).storeFile(file, "testusr");
    }

    @Test
    void initiateClaim_WhenNewClaim_ShouldSaveAndReturnResponse() {
        when(claimRepository.findByIdempotencyKey("uid-1234")).thenReturn(Optional.empty());
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimResponse response = claimsService.initiateClaim(testRequest, "testusr");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("PENDING", response.getStatus());
        verify(claimRepository, times(1)).findByIdempotencyKey("uid-1234");
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    void initiateClaim_WhenIdempotentExists_ShouldReturnExistingResponse() {
        when(claimRepository.findByIdempotencyKey("uid-1234")).thenReturn(Optional.of(testClaim));

        ClaimResponse response = claimsService.initiateClaim(testRequest, "testusr");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(claimRepository, times(1)).findByIdempotencyKey("uid-1234");
        verify(claimRepository, never()).save(any(Claim.class));
    }

    @Test
    void updateClaimStatus_WhenExists_ShouldSave() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        claimsService.updateClaimStatus(1L, "APPROVED");

        assertEquals("APPROVED", testClaim.getStatus());
        verify(claimRepository, times(1)).findById(1L);
        verify(claimRepository, times(1)).save(testClaim);
    }
}
