package com.smartcourier.claims.service;

import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.entity.Claim;
import com.smartcourier.claims.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimsService {

    private final ClaimRepository claimRepository;
    private final FileStorageUtil fileStorageUtil;

    // ─── Initiate Claim With Document Upload ─────────────────────────────────
    @Transactional
    public ClaimResponse initiateClaimWithDoc(MultipartFile file, Long policyId,
                                               String description, String username) {
        log.info("Initiating claim with document upload for user: {}", username);
        String documentPath = fileStorageUtil.storeFile(file, username);
        String idempotencyKey = UUID.randomUUID().toString();

        Claim claim = Claim.builder()
                .username(username)
                .policyId(policyId)
                .description(description)
                .idempotencyKey(idempotencyKey)
                .documentPath(documentPath)
                .status("PENDING")
                .build();

        Claim saved = claimRepository.save(claim);
        log.info("Claim saved with ID: {} and documentPath: {}", saved.getId(), saved.getDocumentPath());
        return mapToResponse(saved);
    }

    // ─── Track ───────────────────────────────────────────────────────────────
    public ClaimResponse trackClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        return mapToResponse(claim);
    }

    // ─── Update Description / Status ─────────────────────────────────────────
    public ClaimResponse updateClaim(Long id, String description, String status) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        if (description != null && !description.isBlank()) {
            claim.setDescription(description);
        }
        if (status != null && !status.isBlank()) {
            claim.setStatus(status);
        }
        return mapToResponse(claimRepository.save(claim));
    }

    // ─── Update Status Only (internal use by RabbitMQ consumer) ─────────────
    public void updateClaimStatus(Long id, String status) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        claim.setStatus(status);
        claimRepository.save(claim);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────
    public void deleteClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        claimRepository.delete(claim);
        log.info("Claim {} deleted successfully", id);
    }

    // ─── Count ───────────────────────────────────────────────────────────────
    public long countClaims() {
        return claimRepository.count();
    }

    public long countClaimsByStatus(String status) {
        return claimRepository.countByStatus(status);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────
    private ClaimResponse mapToResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .policyId(claim.getPolicyId())
                .username(claim.getUsername())
                .description(claim.getDescription())
                .status(claim.getStatus())
                .idempotencyKey(claim.getIdempotencyKey())
                .documentPath(claim.getDocumentPath())
                .build();
    }
}