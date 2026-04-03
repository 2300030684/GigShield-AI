package com.trustpay.backend.repository;

import com.trustpay.backend.model.DisruptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisruptionEventRepository extends JpaRepository<DisruptionEvent, Long> {
    List<DisruptionEvent> findByH3IndexAndIsActiveTrue(String h3Index);
    List<DisruptionEvent> findByIsActiveTrue();
    Optional<DisruptionEvent> findByTypeAndH3IndexAndIsActiveTrue(String type, String h3Index);
}
