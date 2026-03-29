package com.smartcourier.claims.controller;

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

    @BeforeEach
    void setUp() {
        testResponse = ClaimResponse.builder()
                .id(1L)
                .policyId(1L)
                .username("johndoe")
                .description("Test description")
                .status("PENDING")
                .documentPath("/tmp/uploads/file.txt")
                .build();
    }

    @Test
    void initiateClaimWithDoc_ShouldReturnCreated() {
        MultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());

        when(claimsService.initiateClaimWithDoc(
                any(MultipartFile.class), eq(1L), eq("Test description"), eq("johndoe")))
                .thenReturn(testResponse);

        ResponseEntity<ClaimResponse> response =
                claimsController.initiateClaimWithDoc(file, 1L, "Test description", "johndoe");

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        assertEquals("PENDING", response.getBody().getStatus());
        assertEquals("/tmp/uploads/file.txt", response.getBody().getDocumentPath());
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

