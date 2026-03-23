package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.repository.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private PolicyService policyService;

    private Policy testPolicy;
    private PolicyRequest testRequest;

    @BeforeEach
    void setUp() {
        testPolicy = Policy.builder()
                .id(1L)
                .name("Test Policy")
                .description("Test Description")
                .type("GENERAL")
                .basePremium(BigDecimal.valueOf(500))
                .build();

        testRequest = new PolicyRequest();
        testRequest.setName("Test Policy");
        testRequest.setDescription("Test Description");
        testRequest.setType("GENERAL");
        testRequest.setBasePremium(BigDecimal.valueOf(500));
    }

    @Test
    void createPolicy_ShouldSaveAndReturnResponse() {
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyResponse result = policyService.createPolicy(testRequest);

        assertNotNull(result);
        assertEquals(testPolicy.getId(), result.getId());
        assertEquals(testPolicy.getName(), result.getName());
        verify(policyRepository, times(1)).save(any(Policy.class));
    }

    @Test
    void getPolicies_ShouldReturnListofResponses() {
        when(policyRepository.findAll()).thenReturn(List.of(testPolicy));

        List<PolicyResponse> result = policyService.getPolicies();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testPolicy.getName(), result.get(0).getName());
        verify(policyRepository, times(1)).findAll();
    }

    @Test
    void purchasePolicy_ShouldReturnSuccessMessage() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));

        String result = policyService.purchasePolicy(1L);

        assertTrue(result.contains("Successfully purchased policy 'Test Policy' for amount:"));
        verify(policyRepository, times(2)).findById(1L); // Called in purchasePolicy and calculatePremium
    }

}
