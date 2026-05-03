package com.smartcourier.claims.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "policy-service", path = "/api/v1/policies")
public interface PolicyClient {

    @GetMapping("/{id}")
    Object getPolicyById(@PathVariable("id") Long id);

    @GetMapping("/user/{username}")
    java.util.List<Object> getPoliciesByUsername(@PathVariable("username") String username);
}
