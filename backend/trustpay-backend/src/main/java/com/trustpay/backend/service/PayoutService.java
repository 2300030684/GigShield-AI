package com.trustpay.backend.service;

import com.trustpay.backend.model.Claim;
import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.model.WorkerZoneLog;
import com.trustpay.backend.repository.ClaimRepository;
import com.trustpay.backend.repository.WorkerZoneLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PayoutService {

    private final ClaimRepository claimRepository;
    private final WorkerZoneLogRepository zoneLogRepository;
    private final GeospatialService geospatialService;

    /**
     * CORE: Evaluates a potential claim using the 5-signal AI verification system
     */
    public Claim evaluateClaim(String workerId, DisruptionEvent event) {
        Optional<WorkerZoneLog> latestLog = zoneLogRepository.findLatestByWorkerId(workerId);

        // -- Signal 1: Active Status (Mock check) --
        String activeStatus = latestLog.isPresent() ? "VERIFIED" : "FAILED";

        // -- Signal 2: H3 Zone Presence --
        String h3Presence = "MISMATCH";
        if (latestLog.isPresent() && latestLog.get().getH3Index().equals(event.getH3Index())) {
            h3Presence = "MATCHED";
        }

        // -- Signal 3: Route Impact --
        double routeImpact = Math.random() * 0.4 + 0.6; // Mock 60-100% impact

        // -- Signal 4: Activity Drop --
        double activityDrop = 0.42; // Mock 42% drop vs baseline

        // -- Signal 5: Peer Anomaly --
        String peerAnomaly = "CORROBORATED";

        // Calculate Confidence Score
        int confidence = calculateConfidence(activeStatus, h3Presence, routeImpact, activityDrop, peerAnomaly);

        Claim claim = Claim.builder()
                .workerId(workerId)
                .eventType(event.getType())
                .h3Index(event.getH3Index())
                .estimatedLoss(450.0)
                .approvedPayout(338.0)
                .activeStatusSignal(activeStatus)
                .h3PresenceSignal(h3Presence)
                .routeImpactScore(routeImpact)
                .activityDropSignal(activityDrop)
                .peerAnomalySignal(peerAnomaly)
                .confidenceScore(confidence)
                .status(confidence >= 85 ? "APPROVED" : "REVIEW")
                .processingTime(LocalDateTime.now())
                .build();

        return claimRepository.save(claim);
    }

    private int calculateConfidence(String active, String h3, double route, double drop, String peer) {
        double score = 0;
        if (active.equals("VERIFIED")) score += 25;
        if (h3.equals("MATCHED")) score += 30;
        score += route * 15;
        score += drop * 20;
        if (peer.equals("CORROBORATED")) score += 10;
        return (int) Math.round(score);
    }

    public Claim processPayout(String claimId) {
        return claimRepository.findByClaimId(claimId).map(claim -> {
            claim.setStatus("PAID");
            claim.setUpiTxnId("TXN-AUTO-" + System.currentTimeMillis());
            return claimRepository.save(claim);
        }).orElseThrow(() -> new RuntimeException("Claim not found"));
    }
}
