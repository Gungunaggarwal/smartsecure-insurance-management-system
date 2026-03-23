package com.smartcourier.policy.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.service.PolicyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    // ADMIN ONLY
    @PostMapping
    public ResponseEntity<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        return new ResponseEntity<>(policyService.createPolicy(request), HttpStatus.CREATED);
    }

    // ADMIN + CUSTOMER
    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getPolicies() {
        return new ResponseEntity<>(policyService.getPolicies(), HttpStatus.OK);
    }
    // CUSTOMER ONLY
    @PostMapping("/{id}/purchase")
    public ResponseEntity<String> purchasePolicy(@PathVariable Long id) {
        return new ResponseEntity<>(policyService.purchasePolicy(id), HttpStatus.OK);
    }
}