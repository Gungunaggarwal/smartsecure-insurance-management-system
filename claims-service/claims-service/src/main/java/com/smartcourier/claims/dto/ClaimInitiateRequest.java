package com.smartcourier.claims.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimInitiateRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotBlank(message = "Idempotency key cannot be blank")
    private String idempotencyKey;

    private String documentPath; // Optional path for uploaded documents
}
