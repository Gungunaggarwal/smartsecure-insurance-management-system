package com.smartcourier.admin.controller;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.dto.PolicyResponse;
import com.smartcourier.admin.dto.PolicyUpdateRequest;
import com.smartcourier.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ─── Claims Management ───────────────────────────────────────────────────

    /** Review and approve/reject a claim (fires RabbitMQ event) */
    @PostMapping("/claims/{id}/review")
    public ResponseEntity<String> reviewClaim(@PathVariable Long id,
                                               @Valid @RequestBody AdminReviewRequest request) {
        log.info("Admin received review request for claim ID: {} with status: {}", id, request.getStatus());
        return ResponseEntity.ok(adminService.reviewClaim(id, request));
    }

    /** Update a claim's description and/or status */
    @PutMapping("/claims/{id}")
    public ResponseEntity<ClaimResponse> updateClaim(
            @PathVariable Long id,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "status", required = false) String status) {
        log.info("Admin received request to update claim ID: {} with status: {}", id, status);
        return ResponseEntity.ok(adminService.updateClaim(id, description, status));
    }

    /** Permanently delete a claim */
    @DeleteMapping("/claims/{id}")
    public ResponseEntity<String> deleteClaim(@PathVariable Long id) {
        log.info("Admin received request to DELETE claim ID: {}", id);
        adminService.deleteClaim(id);
        return ResponseEntity.ok("Claim " + id + " deleted successfully.");
    }

    /** Get claim counts: total, pending, approved, rejected */
    @GetMapping("/claims/stats")
    public ResponseEntity<Map<String, Long>> getClaimsStats() {
        log.info("Admin received request for claim statistics");
        return ResponseEntity.ok(adminService.getClaimsStats());
    }

    // ─── Policy Management ───────────────────────────────────────────────────

    /** Update policy details (proxied to policy-service) */
    @PutMapping("/policies/{id}")
    public ResponseEntity<PolicyResponse> updatePolicy(@PathVariable Long id,
                                                        @RequestBody PolicyUpdateRequest request) {
        log.info("Admin received proxy request to update policy ID: {}", id);
        return ResponseEntity.ok(adminService.updatePolicy(id, request));
    }

    /** Delete a policy (proxied to policy-service) */
    @DeleteMapping("/policies/{id}")
    public ResponseEntity<String> deletePolicy(@PathVariable Long id) {
        log.info("Admin received proxy request to DELETE policy ID: {}", id);
        adminService.deletePolicy(id);
        return ResponseEntity.ok("Policy " + id + " deleted successfully.");
    }
}
