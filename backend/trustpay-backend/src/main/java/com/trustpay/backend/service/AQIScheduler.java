package com.trustpay.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AQIScheduler {

    private final DisruptionService disruptionService;

    // Runs every 30 minutes
    @Scheduled(fixedRate = 1800000)
    public void fetchAqiDisruptions() {
        log.info("Starting live AQI ingestion...");
        
        double lat = 17.4726;
        double lng = 78.3572;
        
        // Mocking AQI fetch
        double aqi = 410.0; // Simulated severe AQI for T3 trigger

        if (aqi > 400.0) {
            log.warn("T3 TRIGGER: Severe air pollution detected (>400 AQI)! Triggering parametric payout.");
            disruptionService.simulateDisruptionWithDuration("AQI", lat, lng, aqi, 5.0); // 5 hrs disruption
        }
    }
}
