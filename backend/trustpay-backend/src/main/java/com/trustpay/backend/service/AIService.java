package com.trustpay.backend.service;

import com.trustpay.backend.dto.AIInsightsDTO;
import com.trustpay.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIService {

    public AIInsightsDTO getInsights(User user) {
        // Mocked AI logic based on user stats
        int baseRisk = (user.getProtectionScore() != null) ? 100 - user.getProtectionScore() : 45;
        
        List<Map<String, Object>> hourlyRisk = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            Map<String, Object> item = new HashMap<>();
            item.put("hour", String.format("%02d", h));
            int risk = (int)(Math.random() * 40 + 20);
            item.put("risk", risk);
            item.put("level", risk > 50 ? "high" : risk > 35 ? "medium" : "low");
            hourlyRisk.add(item);
        }

        return AIInsightsDTO.builder()
                .riskScore(baseRisk)
                .riskLevel(baseRisk > 60 ? "HIGH" : baseRisk > 30 ? "MEDIUM" : "LOW")
                .riskReason("Strong atmospheric disturbance in " + (user.getZone() != null ? user.getZone() : "Kondapur"))
                .safeHours("08:00 - 14:00")
                .hourlyRisk(hourlyRisk)
                .build();
    }

    public Map<String, Object> getEarningsForecast(User user) {
        List<Map<String, Object>> forecast = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> day = new HashMap<>();
            day.put("day", "Day " + (i + 1));
            day.put("date", "2026-04-" + (03 + i));
            int base = 800 + (int)(Math.random() * 400);
            day.put("expectedEarnings", base);
            day.put("protectedFloor", (int)(base * 0.75));
            forecast.add(day);
        }
        return Map.of("forecast", forecast);
    }
}
