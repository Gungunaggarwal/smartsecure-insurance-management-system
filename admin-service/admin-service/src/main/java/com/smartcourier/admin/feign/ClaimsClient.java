package com.smartcourier.admin.feign;

import com.smartcourier.admin.dto.ClaimResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "claims-service", path = "/api/v1/claims")
public interface ClaimsClient {
    @GetMapping("/{id}/track")
    ClaimResponse trackClaim(@PathVariable("id") Long id);
}
