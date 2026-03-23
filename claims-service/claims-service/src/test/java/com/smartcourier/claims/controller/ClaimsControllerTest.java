package com.smartcourier.claims.controller;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.service.ClaimsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ClaimsControllerTest {

    @Mock
    private ClaimsService claimsService;

    @InjectMocks
    private ClaimsController claimsController;

    private ClaimResponse testResponse;
    private ClaimInitiateRequest testRequest;

    @BeforeEach
    void setUp() {
        testResponse = ClaimResponse.builder()
                .id(1L)
                .policyId(1L)
                .username("johndoe")
                .description("Test description")
                .status("PENDING")
                .build();

        testRequest = new ClaimInitiateRequest();
        testRequest.setPolicyId(1L);
        testRequest.setDescription("Test description");
        testRequest.setIdempotencyKey("uid-test");
    }

    @Test
    void uploadDocument_ShouldReturnOkAndPath() {
        MultipartFile file = new MockMultipartFile("file", "content".getBytes());
        when(claimsService.uploadDocument(any(MultipartFile.class), eq("johndoe"))).thenReturn("/tmp/uploads/file.txt");

        ResponseEntity<String> response = claimsController.uploadDocument(file, "johndoe");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("/tmp/uploads/file.txt", response.getBody());
    }

    @Test
    void initiateClaim_ShouldReturnCreated() {
        when(claimsService.initiateClaim(any(ClaimInitiateRequest.class), eq("johndoe"))).thenReturn(testResponse);

        ResponseEntity<ClaimResponse> response = claimsController.initiateClaim(testRequest, "johndoe");

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void trackClaim_ShouldReturnOk() {
        when(claimsService.trackClaim(eq(1L))).thenReturn(testResponse);

        ResponseEntity<ClaimResponse> response = claimsController.trackClaim(1L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
    }
}
