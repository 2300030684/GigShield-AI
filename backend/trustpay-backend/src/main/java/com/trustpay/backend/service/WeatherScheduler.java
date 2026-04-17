package com.trustpay.backend.service;

import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   TrustPay Weather Scheduler                         ║
 * ║   @Scheduled every 15 minutes                        ║
 * ║   Loops ALL active user zones (not just Hyderabad)   ║
 * ║   Triggers parametric payouts when thresholds hit    ║
 * ╚══════════════════════════════════════════════════════╝
 */
@Service
@RequiredArgsConstructor
public class WeatherScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeatherScheduler.class);

    private final DisruptionService disruptionService;
    private final WeatherService weatherService;
    private final UserRepository userRepository;

    // ── Thresholds (parametric triggers) ──
    private static final double RAIN_THRESHOLD_MM    = 50.0;  // mm/hr
    private static final double HEAT_THRESHOLD_C     = 45.0;  // °C
    private static final int    AQI_THRESHOLD        = 150;   // AQI index

    /**
     * Runs every 15 minutes.
     * Loops through ALL onboarded users and checks their zone weather.
     * Triggers disruption events when thresholds are exceeded.
     */
    @Scheduled(fixedRate = 900_000)
    public void ingestLiveWeather() {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🌐 [WeatherScheduler] Starting live weather ingestion cycle...");

        List<User> activeWorkers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsOnboardingComplete()))
                .toList();
        log.info("📍 Checking {} active workers across all zones", activeWorkers.size());

        // Track which H3 zones we've already processed to avoid duplicate triggers
        java.util.Set<String> processedZones = new java.util.HashSet<>();

        for (User worker : activeWorkers) {
            double lat = worker.getLatitude() != null ? worker.getLatitude() : 17.4726;
            double lng = worker.getLongitude() != null ? worker.getLongitude() : 78.3572;
            String zoneKey = String.format("%.2f_%.2f", lat, lng);

            if (processedZones.contains(zoneKey)) {
                continue; // Already processed this zone
            }
            processedZones.add(zoneKey);

            try {
                checkWeatherAndTrigger(worker.getUsername(), lat, lng);
            } catch (Exception e) {
                log.error("❌ Failed weather check for worker {}: {}", worker.getUsername(), e.getMessage());
            }
        }

        // ── FALLBACK: Always check Hyderabad demo zone ──
        if (activeWorkers.isEmpty()) {
            log.info("ℹ️  No active workers found. Checking demo zone Hyderabad (17.47, 78.36)...");
            try {
                checkWeatherAndTrigger("DEMO_WORKER", 17.4726, 78.3572);
            } catch (Exception e) {
                log.error("Demo zone check failed: {}", e.getMessage());
            }
        }

        log.info("✅ [WeatherScheduler] Cycle complete. {} unique zones checked.", processedZones.size());
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    /**
     * Also runs every 30 minutes for AQI (air quality) checks.
     * AQI > 150 triggers an AQI disruption event.
     */
    @Scheduled(fixedRate = 1_800_000)
    public void ingestAQIData() {
        log.info("💨 [AQIScheduler] Checking air quality for active zones...");

        List<User> activeWorkers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsOnboardingComplete()))
                .toList();
        java.util.Set<String> processedZones = new java.util.HashSet<>();

        for (User worker : activeWorkers) {
            double lat = worker.getLatitude() != null ? worker.getLatitude() : 17.4726;
            double lng = worker.getLongitude() != null ? worker.getLongitude() : 78.3572;
            String zoneKey = String.format("%.2f_%.2f", lat, lng);

            if (processedZones.contains(zoneKey)) continue;
            processedZones.add(zoneKey);

            try {
                Map<String, Object> aqiData = weatherService.getAQI(lat, lng);
                int aqiValue = toInt(aqiData.getOrDefault("aqi", 1));
                // OWM AQI: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
                // Convert to 0-500 scale for comparison
                int aqiScaled = aqiValue * 50;

                log.info("💨 AQI for zone ({}, {}): OWM={} → Scaled={}", lat, lng, aqiValue, aqiScaled);

                if (aqiValue >= 4) { // Poor or Very Poor
                    log.warn("🚨 T3 TRIGGER: Dangerous AQI ({}) at ({}, {})!", aqiValue, lat, lng);
                    disruptionService.simulateDisruptionWithDuration("AQI_SPIKE", lat, lng, aqiScaled, 2.0);
                }
            } catch (Exception e) {
                log.error("AQI check failed for ({}, {}): {}", lat, lng, e.getMessage());
            }
        }
    }

    // ══════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════

    private void checkWeatherAndTrigger(String workerId, double lat, double lng) {
        Map<String, Object> weather = weatherService.getWeather(lat, lng);
        double rainfall = toDouble(weather.getOrDefault("rainfall", 0.0));
        double temp     = toDouble(weather.getOrDefault("temp", 30.0));
        String event    = (String) weather.getOrDefault("event", "CLEAR");

        log.info("🌡️  Worker={} @ ({}, {}) → Rain={}mm, Temp={}°C, Event={}",
                workerId, String.format("%.4f", lat), String.format("%.4f", lng), rainfall, temp, event);

        if (rainfall > RAIN_THRESHOLD_MM) {
            log.warn("⛈  T1 TRIGGER: Heavy rainfall {}mm > {}mm threshold for worker={}",
                    rainfall, RAIN_THRESHOLD_MM, workerId);
            // Duration scaled to intensity: 50mm = 2hrs, 100mm = 4hrs
            double durationHours = Math.min(rainfall / 25.0, 8.0);
            disruptionService.simulateDisruptionWithDuration("RAIN", lat, lng, rainfall, durationHours);

        } else if (temp > HEAT_THRESHOLD_C) {
            log.warn("☀️  T2 TRIGGER: Extreme heat {}°C > {}°C threshold for worker={}",
                    temp, HEAT_THRESHOLD_C, workerId);
            disruptionService.simulateDisruptionWithDuration("HEATWAVE", lat, lng, temp, 4.0);
        } else {
            log.info("✅  No trigger conditions met (Rain={}mm, Temp={}°C)", rainfall, temp);
        }
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); } catch (Exception e) { return 0.0; }
    }

    private int toInt(Object obj) {
        if (obj == null) return 0;
        if (obj instanceof Number) return ((Number) obj).intValue();
        try { return Integer.parseInt(obj.toString()); } catch (Exception e) { return 0; }
    }
}
