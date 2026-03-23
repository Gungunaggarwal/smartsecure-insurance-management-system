package com.smartcourier.claims.service;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.entity.Claim;
import com.smartcourier.claims.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClaimsService {

    private final ClaimRepository claimRepository;
    private final FileStorageUtil fileStorageUtil;

    public String uploadDocument(MultipartFile file, String username) {
        return fileStorageUtil.storeFile(file, username);
    }

    public ClaimResponse initiateClaim(ClaimInitiateRequest request, String username) {
        // Idempotency Check
        Optional<Claim> existingClaim = claimRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (existingClaim.isPresent()) {
            return mapToResponse(existingClaim.get());
        }

        Claim claim = Claim.builder()
                .username(username)
                .policyId(request.getPolicyId())
                .description(request.getDescription())
                .idempotencyKey(request.getIdempotencyKey())
                .documentPath(request.getDocumentPath())
                .status("PENDING")
                .build();

        Claim saved = claimRepository.save(claim);
        return mapToResponse(saved);
    }

    public ClaimResponse trackClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        return mapToResponse(claim);
    }
    
    public void updateClaimStatus(Long id, String status) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        claim.setStatus(status);
        claimRepository.save(claim);
    }

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
