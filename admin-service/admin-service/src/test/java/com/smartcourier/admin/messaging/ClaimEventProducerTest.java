package com.smartcourier.admin.messaging;

import com.smartcourier.admin.dto.ClaimStatusUpdateEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ClaimEventProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private ClaimEventProducer claimEventProducer;

    @Test
    void sendClaimStatusUpdate_ShouldSendEvent() {
        // Arrange
        Long claimId = 1L;
        String status = "APPROVED";

        // Act
        claimEventProducer.sendClaimStatusUpdate(claimId, status);

        // Assert
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(RabbitMQConfig.ROUTING_KEY),
                any(ClaimStatusUpdateEvent.class)
        );
    }
}
