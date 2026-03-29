package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.feign.PolicyClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private ClaimsClient claimsClient;

    @Mock
    private PolicyClient policyClient;

    @Mock
    private ClaimEventProducer claimEventProducer;

    @InjectMocks
    private AdminService adminService;

    private AdminReviewRequest testRequest;
    private ClaimResponse testClaim;

    @BeforeEach
    void setUp() {
        testRequest = new AdminReviewRequest();
        testRequest.setStatus("APPROVED");

        testClaim = ClaimResponse.builder()
                .id(1L)
                .status("PENDING")
                .build();
    }

    @Test
    void reviewClaim_Success() {
        when(claimsClient.trackClaim(1L)).thenReturn(testClaim);

        String result = adminService.reviewClaim(1L, testRequest);

        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);
        verify(claimsClient, times(1)).trackClaim(1L);
        verify(claimEventProducer, times(1)).sendClaimStatusUpdate(1L, "APPROVED");
    }

    @Test
    void reviewClaimFallback_ShouldReturnFallbackMessage() {
        RuntimeException ex = new RuntimeException("Service down");

        String result = adminService.reviewClaimFallback(1L, testRequest, ex);

        assertEquals("Claims Service is currently unavailable. Review request has been locally logged but not processed.", result);
    }

    @Test
    void reviewClaim_RejectedStatus_ShouldSucceed() {
        AdminReviewRequest rejectRequest = new AdminReviewRequest();
        rejectRequest.setStatus("REJECTED");
        rejectRequest.setComments("Fraudulent claim");

        when(claimsClient.trackClaim(2L)).thenReturn(testClaim);

        String result = adminService.reviewClaim(2L, rejectRequest);

        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);
        verify(claimEventProducer, times(1)).sendClaimStatusUpdate(1L, "REJECTED");
    }

    @Test
    void getClaimsStats_ShouldReturnAllCounts() {
        when(claimsClient.countClaims()).thenReturn(10L);
        when(claimsClient.countClaimsByStatus("PENDING")).thenReturn(5L);
        when(claimsClient.countClaimsByStatus("APPROVED")).thenReturn(3L);
        when(claimsClient.countClaimsByStatus("REJECTED")).thenReturn(2L);

        java.util.Map<String, Long> stats = adminService.getClaimsStats();

        assertEquals(10L, stats.get("total"));
        assertEquals(5L, stats.get("pending"));
        assertEquals(3L, stats.get("approved"));
        assertEquals(2L, stats.get("rejected"));
    }

    @Test
    void getClaimsStatsFallback_ShouldReturnNegativeValues() {
        RuntimeException ex = new RuntimeException("Unavailable");

        java.util.Map<String, Long> stats = adminService.getClaimsStatsFallback(ex);

        assertEquals(-1L, stats.get("total"));
        assertEquals(-1L, stats.get("pending"));
    }

    @Test
    void updateClaim_ShouldDelegatToClaimsClient() {
        ClaimResponse updated = ClaimResponse.builder().id(1L).status("APPROVED").build();
        when(claimsClient.updateClaim(1L, "new desc", "APPROVED")).thenReturn(updated);

        ClaimResponse result = adminService.updateClaim(1L, "new desc", "APPROVED");

        assertEquals("APPROVED", result.getStatus());
        verify(claimsClient, times(1)).updateClaim(1L, "new desc", "APPROVED");
    }

    @Test
    void deleteClaim_ShouldDelegateToClaimsClient() {
        adminService.deleteClaim(1L);

        verify(claimsClient, times(1)).deleteClaim(1L);
    }

    @Test
    void updatePolicy_ShouldDelegateToPolicyClient() {
        com.smartcourier.admin.dto.PolicyResponse policyResp =
                new com.smartcourier.admin.dto.PolicyResponse(1L, "Updated", "Desc",
                        java.math.BigDecimal.valueOf(600), "HEALTH");
        com.smartcourier.admin.dto.PolicyUpdateRequest req =
                new com.smartcourier.admin.dto.PolicyUpdateRequest(
                        "Updated", "Desc", java.math.BigDecimal.valueOf(600), "HEALTH");

        when(policyClient.updatePolicy(1L, req)).thenReturn(policyResp);

        com.smartcourier.admin.dto.PolicyResponse result = adminService.updatePolicy(1L, req);

        assertEquals("Updated", result.getName());
        verify(policyClient, times(1)).updatePolicy(1L, req);
    }

    @Test
    void deletePolicy_ShouldDelegateToPolicyClient() {
        adminService.deletePolicy(1L);

        verify(policyClient, times(1)).deletePolicy(1L);
    }
}
