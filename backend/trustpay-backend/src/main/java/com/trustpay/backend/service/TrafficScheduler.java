package com.trustpay.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrafficScheduler {

    private final DisruptionService disruptionService;

    // Real-time polling every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void fetchTrafficDisruptions() {
        log.info("Starting live Traffic ingestion...");
        
        double lat = 17.4726;
        double lng = 78.3572;
        
        // Mocking traffic API fetch
        double delayIndex = 3.0; // Assume we fetched 3.0 delay index

        if (delayIndex > 2.5) {
            log.warn("CRITICAL: Severe traffic delay detected! Triggering parametric disruption.");
            disruptionService.simulateDisruption("TRAFFIC", lat, lng, delayIndex);
        }
    }
}
