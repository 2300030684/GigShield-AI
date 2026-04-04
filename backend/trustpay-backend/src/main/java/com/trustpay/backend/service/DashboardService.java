package com.trustpay.backend.service;

import com.trustpay.backend.dto.DashboardStatsDTO;
import com.trustpay.backend.model.UserActivityLog;
import com.trustpay.backend.repository.ClaimRepository;
import com.trustpay.backend.repository.TransactionRepository;
import com.trustpay.backend.repository.UserActivityLogRepository;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final UserActivityLogRepository activityLogRepository;
    private final ClaimRepository claimRepository;
    private final TransactionRepository transactionRepository;

    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = activityLogRepository.countActiveUsers();

        // Get today's logins
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<UserActivityLog> todayActivities = activityLogRepository.findTop50ByOrderByTimestampDesc()
                .stream()
                .filter(log -> log.getTimestamp().isAfter(startOfDay) && "LOGIN".equals(log.getAction()))
                .collect(Collectors.toList());
        long todayLogins = todayActivities.size();

        long totalClaims = claimRepository.count();
        long totalTransactions = transactionRepository.count();

        // Roles breakdown (assuming roles are ROLE_WORKER, ROLE_ADMIN, etc.)
        Map<String, Long> userRolesBreakdown = new HashMap<>();
        userRepository.findAll().forEach(user -> {
            userRolesBreakdown.put(user.getRole(), userRolesBreakdown.getOrDefault(user.getRole(), 0L) + 1);
        });

        // Recent activity simplified mapped object
        List<Map<String, Object>> recentActivity = activityLogRepository.findTop50ByOrderByTimestampDesc().stream()
                .limit(10)
                .map(log -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("username", log.getUsername());
                    map.put("action", log.getAction());
                    map.put("time", log.getTimestamp());
                    return map;
                }).collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .todayLogins(todayLogins)
                .totalClaims(totalClaims)
                .totalTransactions(totalTransactions)
                .userRolesBreakdown(userRolesBreakdown)
                .recentActivity(recentActivity)
                .build();
    }
}
