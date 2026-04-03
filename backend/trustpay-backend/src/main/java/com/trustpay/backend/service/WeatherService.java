package com.trustpay.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private final RestTemplate restTemplate;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base}")
    private String apiBase;

    /**
     * Fetches real-time weather for coordinates
     */
    public Map<String, Object> getWeather(double lat, double lng) {
        String url = String.format("%s/weather?lat=%f&lon=%f&appid=%s&units=metric", apiBase, lat, lng, apiKey);
        
        try {
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("main")) {
                Map main = (Map) response.get("main");
                Map wind = (Map) response.get("wind");
                
                // OpenWeather rain might be in rain.1h or rain.3h
                double rain = 0.0;
                if (response.containsKey("rain")) {
                    Map rainMap = (Map) response.get("rain");
                    rain = (Double) rainMap.getOrDefault("1h", 
                           rainMap.getOrDefault("1h", 0.0));
                }

                Map<String, Object> data = new HashMap<>();
                data.put("temp", main.get("temp"));
                data.put("humidity", main.get("humidity"));
                data.put("windSpeed", wind.get("speed"));
                data.put("rainfall", rain);
                data.put("event", getEventLabel(rain, (Double) main.get("temp")));
                
                return data;
            }
        } catch (Exception e) {
            log.error("Weather fetch failed: {}", e.getMessage());
        }
        
        return Map.of("temp", 30.0, "rainfall", 0.0, "event", "Clear"); // Fallback
    }

    /**
     * Fetches real-time AQI for coordinates
     */
    public Map<String, Object> getAQI(double lat, double lng) {
        // Air Pollution API: http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API key}
        String url = String.format("https://api.openweathermap.org/data/2.5/air_pollution?lat=%f&lon=%f&appid=%s", lat, lng, apiKey);
        
        try {
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("list")) {
                java.util.List list = (java.util.List) response.get("list");
                if (!list.isEmpty()) {
                    Map item = (Map) list.get(0);
                    Map main = (Map) item.get("main");
                    return Map.of("aqi", main.get("aqi")); // 1 = Good, 5 = Very Poor
                }
            }
        } catch (Exception e) {
            log.error("AQI fetch failed: {}", e.getMessage());
        }
        
        return Map.of("aqi", 1);
    }

    private String getEventLabel(double rain, double temp) {
        if (rain > 20) return "HEAVY_RAIN";
        if (temp > 42) return "HEATWAVE";
        return "CLEAR";
    }
}
