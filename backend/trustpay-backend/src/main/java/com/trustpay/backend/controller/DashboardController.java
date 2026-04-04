package com.trustpay.backend.controller;

import com.trustpay.backend.dto.AdminMetricsDTO;
import com.trustpay.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final AdminService adminService;

    @GetMapping("/cards")
    public ResponseEntity<Map<String, Object>> getDashboardCards() {
        AdminMetricsDTO metrics = adminService.getAdminMetrics();
        AdminMetricsDTO.AdminData d = metrics.getAdminData();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", d.getTotalUsers());
        response.put("activeWorkers", d.getTotalUsers()); // Simplified
        response.put("liveDisruptions", d.getZonesFlagged());
        response.put("claimsProcessed", d.getClaimsThisMonth());
        response.put("totalPayouts", d.getPlatformRevenue()); // Using total revenue as total payouts for demo
        response.put("weeklyPremium", 350);
        response.put("fraudAlerts", d.getFraudPreventedCases());
        response.put("notifications", 18);
        
        return ResponseEntity.ok(response);
    }
}
