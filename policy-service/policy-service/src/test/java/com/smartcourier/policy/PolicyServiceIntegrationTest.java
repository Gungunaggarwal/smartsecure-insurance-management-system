package com.smartcourier.policy;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.repository.PolicyRepository;
import com.smartcourier.policy.service.PolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PolicyServiceIntegrationTest {

    @Autowired
    private PolicyService policyService;

    @Autowired
    private PolicyRepository policyRepository;

    @BeforeEach
    void setUp() {
        policyRepository.deleteAll();
    }

    @Test
    void createAndGetPolicies_FullFlow_Success() {
        // 1. Create Policy
        PolicyRequest request = new PolicyRequest();
        request.setName("Health Guard");
        request.setDescription("Comprehensive health insurance");
        request.setType("HEALTH");
        request.setBasePremium(BigDecimal.valueOf(1200));

        PolicyResponse response = policyService.createPolicy(request);
        assertNotNull(response.getId());
        assertEquals("Health Guard", response.getName());

        // 2. Get All Policies
        List<PolicyResponse> policies = policyService.getPolicies();
        assertFalse(policies.isEmpty());
        assertEquals(1, policies.size());
        assertEquals("Health Guard", policies.get(0).getName());
    }

    @Test
    void purchasePolicy_Success() {
        // 1. Create Policy to purchase
        Policy policy = Policy.builder()
                .name("Accident Shield")
                .description("Coverage for accidents")
                .type("ACCIDENT")
                .basePremium(BigDecimal.valueOf(500))
                .build();
        policy = policyRepository.save(policy);

        // 2. Purchase Policy
        String result = policyService.purchasePolicy(policy.getId(), "testuser");
        assertTrue(result.contains("Successfully purchased policy 'Accident Shield'"));
    }
}
