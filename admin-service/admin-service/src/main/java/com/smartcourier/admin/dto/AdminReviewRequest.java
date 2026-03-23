package com.smartcourier.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewRequest implements Serializable {
    private static final long serialVersionUID = 1L;
    @NotBlank(message = "Status cannot be blank (APPROVED or REJECTED)")
    private String status;
    private String comments;
}
