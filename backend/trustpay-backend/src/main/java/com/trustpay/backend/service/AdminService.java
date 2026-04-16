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
        long claimsThisMonth = claimRepository.count(); 

        List<Claim> allClaims = claimRepository.findAll();
        double avgPayout = allClaims.stream()
                .filter(c -> "PAID".equalsIgnoreCase(c.getClaimStatus()))
                .mapToDouble(c -> c.getPayoutAmount() != null ? c.getPayoutAmount() : 0.0)
                .average()
                .orElse(0.0);

        List<FraudCase> rejectedCases = fraudCaseRepository.findByStatus("REJECTED");
        int fraudPreventedCases = rejectedCases.size();

        double platformRevenue = transactionRepository.findAll().stream()
                .filter(t -> "PREMIUM".equals(t.getTransactionType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        // Real City Distribution
        Map<String, Long> cityCounts = userRepository.findAll().stream()
                .filter(u -> u.getCity() != null)
                .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));
        
        List<AdminMetricsDTO.CityStat> cityDistribution = cityCounts.entrySet().stream()
                .map(e -> AdminMetricsDTO.CityStat.builder()
                        .city(e.getKey())
                        .users(e.getValue())
                        .claims(claimRepository.findAll().stream().filter(c -> {
                             return userRepository.findByWorkerId(c.getWorkerId())
                                     .map(u -> e.getKey().equals(u.getCity()))
                                     .orElse(false);
                        }).count())
                        .build())
                .collect(Collectors.toList());

        // Claims Trend (Last 7 days)
        List<Map<String, Object>> claimsTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime targetDate = LocalDateTime.now().minusDays(i);
            String dayName = targetDate.getDayOfWeek().name().substring(0, 3);
            
            long filed = allClaims.stream()
                    .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().toLocalDate().equals(targetDate.toLocalDate()))
                    .count();
            
            long approved = allClaims.stream()
                    .filter(c -> c.getCreatedAt() != null && 
                                 c.getCreatedAt().toLocalDate().equals(targetDate.toLocalDate()) &&
                                 "APPROVED".equals(c.getClaimStatus()))
                    .count();

            Map<String, Object> day = new HashMap<>();
            day.put("day", dayName);
            day.put("filed", filed);
            day.put("approved", approved);
            claimsTrend.add(day);
        }

        // Fraud Breakdown (Real categories if available, else standard)
        List<Map<String, Object>> fraudBreakdown = Arrays.asList(
                createMap("name", "GPS Mismatch", "value", fraudCaseRepository.countByReason("GPS"), "color", "#FF4D6A"),
                createMap("name", "Velocity Fraud", "value", fraudCaseRepository.countByReason("VELOCITY"), "color", "#FF8C42"),
                createMap("name", "Duplicate Claim", "value", fraudCaseRepository.countByReason("DUPLICATE"), "color", "#FFD166"),
                createMap("name", "Other", "value", fraudCaseRepository.countByReason("OTHER"), "color", "#8899BB")
        );

        // Recent Activity
        List<Map<String, Object>> recentActivity = transactionRepository.findAll().stream()
                .sorted(Comparator.comparing(Transaction::getTransactionTime).reversed())
                .limit(5)
                .map(t -> {
                    Map<String, Object> a = new HashMap<>();
                    String userName = userRepository.findByWorkerId(t.getWorkerId()).map(User::getName).orElse("Worker-" + t.getWorkerId());
                    String city = userRepository.findByWorkerId(t.getWorkerId()).map(User::getCity).orElse("Unknown");
                    a.put("user", userName);
                    a.put("city", city);
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
                        .fraudPreventedValue(fraudPreventedCases * avgPayout) 
                        .fraudPreventedCases(fraudPreventedCases)
                        .platformRevenue(platformRevenue)
                        .cityDistribution(cityDistribution)
                        .zonesFlagged(12) // Static for now
                        .totalUsersGrowth("+5%")
                        .activePoliciesPercent(totalUsers > 0 ? (activePolicies * 100 / totalUsers) + "%" : "0%")
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
