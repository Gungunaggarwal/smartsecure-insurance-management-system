package com.smartcourier.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long policyId;
    private String username;
    private String description;
    private String status;
    private String documentPath;
    private String idempotencyKey;
}
