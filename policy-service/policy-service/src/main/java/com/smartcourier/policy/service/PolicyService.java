package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyResponse createPolicy(PolicyRequest request) {
        Policy policy = Policy.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basePremium(request.getBasePremium())
                .type(request.getType() != null ? request.getType() : "GENERAL")
                .build();
        Policy saved = policyRepository.save(policy);
        return mapToResponse(saved);
    }

    @Cacheable(value = "policies", key = "'all_policies'")
    public java.util.List<PolicyResponse> getPolicies() {
        return policyRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Cacheable(value = "premium", key = "#id")
    public BigDecimal calculatePremium(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        // Mock premium calculation with some complex logic simulation
        return policy.getBasePremium().multiply(BigDecimal.valueOf(1.05)); // 5% tax or something
    }

    public String purchasePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        // Simulate purchasing process
        BigDecimal calculatedPremium = calculatePremium(id);
        return "Successfully purchased policy '" + policy.getName() + "' for amount: " + calculatedPremium;
    }

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
