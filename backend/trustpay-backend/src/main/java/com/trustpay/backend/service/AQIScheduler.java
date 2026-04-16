package com.trustpay.backend.service;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AQIScheduler {

    private final DisruptionService disruptionService;
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    // Runs every 30 minutes
    @Scheduled(fixedRate = 1800000)
    public void fetchAqiDisruptions() {
        log.info("Starting live AQI ingestion...");
        
        // Example coordinates (Hyderabad)
        double lat = 17.3850;
        double lng = 78.4867;
        String token = "YOUR_WAQI_TOKEN"; // Should be in application.properties
        
        try {
            String url = "https://api.waqi.info/feed/geo:" + lat + ";" + lng + "/?token=" + token;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && "ok".equals(response.get("status"))) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                Object aqiObj = data.get("aqi");
                double aqi = Double.parseDouble(aqiObj.toString());
                
                log.info("Current AQI for ({}, {}): {}", lat, lng, aqi);

                if (aqi > 300.0) {
                    log.warn("T3 TRIGGER: Severe air pollution detected ({} AQI)! Triggering parametric payout.", aqi);
                    disruptionService.simulateDisruptionWithDuration("AQI", lat, lng, aqi, 4.0);
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch AQI data: {}", e.getMessage());
        }
    }
}
