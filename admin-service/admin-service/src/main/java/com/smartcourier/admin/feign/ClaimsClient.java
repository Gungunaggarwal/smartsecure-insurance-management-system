package com.smartcourier.admin.feign;

import com.smartcourier.admin.dto.ClaimResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "claims-service", path = "/api/v1/claims")
public interface ClaimsClient {

    @GetMapping("/{id}/track")
    ClaimResponse trackClaim(@PathVariable("id") Long id);

    @PutMapping("/{id}")
    ClaimResponse updateClaim(@PathVariable("id") Long id,
                               @RequestParam(value = "description", required = false) String description,
                               @RequestParam(value = "status", required = false) String status);

    @DeleteMapping("/{id}")
    void deleteClaim(@PathVariable("id") Long id);

    @GetMapping("/count")
    long countClaims();

    @GetMapping("/count/status/{status}")
    long countClaimsByStatus(@PathVariable("status") String status);

    @GetMapping
    java.util.List<ClaimResponse> getAllClaims();
}
