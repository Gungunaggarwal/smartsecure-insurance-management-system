package com.smartcourier.claims.controller;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.service.ClaimsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimsController {

    private final ClaimsService claimsService;

    @PostMapping("/upload-document")
    public ResponseEntity<String> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-Username") String username) {
        String path = claimsService.uploadDocument(file, username);
        return new ResponseEntity<>(path, HttpStatus.OK);
    }

    @PostMapping("/initiate-claim")
    public ResponseEntity<ClaimResponse> initiateClaim(
            @Valid @RequestBody ClaimInitiateRequest request,
            @RequestHeader("X-Username") String username) {
        return new ResponseEntity<>(claimsService.initiateClaim(request, username), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/track")
    public ResponseEntity<ClaimResponse> trackClaim(@PathVariable("id") Long id) {
        return new ResponseEntity<>(claimsService.trackClaim(id), HttpStatus.OK);
    }
}
