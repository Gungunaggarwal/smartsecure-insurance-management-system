package com.smartcourier.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {
    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/user",
            "/eureka",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-resources",
            "/webjars"
    );

    public boolean isSecured(ServerHttpRequest request) {
        // ✅ Allow all OPTIONS (Preflight) requests to pass through
        if (request.getMethod().name().equals("OPTIONS")) {
            return false;
        }

        return openApiEndpoints
                .stream()
                .noneMatch(uri -> request.getURI().getPath().contains(uri));
    }
}
