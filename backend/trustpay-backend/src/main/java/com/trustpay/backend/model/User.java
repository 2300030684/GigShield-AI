package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role; // ROLE_WORKER, ROLE_ADMIN

    private String workerId; // Swiggy/Zomato ID
    private String status; // ACTIVE, BLOCKED
    private String otp;

    // ── GEOLOCATION DATA ──
    private Double latitude;
    private Double longitude;
    private String city;
    private String zone;
    private String currentH3Index;

    // ── SETTINGS & PROFILE DATA ──
    private String name;
    private String phone;
    private String platform;
    private String vehicleType;
    private String upiId;
    private String panNumber;
    private Boolean isOnboardingComplete;
    private Boolean coveragePaused;
    
    // ── AGGREGATE STATS (Mock defaults set on creation) ──
    private Integer protectionScore;
    private Double earningsProtectedTotal;
    private Integer totalClaims;
    private Double totalPaid;
    private String memberSince;
    private Integer activeDays;
    private Double rewardsBalance;
    
    // AI/ML Fields
    @Builder.Default
    private Double baseHourlyRate = 120.0; // INR per hour
    @Builder.Default
    private String riskTier = "LOW"; // LOW, MEDIUM, HIGH

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (coveragePaused == null) coveragePaused = false;
        if (isOnboardingComplete == null) isOnboardingComplete = false;
        
        // Setup initial default stats to give a realistic dashboard feel for new users
        if (protectionScore == null) protectionScore = 85;
        if (earningsProtectedTotal == null) earningsProtectedTotal = 5000.0;
        if (totalClaims == null) totalClaims = 2;
        if (totalPaid == null) totalPaid = 1200.0;
        if (memberSince == null) memberSince = "April 2026";
        if (activeDays == null) activeDays = 14;
    }
}
