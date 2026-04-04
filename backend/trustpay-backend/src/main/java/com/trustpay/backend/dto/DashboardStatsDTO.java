package com.trustpay.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalUsers;
    private long activeUsers;
    private long todayLogins;
    private long totalClaims;
    private long totalTransactions;
    
    // Detailed analytics
    private Map<String, Long> userRolesBreakdown;
    private List<Map<String, Object>> recentActivity;
    private List<Map<String, Object>> monthlyReports;
}
