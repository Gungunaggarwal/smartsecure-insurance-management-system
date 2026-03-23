package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private ClaimsClient claimsClient;

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

}
