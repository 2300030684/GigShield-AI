package com.trustpay.backend.service;

import com.trustpay.backend.model.Claim;
import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   TrustPay AI Model Service                          ║
 * ║   Calls Python Flask ML API for real predictions     ║
 * ║   Falls back to rule-based logic if Flask is down    ║
 * ╚══════════════════════════════════════════════════════╝
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AIModelService {

    private final ClaimRepository claimRepository;
    private final RestTemplate restTemplate;
    private final WeatherService weatherService;

    @Value("${ml.flask.url:http://localhost:5001}")
    private String flaskBaseUrl;

    // ══════════════════════════════════════════════════════
    //  🤖 FLASK ML INTEGRATION — Risk Prediction
    // ══════════════════════════════════════════════════════

    /**
     * Calls Flask /predict-risk endpoint.
     * Returns the full prediction map: risk_score, risk_tier, confidence, etc.
     * Falls back gracefully to rule-based scoring if Flask is unavailable.
     */
    public Map<String, Object> predictRiskFromFlask(User worker, double lat, double lng) {
        log.info("🤖 [ML] Calling Flask risk prediction for worker: {}", worker.getUsername());

        try {
            // Fetch live weather data to pass to ML model
            Map<String, Object> weather = weatherService.getWeather(lat, lng);
            Map<String, Object> aqiData = weatherService.getAQI(lat, lng);

            double rainfall   = toDouble(weather.getOrDefault("rainfall", 0.0));
            double temp       = toDouble(weather.getOrDefault("temp", 30.0));
            double windSpeed  = toDouble(weather.getOrDefault("windSpeed", 10.0));
            double aqi        = toDouble(aqiData.getOrDefault("aqi", 2.0)) * 50; // convert 1-5 to 0-250 scale
            int pastClaims    = worker.getTotalClaims() != null ? worker.getTotalClaims() : 0;
            double zoneRisk   = getZoneRiskScore(worker.getZone());

            // Build feature payload for Flask
            Map<String, Object> payload = new HashMap<>();
            payload.put("rainfall_mm",          rainfall);
            payload.put("temp_celsius",          temp);
            payload.put("aqi_index",             aqi);
            payload.put("wind_speed_kmh",        windSpeed);
            payload.put("zone_risk_score",       zoneRisk);
            payload.put("claim_history_count",   pastClaims);

            // HTTP call to Flask
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    flaskBaseUrl + "/predict-risk",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("✅ [ML] Flask prediction: tier={}, score={}, confidence={}",
                        result.get("risk_tier"),
                        result.get("risk_score"),
                        result.get("confidence"));
                return result;
            }
        } catch (Exception e) {
            log.warn("⚠️  [ML] Flask API unavailable: {}. Using rule-based fallback.", e.getMessage());
        }

        // Rule-based fallback
        return ruleBasedPredict(worker);
    }

    // ══════════════════════════════════════════════════════
    //  🤖 Dynamic Premium Engine
    //  Calls ML prediction first, then applies multiplier
    // ══════════════════════════════════════════════════════

    public double calculateAdjustedPremium(User worker, String zone, double basePremium) {
        log.info("💰 Running AI Dynamic Premium Engine for: {}", worker.getUsername());

        double multiplier = 1.0;

        // Use ML risk score if available
        try {
            Map<String, Object> prediction = predictRiskFromFlask(worker, 17.4726, 78.3572);
            double riskScore = toDouble(prediction.getOrDefault("risk_score", 0.45));
            multiplier += (riskScore * 0.5); // Up to 1.5x premium for HIGH risk
            log.info("📊 ML Risk Score for premium: {} → multiplier: {}", riskScore, multiplier);
        } catch (Exception e) {
            // Rule-based fallback fields
            double zoneRiskFactor = getZoneRiskScore(zone) / 100.0;
            multiplier += (zoneRiskFactor * 0.4);
            int pastClaims = worker.getTotalClaims() != null ? worker.getTotalClaims() : 0;
            if (pastClaims > 5) multiplier += 0.2;
            multiplier += 0.1; // Seasonality buffer
        }

        return Math.round(basePremium * multiplier * 100.0) / 100.0;
    }

    // ══════════════════════════════════════════════════════
    //  🤖 Fraud Detection System
    // ══════════════════════════════════════════════════════

    public Map<String, Object> analyzeFraudRisk(User worker, Claim claim, List<User> neighborsInZone) {
        log.info("🔍 Running Fraud Detection for Claim: {}", claim.getClaimId());

        int riskScore = 0;
        Map<String, Object> findings = new HashMap<>();

        // 1. Peer Comparison — lone claim in an active zone is suspicious
        long peerClaims = neighborsInZone.size();
        if (peerClaims < 2) {
            riskScore += 40;
            findings.put("peer_anomaly", "Lone claim in active H3 zone. High outlier probability.");
        }

        // 2. Velocity fraud check (GPS jump)
        boolean velocityViolated = false; // TODO: Compare GPS log timestamps
        if (velocityViolated) {
            riskScore += 60;
            findings.put("velocity_fraud", "GPS jump detected >120km/h. Possible spoofing.");
        }

        // 3. Duplicate Prevention
        String dedupeHash = UUID.nameUUIDFromBytes(
                (claim.getEventType() + worker.getWorkerId() + claim.getCreatedAt().toLocalDate())
                        .getBytes()
        ).toString();
        findings.put("dedupe_hash", dedupeHash);
        findings.put("fraud_score", riskScore);
        findings.put("verdict", riskScore > 70 ? "REJECT" : riskScore > 40 ? "REVIEW" : "PASS");

        return findings;
    }

    // ══════════════════════════════════════════════════════
    //  🤖 Risk Profiling  (uses ML tier now)
    // ══════════════════════════════════════════════════════

    public String classifyRiskTier(User worker) {
        try {
            Map<String, Object> prediction = predictRiskFromFlask(worker, 17.4726, 78.3572);
            return String.valueOf(prediction.getOrDefault("risk_tier", "MEDIUM"));
        } catch (Exception e) {
            int score = worker.getProtectionScore() != null ? worker.getProtectionScore() : 85;
            if (score > 90) return "LOW";
            if (score > 60) return "MEDIUM";
            return "HIGH";
        }
    }

    // ══════════════════════════════════════════════════════
    //  🤖 7-Day Disruption Forecast (Prophet-style mock)
    // ══════════════════════════════════════════════════════

    public Map<String, Object> predictNextWeekDisruption(String zone) {
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("likelihood",       0.65);
        forecast.put("primary_risk",     "Rainfall Spike");
        forecast.put("recommendation",   "Upgrade to Pro Coverage");
        forecast.put("zone",             zone);
        forecast.put("model",            "TIME_SERIES_MOCK_v1");
        return forecast;
    }

    // ══════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════

    /** Rule-based fallback when Flask is unreachable */
    private Map<String, Object> ruleBasedPredict(User worker) {
        int score = worker.getProtectionScore() != null ? worker.getProtectionScore() : 85;
        double riskScore = (100 - score) / 100.0;
        String tier = riskScore > 0.6 ? "HIGH" : riskScore > 0.3 ? "MEDIUM" : "LOW";

        Map<String, Object> result = new HashMap<>();
        result.put("risk_score",    Math.round(riskScore * 1000.0) / 1000.0);
        result.put("risk_tier",     tier);
        result.put("confidence",    0.70);
        result.put("payout_eligible", riskScore > 0.5);
        result.put("model_type",    "RULE_BASED_JAVA_FALLBACK");
        return result;
    }

    /** Mock H3 zone risk database — replace with DB lookup in production */
    private double getZoneRiskScore(String zone) {
        if (zone == null) return 45.0;
        return switch (zone.toUpperCase()) {
            case "KONDAPUR"    -> 55.0;
            case "HITECH_CITY" -> 60.0;
            case "GACHIBOWLI"  -> 50.0;
            case "BANJARA_HILLS" -> 40.0;
            default            -> 45.0;
        };
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); } catch (Exception e) { return 0.0; }
    }
}
