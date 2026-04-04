package com.trustpay.backend.service;

import com.trustpay.backend.model.Claim;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FraudScoringService {

    public double calculateFraudProbability(Claim claim) {
        log.info("Calculating fraud probability for claim {}", claim.getId());
        
        double fraudScore = 0.0;
        
        // Signal 1: H3 Zone presence mismatch
        if ("MISMATCH".equals(claim.getH3PresenceSignal())) {
            fraudScore += 40.0;
        }

        // Signal 2: Outlier against peers
        if ("OUTLIER".equals(claim.getPeerAnomalySignal())) {
            fraudScore += 30.0;
        }

        // Signal 3: No activity drop during disruption
        if (claim.getActivityDropSignal() != null && claim.getActivityDropSignal() < 5.0) {
            fraudScore += 20.0; // Suspicious: Worker did not stop working during a supposed severe disruption
        }

        log.info("Calculated fraud probability: {}%", fraudScore);
        return Math.min(fraudScore, 100.0);
    }
}
