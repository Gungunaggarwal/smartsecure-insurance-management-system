package com.smartcourier.admin.messaging;

import com.smartcourier.admin.dto.ClaimStatusUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendClaimStatusUpdate(Long claimId, String status) {
        log.info("Sending claim status update -> ID: {}, Status: {}", claimId, status);

        ClaimStatusUpdateEvent event = new ClaimStatusUpdateEvent();
        event.setClaimId(claimId);
        event.setStatus(status);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY,
                event
        );
    }
}