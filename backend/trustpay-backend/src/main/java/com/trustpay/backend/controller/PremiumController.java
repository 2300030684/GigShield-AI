package com.trustpay.backend.controller;

import com.trustpay.backend.service.PremiumPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PremiumController {

    private final PremiumPredictionService premiumService;

    @GetMapping("/calculate")
    public ResponseEntity<?> calculatePremium(@RequestParam Long workerId) {
        double premium = premiumService.calculateNextWeekPremium(workerId);
        return ResponseEntity.ok(Map.of("workerId", workerId, "calculatedPremium", premium));
    }
}
