package com.trustpay.backend.repository;

import com.trustpay.backend.model.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    List<UserActivityLog> findByUserIdOrderByTimestampDesc(Long userId);
    
    @Query("SELECT COUNT(DISTINCT u.userId) FROM UserActivityLog u WHERE u.isOnline = true")
    Long countActiveUsers();
    
    List<UserActivityLog> findTop50ByOrderByTimestampDesc();

    // Gets the last known activity for a user
    Optional<UserActivityLog> findFirstByUserIdOrderByTimestampDesc(Long userId);

    List<UserActivityLog> findByIsOnlineTrue();
}
