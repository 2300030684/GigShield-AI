package com.trustpay.backend.repository;

import com.trustpay.backend.model.InsuranceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsuranceProductRepository extends JpaRepository<InsuranceProduct, Long> {
    List<InsuranceProduct> findByCategory(String category);
    List<InsuranceProduct> findByActiveTrue();
}
