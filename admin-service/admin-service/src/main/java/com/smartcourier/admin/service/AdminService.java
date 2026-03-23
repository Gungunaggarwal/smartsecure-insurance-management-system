package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final ClaimsClient claimsClient;
    private final ClaimEventProducer claimEventProducer;

    @CircuitBreaker(name = "claimsService", fallbackMethod = "reviewClaimFallback")
    @Retry(name = "claimsService", fallbackMethod = "reviewClaimFallback")
    public String reviewClaim(Long claimId, AdminReviewRequest request) {
        log.info("Admin tracking claim {}", claimId);
        // Track claim using Feign Client
        ClaimResponse claim = claimsClient.trackClaim(claimId);
        
        log.info("Claim found. Issuing update via RabbitMQ for status: {}", request.getStatus());
        // Since Admin only reviews, we send message to update status
        claimEventProducer.sendClaimStatusUpdate(claim.getId(), request.getStatus());
        
        return "Review submitted successfully. Claim status update initiated via queue.";
    }

    public String reviewClaimFallback(Long claimId, AdminReviewRequest request, Throwable ex) {
        log.error("Failed to reach Claims Service for claim {}, taking fallback path. Error: {}", claimId, ex.getMessage());
        return "Claims Service is currently unavailable. Review request has been locally logged but not processed.";
    }
}
