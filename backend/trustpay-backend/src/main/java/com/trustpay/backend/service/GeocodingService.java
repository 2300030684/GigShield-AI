package com.trustpay.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private final RestTemplate restTemplate;

    /**
     * Reverse geocodes coordinates to get City and Area/Zone
     * Returns Map with keys: city, zone
     */
    public Map<String, String> reverseGeocode(double lat, double lng) {
        String url = String.format("https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f", lat, lng);
        
        try {
            log.info("Reverse geocoding: {} , {}", lat, lng);
            Map response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("address")) {
                Map address = (Map) response.get("address");
                
                String city = (String) address.getOrDefault("city", 
                              address.getOrDefault("town", 
                              address.getOrDefault("village", "Unknown City")));
                
                String zone = (String) address.getOrDefault("suburb", 
                              address.getOrDefault("neighbourhood", 
                              address.getOrDefault("county", city)));
                              
                return Map.of("city", city, "zone", zone);
            }
        } catch (Exception e) {
            log.error("Geocoding failed: {}", e.getMessage());
        }
        
        return Map.of("city", "Hyderabad", "zone", "Kondapur"); // Fallback
    }
}
