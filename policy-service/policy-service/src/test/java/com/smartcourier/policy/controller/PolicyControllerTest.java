package com.smartcourier.policy.controller;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.service.PolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PolicyControllerTest {

    @Mock
    private PolicyService policyService;

    @InjectMocks
    private PolicyController policyController;

    private PolicyResponse testResponse;
    private PolicyRequest testRequest;

    @BeforeEach
    void setUp() {
        testResponse = PolicyResponse.builder()
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
    void createPolicy_ShouldReturnCreatedResponse() {
        when(policyService.createPolicy(any(PolicyRequest.class))).thenReturn(testResponse);

        ResponseEntity<PolicyResponse> response = policyController.createPolicy(testRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testResponse.getName(), response.getBody().getName());
    }

    @Test
    void getPolicies_ShouldReturnListOfPolicies() {
        when(policyService.getPolicies()).thenReturn(List.of(testResponse));

        ResponseEntity<List<PolicyResponse>> response =
                policyController.getPolicies();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void purchasePolicy_ShouldReturnOk() {
        when(policyService.purchasePolicy(1L)).thenReturn("Success");

        ResponseEntity<String> response = policyController.purchasePolicy(1L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Success", response.getBody());
    }
}
