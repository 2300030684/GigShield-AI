package com.trustpay.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PremiumPredictionService {

    public double calculateNextWeekPremium(Long workerId) {
        log.info("Calculating dynamic premium for worker {}", workerId);
        
        // Mock inputs (worker zone, disruption history, forecast weather, vehicle type)
        int historyCount = 2;
        double basePremium = 50.0;
        double forecastRisk = 1.15; // 15% increase due to bad weather
        
        double nextPremium = basePremium * forecastRisk + (historyCount * 5.0);
        
        return nextPremium;
    }

    // Run weekly on Sunday at midnight
    @Scheduled(cron = "0 0 0 * * SUN")
    public void batchCalculateWeeklyPremiums() {
        log.info("Running weekly batch dynamic premium calculation...");
        // Usually, we'd query all workers and process their premiums
    }
}
