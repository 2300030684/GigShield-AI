package com.trustpay.backend.repository;

import com.trustpay.backend.model.WorkerZoneLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WorkerZoneLogRepository extends JpaRepository<WorkerZoneLog, Long> {
    @Query(value = "SELECT * FROM worker_zone_logs WHERE worker_id = ?1 ORDER BY timestamp DESC LIMIT 1", nativeQuery = true)
    Optional<WorkerZoneLog> findLatestByWorkerId(String workerId);
}
