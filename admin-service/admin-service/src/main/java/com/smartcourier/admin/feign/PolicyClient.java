package com.smartcourier.admin.feign;

import com.smartcourier.admin.dto.PolicyResponse;
import com.smartcourier.admin.dto.PolicyUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "policy-service", path = "/api/v1/policies")
public interface PolicyClient {

    @PutMapping("/{id}")
    PolicyResponse updatePolicy(@PathVariable("id") Long id,
                                 @RequestBody PolicyUpdateRequest request);

    @DeleteMapping("/{id}")
    void deletePolicy(@PathVariable("id") Long id);

    @GetMapping("/count")
    long countPolicies();

    @GetMapping("/count/type/{type}")
    long countPoliciesByType(@PathVariable("type") String type);

    @PostMapping
    PolicyResponse createPolicy(@RequestBody PolicyUpdateRequest request);

    @GetMapping
    java.util.List<PolicyResponse> getPolicies();
}
