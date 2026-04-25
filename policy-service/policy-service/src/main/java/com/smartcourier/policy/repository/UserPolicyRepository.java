package com.smartcourier.policy.repository;

import com.smartcourier.policy.entity.UserPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPolicyRepository extends JpaRepository<UserPolicy, Long> {
    List<UserPolicy> findByUsername(String username);
    boolean existsByUsernameAndPolicyId(String username, Long policyId);
}
