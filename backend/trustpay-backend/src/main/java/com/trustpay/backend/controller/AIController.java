package com.trustpay.backend.controller;

import com.trustpay.backend.dto.AIInsightsDTO;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.UserRepository;
import com.trustpay.backend.service.AIModelService;
import com.trustpay.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI Controller — exposes ML prediction and insights endpoints.
 * Wires Spring Boot → Flask ML API via AIModelService.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;
    private final AIModelService aiModelService;
    private final UserRepository userRepository;

    // ── GET /api/ai/insights → AI risk insights for current user ──
    @GetMapping("/insights")
    public ResponseEntity<AIInsightsDTO> getInsights() {
        User user = getCurrentUser();
        return ResponseEntity.ok(aiService.getInsights(user));
    }

    // ── GET /api/ai/earnings-forecast → 7-day earnings projection ──
    @GetMapping("/earnings-forecast")
    public ResponseEntity<Map<String, Object>> getForecast() {
        User user = getCurrentUser();
        return ResponseEntity.ok(aiService.getEarningsForecast(user));
    }

    /**
     * POST /api/ai/predict
     * Proxies to Flask ML API for real risk prediction.
     *
     * Request body:
     * {
     *   "lat": 17.4726,
     *   "lng": 78.3572
     * }
     *
     * Response: Full prediction from Flask (risk_score, risk_tier, confidence, etc.)
     */
    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictRisk(@RequestBody(required = false) Map<String, Object> body) {
        User user = getCurrentUser();

        double lat = 17.4726; // Default: Hyderabad
        double lng = 78.3572;

        if (body != null) {
            if (body.containsKey("lat")) lat = toDouble(body.get("lat"));
            if (body.containsKey("lng")) lng = toDouble(body.get("lng"));
        }

        // Use worker's stored GPS if available
        if (user.getLatitude() != null) lat = user.getLatitude();
        if (user.getLongitude() != null) lng = user.getLongitude();

        Map<String, Object> prediction = aiModelService.predictRiskFromFlask(user, lat, lng);
        return ResponseEntity.ok(prediction);
    }

    /**
     * GET /api/ai/risk-tier → Quick risk tier for current user
     */
    @GetMapping("/risk-tier")
    public ResponseEntity<Map<String, Object>> getRiskTier() {
        User user = getCurrentUser();
        String tier = aiModelService.classifyRiskTier(user);
        return ResponseEntity.ok(Map.of(
                "riskTier", tier,
                "worker", user.getUsername(),
                "zone", user.getZone() != null ? user.getZone() : "UNKNOWN"
        ));
    }

    /**
     * GET /api/ai/disruption-forecast?zone=KONDAPUR
     */
    @GetMapping("/disruption-forecast")
    public ResponseEntity<Map<String, Object>> getDisruptionForecast(@RequestParam(defaultValue = "UNKNOWN") String zone) {
        Map<String, Object> forecast = aiModelService.predictNextWeekDisruption(zone);
        return ResponseEntity.ok(forecast);
    }

    // ── PRIVATE HELPERS ──

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); } catch (Exception e) { return 0.0; }
    }
}
