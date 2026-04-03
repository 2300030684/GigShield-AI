package com.trustpay.backend.controller;

import com.trustpay.backend.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PricingController {

    private static final Logger log = LoggerFactory.getLogger(PricingController.class);
    private final WeatherService weatherService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> predictPremium(@RequestBody Map<String, Object> data) {
        log.info("Calculating real-time premium for worker risk profiles...");

        double lat = (double) data.getOrDefault("lat", 17.4726);
        double lng = (double) data.getOrDefault("lng", 78.3572);

        // 1. Fetch REAL Weather & AQI
        Map<String, Object> weather = weatherService.getWeather(lat, lng);
        Map<String, Object> aqi = weatherService.getAQI(lat, lng);

        double rain = (Double) weather.getOrDefault("rainfall", 0.0);
        int aqiValue = (Integer) aqi.getOrDefault("aqi", 1);
        double temp = (Double) weather.getOrDefault("temp", 30.0);

        // 2. Base Pricing Logic (ML Heuristic)
        double basePremium = 35.0; // Standard daily premium
        
        // Multipliers
        double rainMultiplier = 1.0 + (rain / 50.0); // 1.0 - 2.0x
        double aqiMultiplier = 1.0 + (aqiValue * 0.1); // 1.1 - 1.5x
        double trafficMultiplier = getTrafficMultiplier();

        double finalPremium = basePremium * rainMultiplier * aqiMultiplier * trafficMultiplier;

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("basePremium", Math.round(basePremium * 100.0) / 100.0);
        response.put("finalPremium", Math.round(finalPremium * 100.0) / 100.0);
        response.put("factors", Map.of(
            "rainfall", rain,
            "aqi", aqiValue,
            "traffic", trafficMultiplier,
            "temp", temp
        ));

        return ResponseEntity.ok(response);
    }

    private double getTrafficMultiplier() {
        LocalTime now = LocalTime.now();
        // Peak hours: 8-10 AM, 6-9 PM
        if ((now.getHour() >= 8 && now.getHour() <= 10) || (now.getHour() >= 18 && now.getHour() <= 21)) {
            return 1.4; // High traffic
        }
        return 1.0;
    }
}
