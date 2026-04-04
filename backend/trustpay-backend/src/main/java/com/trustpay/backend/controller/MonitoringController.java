package com.trustpay.backend.controller;

import com.trustpay.backend.dto.ActivityRequest;
import com.trustpay.backend.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/monitor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MonitoringController {

    private final MonitoringService monitoringService;

    @PostMapping("/activity")
    public ResponseEntity<?> logActivity(@RequestBody ActivityRequest request) {
        return ResponseEntity.ok(monitoringService.logActivity(request));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllRecentActivities() {
        return ResponseEntity.ok(monitoringService.getRecentActivities());
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserActivities(@PathVariable Long id) {
        return ResponseEntity.ok(monitoringService.getUserActivities(id));
    }

    @GetMapping("/live-users")
    public ResponseEntity<?> getLiveUsers() {
        return ResponseEntity.ok(monitoringService.getLiveUsers());
    }
}
