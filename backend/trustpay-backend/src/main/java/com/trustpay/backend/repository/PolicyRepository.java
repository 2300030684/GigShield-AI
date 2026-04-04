package com.trustpay.backend.repository;

import com.trustpay.backend.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findByWorkerId(String workerId);
    Optional<Policy> findByWorkerIdAndStatus(String workerId, String status);
}
