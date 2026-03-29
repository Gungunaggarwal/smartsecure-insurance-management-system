package com.smartcourier.claims.service;

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

    @BeforeEach
    void setUp() {
        testClaim = Claim.builder()
                .id(1L)
                .policyId(10L)
                .username("testusr")
                .description("Test Description")
                .idempotencyKey("uid-1234")
                .documentPath("/tmp/uploads/test.pdf")
                .status("PENDING")
                .build();
    }

    // ─── Initiate ────────────────────────────────────────────────────────────

    @Test
    void initiateClaimWithDoc_ShouldUploadFileAndSaveClaim() {
        MultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

        when(fileStorageUtil.storeFile(file, "testusr")).thenReturn("/tmp/uploads/test.pdf");
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimResponse response = claimsService.initiateClaimWithDoc(file, 10L, "Test Description", "testusr");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("PENDING", response.getStatus());
        assertEquals("/tmp/uploads/test.pdf", response.getDocumentPath());

        verify(fileStorageUtil, times(1)).storeFile(file, "testusr");
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    // ─── Track ───────────────────────────────────────────────────────────────

    @Test
    void trackClaim_ShouldReturnClaimResponse() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        ClaimResponse response = claimsService.trackClaim(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("testusr", response.getUsername());
    }

    @Test
    void trackClaim_WhenNotFound_ShouldThrowException() {
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> claimsService.trackClaim(99L));
    }

    // ─── Update Status (internal) ─────────────────────────────────────────────

    @Test
    void updateClaimStatus_WhenExists_ShouldSave() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        claimsService.updateClaimStatus(1L, "APPROVED");

        assertEquals("APPROVED", testClaim.getStatus());
        verify(claimRepository, times(1)).findById(1L);
        verify(claimRepository, times(1)).save(testClaim);
    }

    @Test
    void updateClaimStatus_NotFound_ShouldThrow() {
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> claimsService.updateClaimStatus(99L, "APPROVED"));
    }

    // ─── Update Claim (description + status) ─────────────────────────────────

    @Test
    void updateClaim_ShouldUpdateDescriptionAndStatus() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimResponse result = claimsService.updateClaim(1L, "Updated description", "APPROVED");

        assertNotNull(result);
        verify(claimRepository, times(1)).findById(1L);
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    void updateClaim_NotFound_ShouldThrow() {
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> claimsService.updateClaim(99L, "desc", "APPROVED"));
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    @Test
    void deleteClaim_ShouldDeleteFromRepository() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        claimsService.deleteClaim(1L);

        verify(claimRepository, times(1)).delete(testClaim);
    }

    @Test
    void deleteClaim_NotFound_ShouldThrow() {
        when(claimRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> claimsService.deleteClaim(99L));
    }

    // ─── Count ───────────────────────────────────────────────────────────────

    @Test
    void countClaims_ShouldReturnTotal() {
        when(claimRepository.count()).thenReturn(7L);

        long count = claimsService.countClaims();

        assertEquals(7L, count);
        verify(claimRepository, times(1)).count();
    }

    @Test
    void countClaimsByStatus_ShouldReturnCountForStatus() {
        when(claimRepository.countByStatus("PENDING")).thenReturn(4L);
        when(claimRepository.countByStatus("APPROVED")).thenReturn(2L);
        when(claimRepository.countByStatus("REJECTED")).thenReturn(1L);

        assertEquals(4L, claimsService.countClaimsByStatus("PENDING"));
        assertEquals(2L, claimsService.countClaimsByStatus("APPROVED"));
        assertEquals(1L, claimsService.countClaimsByStatus("REJECTED"));
    }
}
