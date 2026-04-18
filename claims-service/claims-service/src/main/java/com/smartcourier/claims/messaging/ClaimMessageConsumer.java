package com.smartcourier.claims.messaging;

import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.smartcourier.claims.dto.ClaimStatusUpdateEvent;
import com.smartcourier.claims.service.ClaimsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaimMessageConsumer {

    private final ClaimsService claimsService;

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "claim.status.queue", durable = "true"),
            exchange = @Exchange(value = "claim.exchange"),
            key = "claim.routing.key"
    ))
    public void handleStatusUpdate(ClaimStatusUpdateEvent event) {

        Long claimId = event.getClaimId();
        String status = event.getStatus();

        log.info("Received claim status update from Admin -> ID: {}, new status: {}", claimId, status);

        try {
            claimsService.updateClaimStatus(claimId, status);
            log.info("Claim status successfully updated in database.");
        } catch (RuntimeException ex) {
            log.error("Failed to update claim status for ID: {}. Business/Runtime Error: {}", claimId, ex.getMessage(), ex);
            throw ex; // Re-throw to allow rabbitmq retry or DLQ logic if configured
        } catch (Exception ex) {
            log.warn("Unexpected non-runtime error during claim update for ID: {}: {}", claimId, ex.getMessage());
            throw new RuntimeException("Unexpected error during claim status update", ex);
        }
    }
}
