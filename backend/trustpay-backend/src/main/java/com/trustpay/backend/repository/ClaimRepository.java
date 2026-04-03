package com.trustpay.backend.repository;

import com.trustpay.backend.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    Optional<Claim> findByClaimId(String claimId);
    List<Claim> findByWorkerId(String workerId);
    List<Claim> findByWorkerIdOrderByCreatedAtDesc(String workerId);
}
