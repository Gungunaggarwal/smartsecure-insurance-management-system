package com.smartcourier.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.dto.PolicyResponse;
import com.smartcourier.admin.dto.PolicyUpdateRequest;
import com.smartcourier.admin.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for controller unit testing
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void reviewClaim_ShouldReturnString() throws Exception {
        AdminReviewRequest request = new AdminReviewRequest();
        request.setStatus("APPROVED");
        request.setComments("Looks good");

        when(adminService.reviewClaim(anyLong(), any(AdminReviewRequest.class)))
                .thenReturn("Claim reviewed successfully.");

        mockMvc.perform(post("/api/v1/admin/claims/1/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Claim reviewed successfully."));
    }

    @Test
    void updateClaim_ShouldReturnClaimResponse() throws Exception {
        ClaimResponse response = new ClaimResponse();
        response.setId(1L);
        response.setStatus("UPDATED");

        when(adminService.updateClaim(anyLong(), anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/admin/claims/1")
                        .param("description", "New desc")
                        .param("status", "UPDATED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("UPDATED"));
    }

    @Test
    void deleteClaim_ShouldReturnString() throws Exception {
        doNothing().when(adminService).deleteClaim(anyLong());

        mockMvc.perform(delete("/api/v1/admin/claims/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Claim 1 deleted successfully."));
    }

    @Test
    void getClaimsStats_ShouldReturnMap() throws Exception {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", 10L);

        when(adminService.getClaimsStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/admin/claims/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10L));
    }

    @Test
    void updatePolicy_ShouldReturnPolicyResponse() throws Exception {
        PolicyResponse response = new PolicyResponse();
        response.setId(1L);

        when(adminService.updatePolicy(anyLong(), any(PolicyUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/admin/policies/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PolicyUpdateRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void deletePolicy_ShouldReturnString() throws Exception {
        doNothing().when(adminService).deletePolicy(anyLong());

        mockMvc.perform(delete("/api/v1/admin/policies/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Policy 1 deleted successfully."));
    }
}
