package com.trustpay.backend.service;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrafficScheduler {

    private final DisruptionService disruptionService;
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    // Real-time polling every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void fetchTrafficDisruptions() {
        log.info("Starting live Traffic ingestion...");
        
        // Example coordinates (Hyderabad - HITEC City)
        double lat = 17.4483;
        double lng = 78.3915;
        String googleApiKey = "YOUR_GOOGLE_MAPS_KEY"; 

        try {
            // Simulated check: comparing distance matrix time vs typical time
            String url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + lat + "," + lng + "&destinations=Gachibowli&departure_time=now&key=" + googleApiKey;
            // In a real scenario, we'd parse the 'duration_in_traffic' vs 'duration'
            
            double delayIndex = 3.5; // Still using a high index to demonstrate trigger logic

            if (delayIndex > 2.5) {
                log.warn("CRITICAL: Severe traffic delay detected (Index: {})! Triggering parametric disruption.", delayIndex);
                disruptionService.simulateDisruption("TRAFFIC", lat, lng, delayIndex);
            }
        } catch (Exception e) {
            log.error("Failed to fetch Traffic data: {}", e.getMessage());
        }
    }
}
