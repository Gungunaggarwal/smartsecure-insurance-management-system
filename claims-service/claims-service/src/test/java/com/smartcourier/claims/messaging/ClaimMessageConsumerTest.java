package com.smartcourier.claims.messaging;

import com.smartcourier.claims.dto.ClaimStatusUpdateEvent;
import com.smartcourier.claims.service.ClaimsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimMessageConsumerTest {

    @Mock
    private ClaimsService claimsService;

    @InjectMocks
    private ClaimMessageConsumer consumer;

    @Test
    void handleStatusUpdate_Success() {
        ClaimStatusUpdateEvent event = new ClaimStatusUpdateEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");

        consumer.handleStatusUpdate(event);

        verify(claimsService, times(1)).updateClaimStatus(1L, "APPROVED");
    }

    @Test
    void handleStatusUpdate_Exception() {
        ClaimStatusUpdateEvent event = new ClaimStatusUpdateEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");

        doThrow(new RuntimeException("Error")).when(claimsService).updateClaimStatus(anyLong(), anyString());

        // Should just log and not throw
        consumer.handleStatusUpdate(event);

        verify(claimsService, times(1)).updateClaimStatus(1L, "APPROVED");
    }
}
