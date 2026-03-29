package com.smartcourier.admin.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Feign interceptor that forwards X-Username and X-Role headers to all outbound
 * Feign calls (e.g. to claims-service). Falls back to hardcoded internal-service
 * credentials when the caller (e.g. Swagger) does not supply them, so that
 * claims-service never rejects the internal call with 403.
 */
@Component
public class FeignClientInterceptor implements RequestInterceptor {

    private static final String X_USERNAME             = "X-Username";
    private static final String X_ROLE                 = "X-Role";
    private static final String INTERNAL_USERNAME      = "admin-service";
    private static final String INTERNAL_ROLE          = "ADMIN";

    @Override
    public void apply(RequestTemplate template) {
        String username = INTERNAL_USERNAME;
        String role     = INTERNAL_ROLE;

        // Prefer forwarding the actual caller's headers when present
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String incomingUsername = request.getHeader(X_USERNAME);
            String incomingRole     = request.getHeader(X_ROLE);
            if (incomingUsername != null) username = incomingUsername;
            if (incomingRole     != null) role     = incomingRole;
        }

        template.header(X_USERNAME, username);
        template.header(X_ROLE,     role);
    }
}

