package com.smartcourier.admin.controller;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/claims/{id}/review")
    public ResponseEntity<String> reviewClaim(@PathVariable Long id, @Valid @RequestBody AdminReviewRequest request) {
        return new ResponseEntity<>(adminService.reviewClaim(id, request), HttpStatus.OK);
    }
}
