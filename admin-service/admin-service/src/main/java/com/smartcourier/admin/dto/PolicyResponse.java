package com.smartcourier.admin.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal basePremium;
    private String type;
}
