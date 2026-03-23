package com.smartcourier.admin;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import com.smartcourier.admin.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class AdminServiceIntegrationTest {

    @Autowired
    private AdminService adminService;

    @MockBean
    private ClaimsClient claimsClient;

    @MockBean
    private ClaimEventProducer claimEventProducer;

    @Test
    void reviewClaim_IntegrationFlow_Success() {
        // Mocking external Feign call
        ClaimResponse claimResponse = ClaimResponse.builder()
                .id(1L)
                .status("PENDING")
                .build();
        when(claimsClient.trackClaim(1L)).thenReturn(claimResponse);

        // Admin Review Request
        AdminReviewRequest request = new AdminReviewRequest();
        request.setStatus("APPROVED");

        String result = adminService.reviewClaim(1L, request);

        // Verify result
        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);

        // Verify interactions
        verify(claimsClient, times(1)).trackClaim(1L);
        verify(claimEventProducer, times(1)).sendClaimStatusUpdate(1L, "APPROVED");
    }
}
