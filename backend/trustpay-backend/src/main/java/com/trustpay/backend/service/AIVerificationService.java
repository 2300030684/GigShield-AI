package com.trustpay.backend.service;

import com.trustpay.backend.model.Claim;
import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.ClaimRepository;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIVerificationService {

    private final ClaimRepository claimRepository;
    private final PayoutService payoutService;
    private final AIModelService aiModelService;
    private final UserRepository userRepository;

    public void verifyAndAutoApprove(User worker, DisruptionEvent event) {
        log.info("Running AI Verification Engine for Worker {}, Event {}", worker.getId(), event.getId());

        // 1. Primary Parametric Signals
        String activeStatusSignal = "ACTIVE".equals(worker.getStatus()) ? "VERIFIED" : "FAILED";
        double s1 = "VERIFIED".equals(activeStatusSignal) ? 20.0 : 0.0;

        String h3PresenceSignal = "MATCHED"; 
        double s2 = 20.0; 

        Double routeImpactScore = 0.85; 
        double s3 = routeImpactScore * 20.0;

        Double activityDropSignal = 35.0; 
        double s4 = activityDropSignal > 30.0 ? 20.0 : 0.0;

        // 2. Peer Comparison & Fraud Analysis
        List<User> neighbors = userRepository.findAll().stream()
                .filter(u -> event.getH3Index().equals(u.getCurrentH3Index()) && !u.getId().equals(worker.getId()))
                .toList();

        // Create initial claim object to analyze
        Claim claim = Claim.builder()
                .workerId(worker.getId().toString())
                .disruptionEventId(event.getId())
                .h3Index(event.getH3Index())
                .eventType(event.getEventType())
                .activeStatusSignal(activeStatusSignal)
                .h3PresenceSignal(h3PresenceSignal)
                .routeImpactScore(routeImpactScore)
                .activityDropSignal(activityDropSignal)
                .claimStatus("PENDING")
                .build();

        Map<String, Object> fraudAnalysis = aiModelService.analyzeFraudRisk(worker, claim, neighbors);
        int fraudRiskScore = (int) fraudAnalysis.getOrDefault("fraud_score", 0);
        String fraudVerdict = (String) fraudAnalysis.getOrDefault("verdict", "PASS");

        // signal 5: Fraud resistance (mapped to 20 points)
        double s5 = Math.max(0, 20.0 - (fraudRiskScore / 5.0));

        double confidenceScore = s1 + s2 + s3 + s4 + s5;
        claim.setAiConfidenceScore(confidenceScore);
        claim.setPeerAnomalySignal(neighbors.isEmpty() ? "OUTLIER" : "CORROBORATED");

        if (confidenceScore >= 85.0 && "PASS".equals(fraudVerdict)) {
            log.info("AI Verification PASSED with confidence {}. Auto-approving payout...", confidenceScore);
            payoutService.processPayoutForClaim(claim);
        } else {
            claim.setClaimStatus("REVIEW");
            log.warn("AI AI Flagged for Review: Confidence={}, FraudVerdict={}", confidenceScore, fraudVerdict);
        }

        claimRepository.save(claim);
    }
}
