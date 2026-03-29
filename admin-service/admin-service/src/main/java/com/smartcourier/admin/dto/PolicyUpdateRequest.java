package com.smartcourier.admin.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyUpdateRequest implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private String description;
    private BigDecimal basePremium;
    private String type;
}
