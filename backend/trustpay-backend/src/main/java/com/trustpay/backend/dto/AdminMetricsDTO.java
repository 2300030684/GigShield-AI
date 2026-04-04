package com.trustpay.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminMetricsDTO {
    private AdminData adminData;
    private AdminAnalytics adminAnalytics;

    @Data
    @Builder
    public static class AdminData {
        private Long totalUsers;
        private Long activePolicies;
        private Long claimsThisMonth;
        private Double avgPayout;
        private Double fraudPreventedValue;
        private Integer fraudPreventedCases;
        private Double platformRevenue;
        private List<CityStat> cityDistribution;
        private Integer zonesFlagged;
        private String totalUsersGrowth;
        private String activePoliciesPercent;
    }

    @Data
    @Builder
    public static class CityStat {
        private String city;
        private Long users;
        private Long claims;
    }

    @Data
    @Builder
    public static class AdminAnalytics {
        private List<Map<String, Object>> claimsTrend;
        private List<Map<String, Object>> fraudStatsByType;
        private Map<String, Integer> riskSummary;
        private List<Map<String, Object>> recentActivity;
    }
}
