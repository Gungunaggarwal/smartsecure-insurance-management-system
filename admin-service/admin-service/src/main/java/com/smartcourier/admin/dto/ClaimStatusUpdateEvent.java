package com.smartcourier.admin.dto;

import lombok.Data;

@Data
public class ClaimStatusUpdateEvent {
    private Long claimId;
    private String status;
}