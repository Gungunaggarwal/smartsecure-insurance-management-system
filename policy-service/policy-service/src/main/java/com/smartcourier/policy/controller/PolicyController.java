package com.smartcourier.policy.controller;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    /** Create policy — ADMIN ONLY */
    @PostMapping
    public ResponseEntity<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        log.info("Received request to create policy: {}", request.getName());
        return new ResponseEntity<>(policyService.createPolicy(request), HttpStatus.CREATED);
    }

    /** Get all policies — ADMIN + CUSTOMER */
    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getPolicies() {
        log.info("Received request to get all policies");
        return ResponseEntity.ok(policyService.getPolicies());
    }

    /** Get single policy by ID */
    @GetMapping("/{id}")
    public ResponseEntity<PolicyResponse> getPolicyById(@PathVariable Long id) {
        log.info("Received request to get policy ID: {}", id);
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    /** Update policy — ADMIN ONLY */
    @PutMapping("/{id}")
    public ResponseEntity<PolicyResponse> updatePolicy(@PathVariable Long id,
                                                        @RequestBody PolicyRequest request) {
        log.info("Received request to update policy ID: {}", id);
        return ResponseEntity.ok(policyService.updatePolicy(id, request));
    }

    /** Delete policy — ADMIN ONLY */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePolicy(@PathVariable Long id) {
        log.info("Received request to delete policy ID: {}", id);
        policyService.deletePolicy(id);
        return ResponseEntity.ok("Policy " + id + " deleted successfully.");
    }

    /** Purchase policy — CUSTOMER ONLY */
    @PostMapping("/{id}/purchase")
    public ResponseEntity<String> purchasePolicy(@PathVariable Long id,
                                                  @RequestHeader(value = "X-Username", required = false) String username) {
        log.info("Received request to purchase policy ID: {} by user: {}", id, username);
        return ResponseEntity.ok(policyService.purchasePolicy(id, username));
    }

    /** Get purchased policies by username */
    @GetMapping("/user/{username}")
    public ResponseEntity<List<PolicyResponse>> getPoliciesByUsername(@PathVariable String username) {
        log.info("Received request to fetch purchased policies for user: {}", username);
        return ResponseEntity.ok(policyService.getPoliciesByUsername(username));
    }

    /** Count all policies */
    @GetMapping("/count")
    public ResponseEntity<Long> countPolicies() {
        log.info("Received request to count all policies");
        return ResponseEntity.ok(policyService.countPolicies());
    }

    /** Count policies by type */
    @GetMapping("/count/type/{type}")
    public ResponseEntity<Long> countPoliciesByType(@PathVariable String type) {
        log.info("Received request to count policies of type: {}", type);
        return ResponseEntity.ok(policyService.countPoliciesByType(type));
    }
}