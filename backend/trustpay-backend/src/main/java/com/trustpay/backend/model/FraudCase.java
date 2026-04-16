package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "fraud_cases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String claimId;
    private String workerName;
    private String city;
    private String reason; // e.g., "GPS Mismatch"
    
    private Integer score; // 0-100
    private String status; // PENDING, APPROVED, REJECTED
    private String aiVerdict;
    private String flag;

    @ElementCollection
    private List<String> findings;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
