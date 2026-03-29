package com.smartcourier.claims.controller;

import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.service.ClaimsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimsController {

    private final ClaimsService claimsService;

    /** Combined endpoint: upload document + initiate claim in one call. */
    @PostMapping(value = "/initiate-claim-with-doc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClaimResponse> initiateClaimWithDoc(
            @RequestParam("file") MultipartFile file,
            @RequestParam("policyId") Long policyId,
            @RequestParam("description") String description,
            @RequestHeader("X-Username") String username) {
        log.info("Received request to initiate claim with document for user: {}", username);
        return new ResponseEntity<>(
                claimsService.initiateClaimWithDoc(file, policyId, description, username),
                HttpStatus.CREATED);
    }

    /** Track a claim by ID */
    @GetMapping("/{id}/track")
    public ResponseEntity<ClaimResponse> trackClaim(@PathVariable("id") Long id) {
        log.info("Received request to track claim ID: {}", id);
        return ResponseEntity.ok(claimsService.trackClaim(id));
    }

    /** Update claim description and/or status */
    @PutMapping("/{id}")
    public ResponseEntity<ClaimResponse> updateClaim(
            @PathVariable Long id,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "status", required = false) String status) {
        log.info("Received request to update claim ID: {} to status: {}", id, status);
        return ResponseEntity.ok(claimsService.updateClaim(id, description, status));
    }

    /** Delete a claim by ID */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClaim(@PathVariable Long id) {
        log.info("Received request to delete claim ID: {}", id);
        claimsService.deleteClaim(id);
        return ResponseEntity.ok("Claim " + id + " deleted successfully.");
    }

    /** Count all claims */
    @GetMapping("/count")
    public ResponseEntity<Long> countClaims() {
        log.info("Received request to count all claims");
        return ResponseEntity.ok(claimsService.countClaims());
    }

    /** Count claims by status (PENDING / APPROVED / REJECTED) */
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> countClaimsByStatus(@PathVariable String status) {
        log.info("Received request to count claims with status: {}", status);
        return ResponseEntity.ok(claimsService.countClaimsByStatus(status));
    }
}
