package com.smartcourier.claims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private Long policyId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, unique = true) // Idempotency check via unique key
    private String idempotencyKey;

    private String documentPath;

    @Column(nullable = false)
    private String status; // e.g., PENDING, APPROVED, REJECTED
}
