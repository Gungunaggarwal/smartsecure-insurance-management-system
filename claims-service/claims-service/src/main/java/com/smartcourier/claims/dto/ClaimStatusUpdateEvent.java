package com.smartcourier.claims.dto;

import lombok.Data;

@Data
public class ClaimStatusUpdateEvent {
    private Long claimId;
    private String status;
}