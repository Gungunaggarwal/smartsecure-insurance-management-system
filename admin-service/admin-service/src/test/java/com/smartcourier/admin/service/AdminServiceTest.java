package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.dto.PolicyResponse;
import com.smartcourier.admin.dto.PolicyUpdateRequest;
import com.smartcourier.admin.exception.CustomAdminException;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.feign.PolicyClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
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

    @Test
    void testReviewClaim() {
        AdminReviewRequest request = new AdminReviewRequest();
        request.setStatus("APPROVED");
        ClaimResponse response = new ClaimResponse();
        response.setId(1L);

        when(claimsClient.trackClaim(1L)).thenReturn(response);

        String result = adminService.reviewClaim(1L, request);

        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);
        verify(claimEventProducer).sendClaimStatusUpdate(1L, "APPROVED");
    }

    @Test
    void testReviewClaimFallback() {
        AdminReviewRequest request = new AdminReviewRequest();
        String result = adminService.reviewClaimFallback(1L, request, new RuntimeException("Error"));
        assertTrue(result.contains("unavailable"));
    }

    @Test
    void testUpdateClaim() {
        ClaimResponse response = new ClaimResponse();
        when(claimsClient.updateClaim(1L, "desc", "PENDING")).thenReturn(response);

        ClaimResponse result = adminService.updateClaim(1L, "desc", "PENDING");

        assertNotNull(result);
        verify(claimsClient).updateClaim(1L, "desc", "PENDING");
    }

    @Test
    void testDeleteClaim() {
        adminService.deleteClaim(1L);
        verify(claimsClient).deleteClaim(1L);
    }

    @Test
    void testGetClaimsStats() {
        when(claimsClient.countClaims()).thenReturn(10L);
        when(claimsClient.countClaimsByStatus("PENDING")).thenReturn(2L);
        when(claimsClient.countClaimsByStatus("APPROVED")).thenReturn(5L);
        when(claimsClient.countClaimsByStatus("REJECTED")).thenReturn(3L);

        Map<String, Long> stats = adminService.getClaimsStats();

        assertEquals(10L, stats.get("total"));
        assertEquals(2L, stats.get("pending"));
        assertEquals(5L, stats.get("approved"));
        assertEquals(3L, stats.get("rejected"));
    }

    @Test
    void testGetClaimsStatsFallback() {
        Map<String, Long> stats = adminService.getClaimsStatsFallback(new RuntimeException("Error"));
        assertEquals(-1L, stats.get("total"));
    }

    @Test
    void testUpdatePolicy() {
        PolicyUpdateRequest request = new PolicyUpdateRequest();
        PolicyResponse response = new PolicyResponse();
        when(policyClient.updatePolicy(1L, request)).thenReturn(response);

        PolicyResponse result = adminService.updatePolicy(1L, request);

        assertNotNull(result);
        verify(policyClient).updatePolicy(1L, request);
    }

    @Test
    void testDeletePolicy() {
        adminService.deletePolicy(1L);
        verify(policyClient).deletePolicy(1L);
    }

    @Test
    void testClaimFallbackResponse() {
        assertThrows(CustomAdminException.class, () -> 
            adminService.claimFallbackResponse(1L, "d", "s", new RuntimeException("Error")));
    }

    @Test
    void testClaimDeleteFallback() {
        assertThrows(CustomAdminException.class, () -> 
            adminService.claimDeleteFallback(1L, new RuntimeException("Error")));
    }

    @Test
    void testPolicyFallbackResponse() {
        assertThrows(CustomAdminException.class, () -> 
            adminService.policyFallbackResponse(1L, new PolicyUpdateRequest(), new RuntimeException("Error")));
    }

    @Test
    void testPolicyDeleteFallback() {
        assertThrows(CustomAdminException.class, () -> 
            adminService.policyDeleteFallback(1L, new RuntimeException("Error")));
    }
}
