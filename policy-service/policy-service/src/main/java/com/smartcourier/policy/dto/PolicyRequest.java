package com.smartcourier.policy.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class PolicyRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Policy name is required")
    private String name;

    @NotBlank(message = "Policy description is required")
    private String description;

    @NotNull(message = "Base premium is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Premium must be greater than zero")
    private BigDecimal basePremium;

    private String type;
}
