package com.trustpay.backend.service;

import com.trustpay.backend.dto.AdminMetricsDTO;
import com.trustpay.backend.model.*;
import com.trustpay.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final FraudCaseRepository fraudCaseRepository;
    private final TransactionRepository transactionRepository;

    public AdminMetricsDTO getAdminMetrics() {
        long totalUsers = userRepository.count();
        long activePolicies = policyRepository.count();
        long claimsThisMonth = claimRepository.count(); // Simplified to total for now

        List<Claim> allClaims = claimRepository.findAll();
        double avgPayout = allClaims.stream()
                .mapToDouble(c -> c.getPayoutAmount() != null ? c.getPayoutAmount() : 0.0)
                .average()
                .orElse(0.0);

        List<FraudCase> rejectedCases = fraudCaseRepository.findByStatus("REJECTED");
        double fraudPreventedValue = 0.0; // Would need claim link
        int fraudPreventedCases = rejectedCases.size();

        double platformRevenue = transactionRepository.findAll().stream()
                .filter(t -> "PREMIUM".equals(t.getTransactionType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        // City distribution (Mocked logic based on Users)
        List<AdminMetricsDTO.CityStat> cityDistribution = Arrays.asList(
                AdminMetricsDTO.CityStat.builder().city("Hyderabad").users(totalUsers).claims(claimsThisMonth).build(),
                AdminMetricsDTO.CityStat.builder().city("Bangalore").users(0L).claims(0L).build()
        );

        // Claims Trend (Last 7 days)
        List<Map<String, Object>> claimsTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            Map<String, Object> day = new HashMap<>();
            day.put("day", LocalDateTime.now().minusDays(i).getDayOfWeek().name().substring(0, 3));
            day.put("filed", (int)(Math.random() * 10 + 5));
            day.put("approved", (int)(Math.random() * 5 + 2));
            claimsTrend.add(day);
        }

        // Fraud Breakdown
        List<Map<String, Object>> fraudBreakdown = Arrays.asList(
                createMap("name", "GPS Mismatch", "value", 42, "color", "#FF4D6A"),
                createMap("name", "Velocity Fraud", "value", 28, "color", "#FF8C42"),
                createMap("name", "Duplicate Claim", "value", 19, "color", "#FFD166"),
                createMap("name", "Other", "value", 11, "color", "#8899BB")
        );

        // Recent Activity
        List<Map<String, Object>> recentActivity = transactionRepository.findAll().stream()
                .sorted(Comparator.comparing(Transaction::getTransactionTime).reversed())
                .limit(5)
                .map(t -> {
                    Map<String, Object> a = new HashMap<>();
                    a.put("user", "Worker-" + t.getWorkerId());
                    a.put("city", "Hyderabad");
                    a.put("amount", t.getAmount());
                    a.put("status", t.getStatus());
                    a.put("time", t.getTransactionTime().toString());
                    return a;
                })
                .collect(Collectors.toList());

        return AdminMetricsDTO.builder()
                .adminData(AdminMetricsDTO.AdminData.builder()
                        .totalUsers(totalUsers)
                        .activePolicies(activePolicies)
                        .claimsThisMonth(claimsThisMonth)
                        .avgPayout(Math.round(avgPayout * 100.0) / 100.0)
                        .fraudPreventedValue(24500.0) // Mocked
                        .fraudPreventedCases(fraudPreventedCases)
                        .platformRevenue(platformRevenue)
                        .cityDistribution(cityDistribution)
                        .zonesFlagged(12)
                        .totalUsersGrowth("+12%")
                        .activePoliciesPercent("84%")
                        .build())
                .adminAnalytics(AdminMetricsDTO.AdminAnalytics.builder()
                        .claimsTrend(claimsTrend)
                        .fraudStatsByType(fraudBreakdown)
                        .riskSummary(Map.of("low", 45, "medium", 38, "high", 17))
                        .recentActivity(recentActivity)
                        .build())
                .build();
    }

    private Map<String, Object> createMap(Object... entries) {
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            map.put(entries[i].toString(), entries[i + 1]);
        }
        return map;
    }
}
