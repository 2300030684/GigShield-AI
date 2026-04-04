package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String claimId;

    @Column(nullable = false)
    private String workerId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String h3Index;

    private Long disruptionEventId; // Matches DisruptionEvent id

    private Double estimatedLoss;
    private Double payoutAmount; // Modified from approvedPayout

    // ── 5-SIGNAL AI VERIFICATION DATA ──
    private String activeStatusSignal; // VERIFIED, FAILED
    private String h3PresenceSignal; // MATCHED, MISMATCH
    private Double routeImpactScore; // 0.0 - 1.0 (transit delay)
    private Double activityDropSignal; // % drop vs baseline
    private String peerAnomalySignal; // CORROBORATED, OUTLIER

    private Double aiConfidenceScore; // 0.0 - 100.0 (Modified from confidenceScore)
    private String claimStatus; // APPROVED, REJECTED, REVIEW, PAID (Modified from status)

    private String upiTxnId;
    private LocalDateTime processingTime;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (processingTime == null) processingTime = LocalDateTime.now();
        if (claimId == null) claimId = "TP-EXT-" + System.currentTimeMillis();
    }
}
