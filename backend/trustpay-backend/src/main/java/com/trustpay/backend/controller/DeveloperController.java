package com.trustpay.backend.controller;

import com.trustpay.backend.service.DisruptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/simulate")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeveloperController {

    private final DisruptionService disruptionService;

    @PostMapping("/rain")
    public ResponseEntity<?> simulateRain(
            @RequestBody Map<String, Object> payload) {
        
        double lat = (double) payload.getOrDefault("lat", 17.4726);
        double lng = (double) payload.getOrDefault("lng", 78.3572);
        double intensity = (double) payload.getOrDefault("intensity", 55.0);

        disruptionService.simulateDisruption("RAIN", lat, lng, intensity);

        return ResponseEntity.ok(Map.of("message", "Simulated rain event triggered successfully!"));
    }
}
