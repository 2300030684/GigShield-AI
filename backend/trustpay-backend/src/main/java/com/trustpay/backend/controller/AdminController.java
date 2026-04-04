package com.trustpay.backend.controller;

import com.trustpay.backend.dto.AdminMetricsDTO;
import com.trustpay.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> getMetrics() {
        return ResponseEntity.ok(adminService.getAdminMetrics());
    }
}
