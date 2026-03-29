package com.smartcourier.claims.repository;

import com.smartcourier.claims.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    Optional<Claim> findByIdempotencyKey(String idempotencyKey);
    long countByStatus(String status);
}
