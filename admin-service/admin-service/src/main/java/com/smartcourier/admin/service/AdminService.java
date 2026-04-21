package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.dto.PolicyResponse;
import com.smartcourier.admin.dto.PolicyUpdateRequest;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.feign.PolicyClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final ClaimsClient claimsClient;
    private final PolicyClient policyClient;
    private final ClaimEventProducer claimEventProducer;

    // ─── Review Claim ────────────────────────────────────────────────────────
    @CircuitBreaker(name = "claimsService", fallbackMethod = "reviewClaimFallback")
    @Retry(name = "claimsService", fallbackMethod = "reviewClaimFallback")
    public String reviewClaim(Long claimId, AdminReviewRequest request) {
        log.info("Admin tracking claim {}", claimId);
        ClaimResponse claim = claimsClient.trackClaim(claimId);
        log.info("Claim found. Issuing update via RabbitMQ for status: {}", request.getStatus());
        claimEventProducer.sendClaimStatusUpdate(claim.getId(), request.getStatus());
        return "Review submitted successfully. Claim status update initiated via queue.";
    }

    public String reviewClaimFallback(Long claimId, AdminReviewRequest request, Throwable ex) {
        log.error("Failed to reach Claims Service for claim {}: {}", claimId, ex.getMessage());
        return "Claims Service is currently unavailable. Review request has been locally logged but not processed.";
    }

    // ─── Update Claim (description/status via Feign) ─────────────────────────
    @CircuitBreaker(name = "claimsService", fallbackMethod = "claimFallbackResponse")
    public ClaimResponse updateClaim(Long claimId, String description, String status) {
        log.info("Admin updating claim {} to status={}", claimId, status);
        return claimsClient.updateClaim(claimId, description, status);
    }

    // ─── Delete Claim ────────────────────────────────────────────────────────
    @CircuitBreaker(name = "claimsService", fallbackMethod = "claimDeleteFallback")
    public void deleteClaim(Long claimId) {
        log.info("Admin deleting claim {}", claimId);
        claimsClient.deleteClaim(claimId);
    }

    @CircuitBreaker(name = "claimsService", fallbackMethod = "getAllClaimsFallback")
    public java.util.List<ClaimResponse> getAllClaims() {
        log.info("Fetching all claims from claims-service");
        return claimsClient.getAllClaims();
    }

    public java.util.List<ClaimResponse> getAllClaimsFallback(Throwable ex) {
        log.error("Failed to fetch all claims: {}", ex.getMessage());
        return java.util.Collections.emptyList();
    }

    // ─── Claims Stats ────────────────────────────────────────────────────────
    @CircuitBreaker(name = "claimsService", fallbackMethod = "getClaimsStatsFallback")
    public Map<String, Long> getClaimsStats() {
        log.info("Fetching claims statistics from claims-service");
        return Map.of(
                "total",    claimsClient.countClaims(),
                "pending",  claimsClient.countClaimsByStatus("PENDING"),
                "approved", claimsClient.countClaimsByStatus("APPROVED"),
                "rejected", claimsClient.countClaimsByStatus("REJECTED")
        );
    }

    public Map<String, Long> getClaimsStatsFallback(Throwable ex) {
        log.error("Failed to fetch claims stats: {}", ex.getMessage());
        return Map.of("total", -1L, "pending", -1L, "approved", -1L, "rejected", -1L);
    }
    
    // ─── Policy Creation (proxy to policy-service) ───────────────────────────
    @CircuitBreaker(name = "policyService", fallbackMethod = "policyFallbackResponse")
    public PolicyResponse createPolicy(PolicyUpdateRequest request) {
        log.info("Admin creating new policy: {}", request.getName());
        return policyClient.createPolicy(request);
    }

    @CircuitBreaker(name = "policyService", fallbackMethod = "getPoliciesFallback")
    public java.util.List<PolicyResponse> getPolicies() {
        log.info("Fetching all policies from policy-service for admin");
        return policyClient.getPolicies();
    }

    public java.util.List<PolicyResponse> getPoliciesFallback(Throwable ex) {
        log.error("Failed to fetch all policies: {}", ex.getMessage());
        return java.util.Collections.emptyList();
    }

    // ─── Update Policy (proxy to policy-service) ─────────────────────────────
    @CircuitBreaker(name = "policyService", fallbackMethod = "policyFallbackResponse")
    public PolicyResponse updatePolicy(Long policyId, PolicyUpdateRequest request) {
        log.info("Admin updating policy {}", policyId);
        return policyClient.updatePolicy(policyId, request);
    }

    // ─── Delete Policy (proxy to policy-service) ─────────────────────────────
    @CircuitBreaker(name = "policyService", fallbackMethod = "policyDeleteFallback")
    public void deletePolicy(Long policyId) {
        log.info("Admin deleting policy {}", policyId);
        policyClient.deletePolicy(policyId);
    }

    // ─── Fallback Methods ────────────────────────────────────────────────────
    public ClaimResponse claimFallbackResponse(Long id, String d, String s, Throwable ex) {
        log.error("Claims service unavailable for claim {}: {}", id, ex.getMessage());
        throw new RuntimeException("Claims Service is currently unavailable.");
    }

    public void claimDeleteFallback(Long id, Throwable ex) {
        log.error("Claims service unavailable - could not delete claim {}: {}", id, ex.getMessage());
        throw new RuntimeException("Claims Service is currently unavailable.");
    }

    public PolicyResponse policyFallbackResponse(Long id, PolicyUpdateRequest req, Throwable ex) {
        log.error("Policy service unavailable for policy {}: {}", id, ex.getMessage());
        throw new RuntimeException("Policy Service is currently unavailable.");
    }

    public void policyDeleteFallback(Long id, Throwable ex) {
        log.error("Policy service unavailable - could not delete policy {}: {}", id, ex.getMessage());
        throw new RuntimeException("Policy Service is currently unavailable.");
    }
}
