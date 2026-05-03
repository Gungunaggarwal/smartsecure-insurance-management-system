package com.smartcourier.claims.service;

import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.entity.Claim;
import com.smartcourier.claims.repository.ClaimRepository;
import com.smartcourier.claims.feign.PolicyClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimsService {

    private final ClaimRepository claimRepository;
    private final FileStorageUtil fileStorageUtil;
    private final PolicyClient policyClient;

    // ─── Initiate Claim With Document Upload ─────────────────────────────────
    @Transactional
    public ClaimResponse initiateClaimWithDoc(MultipartFile file, Long policyId,
                                               String description, String username) {
        log.info("Initiating claim with document upload for user: {} and policy: {}", username, policyId);
        
        // 🛡️ VALIDATE POLICY OWNERSHIP (User must have purchased this policy)
        try {
            List<Object> userPolicies = policyClient.getPoliciesByUsername(username);
            boolean ownsPolicy = userPolicies.stream()
                .anyMatch(p -> {
                    if (p instanceof Map) {
                        Object id = ((Map<?, ?>) p).get("id");
                        return id != null && id.toString().equals(policyId.toString());
                    }
                    return false;
                });

            if (!ownsPolicy) {
                log.warn("Claim failed: User {} does not own policy ID {}", username, policyId);
                throw new RuntimeException("You can only file claims for policies you have purchased.");
            }
        } catch (Exception e) {
            if (e instanceof RuntimeException && e.getMessage().contains("purchased")) throw e;
            log.error("Validation error: {}", e.getMessage());
            throw new RuntimeException("Validation failed. Please ensure you own this policy.");
        }

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

    // ─── Get By Username ─────────────────────────────────────────────────────
    public List<ClaimResponse> getClaimsByUsername(String username) {
        log.info("Fetching all claims for user: {}", username);
        return claimRepository.findAllByUsername(username).stream()
                .map(this::mapToResponse)
                .toList();
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

    // ─── Get All Claims (for Admin) ──────────────────────────────────────────
    public List<ClaimResponse> getAllClaims() {
        log.info("Fetching all claims (admin)");
        return claimRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ─── Count ───────────────────────────────────────────────────────────────
    public long countClaims() {
        return claimRepository.count();
    }

    public long countClaimsByStatus(String status) {
        return claimRepository.countByStatus(status);
    }

    public Resource getDocumentResource(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        if (claim.getDocumentPath() == null) {
            throw new RuntimeException("No document attached to this claim");
        }

        try {
            Path filePath = Paths.get(claim.getDocumentPath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
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