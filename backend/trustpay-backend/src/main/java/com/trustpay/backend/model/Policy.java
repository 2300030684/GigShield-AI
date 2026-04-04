package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String workerId;

    private String planType; // LITE, STANDARD, PRO
    private String status;   // ACTIVE, CANCELLED, EXPIRED
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    private Double weeklyPremium;
    private Double maxCoverage;
    private Boolean autoRenew;
    
    @Builder.Default
    private Double coverageMultiplier = 1.0; // 1.0x, 1.2x etc

    @PrePersist
    protected void onCreate() {
        if (startDate == null) startDate = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }
}
