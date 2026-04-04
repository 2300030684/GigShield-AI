package com.trustpay.backend.repository;

import com.trustpay.backend.model.FraudCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FraudCaseRepository extends JpaRepository<FraudCase, Long> {
    List<FraudCase> findByStatus(String status);
}
