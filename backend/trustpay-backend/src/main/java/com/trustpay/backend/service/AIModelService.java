package com.trustpay.backend.service;

import com.trustpay.backend.model.Claim;
import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIModelService {

    private final ClaimRepository claimRepository;

    /**
     * 🤖 Dynamic Premium Engine
     * Simulates Gradient Boosted Trees (XGBoost) logic.
     */
    public double calculateAdjustedPremium(User worker, String zone, double basePremium) {
        log.info("Running AI Dynamic Premium Engine for worker: {}", worker.getUsername());
        
        double multiplier = 1.0;
        
        // Factor 1: Zone Risk Score (H3 Cluster History)
        double zoneRiskFactor = getZoneRiskScore(zone) / 100.0;
        multiplier += (zoneRiskFactor * 0.4); // Up to 1.4x
        
        // Factor 2: Worker Claim History
        int pastClaims = worker.getTotalClaims() != null ? worker.getTotalClaims() : 0;
        if (pastClaims > 5) multiplier += 0.2;
        
        // Factor 3: Seasonality (Mock: Monsoon/Summer adjustment)
        multiplier += 0.1; 

        return Math.round(basePremium * multiplier * 100.0) / 100.0;
    }

    /**
     * 🤖 Fraud Detection System
     * Components: Anomaly Detection, Peer Comparison, Velocity Checks.
     */
    public Map<String, Object> analyzeFraudRisk(User worker, Claim claim, List<User> neighborsInZone) {
        log.info("Running AI Fraud Detection for Claim: {}", claim.getClaimId());
        
        int riskScore = 0;
        Map<String, Object> findings = new HashMap<>();
        
        // 1. Peer Comparison: "If only 1 worker claims in a zone where 50 others did not"
        long peerClaims = neighborsInZone.size();
        if (peerClaims < 2) {
            riskScore += 40;
            findings.put("peer_anomaly", "Lone claim in active H3 zone. High outlier probability.");
        }

        // 2. Velocity Checks: "If worker location jumps impossibly fast"
        // Mock check (comparing last 2 logs)
        boolean velocityViolated = false; // Logic would compare delta-GPS / delta-TIME
        if (velocityViolated) {
            riskScore += 60;
            findings.put("velocity_fraud", "GPS jump detected > 120km/h. Possible spoofing.");
        }

        // 3. Duplicate Prevention: Hash-based deduplication
        String dedupeHash = UUID.nameUUIDFromBytes((claim.getEventType() + worker.getWorkerId() + claim.getCreatedAt().toLocalDate()).getBytes()).toString();
        findings.put("dedupe_hash", dedupeHash);

        findings.put("fraud_score", riskScore);
        findings.put("verdict", riskScore > 70 ? "REJECT" : riskScore > 40 ? "REVIEW" : "PASS");
        
        return findings;
    }

    /**
     * 🤖 Risk Profiling Model
     * Simulates Logistic Regression / Random Forest classification.
     */
    public String classifyRiskTier(User worker) {
        int score = worker.getProtectionScore() != null ? worker.getProtectionScore() : 85;
        if (score > 90) return "LOW";
        if (score > 60) return "MEDIUM";
        return "HIGH";
    }

    /**
     * 🤖 Predictive Disruption Alerts
     * Simulates Time-series forecasting (Prophet/LSTM).
     */
    public Map<String, Object> predictNextWeekDisruption(String zone) {
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("likelihood", 0.65);
        forecast.put("primary_risk", "Rainfall Spike");
        forecast.put("recommendation", "Upgrade to Pro Coverage");
        return forecast;
    }

    private double getZoneRiskScore(String zone) {
        // Mock zone risk database
        return 45.0; // Moderate risk for demo
    }
}
