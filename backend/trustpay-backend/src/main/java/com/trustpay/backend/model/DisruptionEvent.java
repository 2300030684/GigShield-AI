package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "disruption_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisruptionEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventType; // RAIN, AQI, TRAFFIC, SHUTDOWN

    @Column(nullable = false)
    private String h3Index; // Resolution 9 hex index

    private Double intensityValue; // mm/hr or AQI value

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @Builder.Default
    private Double durationHours = 1.0; 

    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (startTime == null) startTime = LocalDateTime.now();
    }
}
