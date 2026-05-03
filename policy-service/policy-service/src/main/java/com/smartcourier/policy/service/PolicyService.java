package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.entity.UserPolicy;
import com.smartcourier.policy.repository.PolicyRepository;
import com.smartcourier.policy.repository.UserPolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final UserPolicyRepository userPolicyRepository;

    // ─── Create ──────────────────────────────────────────────────────────────
    @CacheEvict(value = "policies", allEntries = true)
    public PolicyResponse createPolicy(PolicyRequest request) {
        log.info("Creating new policy: {} with type: {}", request.getName(), request.getType());
        Policy policy = Policy.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basePremium(request.getBasePremium())
                .type(request.getType() != null ? request.getType() : "GENERAL")
                .build();
        Policy saved = policyRepository.save(policy);
        log.info("Policy created successfully with ID: {} and cache evicted", saved.getId());
        return mapToResponse(saved);
    }

    // ─── Read All ────────────────────────────────────────────────────────────
    @Cacheable(value = "policies", key = "'all_policies'")
    public List<PolicyResponse> getPolicies() {
        log.debug("Fetching all policies from database (Cache miss if this logs)");
        return policyRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public PolicyResponse getPolicyById(Long id) {
        log.info("Fetching policy details for ID: {}", id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        return mapToResponse(policy);
    }

    // ─── Update ──────────────────────────────────────────────────────────────
    @CacheEvict(value = {"policies", "premium"}, allEntries = true)
    public PolicyResponse updatePolicy(Long id, PolicyRequest request) {
        log.info("Updating policy ID: {}", id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        if (request.getName() != null && !request.getName().isBlank()) {
            policy.setName(request.getName());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            policy.setDescription(request.getDescription());
        }
        if (request.getBasePremium() != null) {
            log.info("Updating base premium for policy {} to {}", id, request.getBasePremium());
            policy.setBasePremium(request.getBasePremium());
        }
        if (request.getType() != null && !request.getType().isBlank()) {
            policy.setType(request.getType());
        }
        Policy saved = policyRepository.save(policy);
        log.info("Policy {} updated successfully and cache evicted", id);
        return mapToResponse(saved);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────
    @CacheEvict(value = {"policies", "premium"}, allEntries = true)
    public void deletePolicy(Long id) {
        log.info("Deleting policy ID: {}", id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        policyRepository.delete(policy);
        log.info("Policy {} deleted successfully and cache evicted", id);
    }

    // ─── Premium / Purchase ──────────────────────────────────────────────────
    @Cacheable(value = "premium", key = "#id")
    public BigDecimal calculatePremium(Long id) {
        log.debug("Calculating premium for policy ID: {} (Cache miss if this logs)", id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        return policy.getBasePremium().multiply(BigDecimal.valueOf(1.05));
    }

    public String purchasePolicy(Long id, String username) {
        log.info("User '{}' purchasing policy ID: {}", username, id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        BigDecimal calculatedPremium = calculatePremium(id);

        // Record the purchase if a username is provided
        if (username != null && !username.isBlank()) {
            UserPolicy userPolicy = UserPolicy.builder()
                    .username(username)
                    .policy(policy)
                    .purchasedAt(LocalDateTime.now())
                    .build();
            userPolicyRepository.save(userPolicy);
            log.info("Purchase recorded for user '{}', policy '{}'.", username, policy.getName());
        }
        return "Successfully purchased policy '" + policy.getName() + "' for amount: " + calculatedPremium;
    }

    // ─── Get Purchased Policies by Username ──────────────────────────────────
    public List<PolicyResponse> getPoliciesByUsername(String username) {
        log.info("Fetching purchased policies for user: {}", username);
        return userPolicyRepository.findByUsername(username).stream()
                .map(up -> mapToResponse(up.getPolicy()))
                .toList();
    }

    // ─── Count ───────────────────────────────────────────────────────────────
    public long countPolicies() {
        return policyRepository.count();
    }

    public long countPoliciesByType(String type) {
        return policyRepository.countByType(type);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────
    private PolicyResponse mapToResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .name(policy.getName())
                .description(policy.getDescription())
                .basePremium(policy.getBasePremium())
                .type(policy.getType())
                .build();
    }
}
