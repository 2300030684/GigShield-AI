package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_zone_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerZoneLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String workerId;

    @Column(nullable = false)
    private String h3Index;

    private Double latitude;
    private Double longitude;

    private Double speed; // Activity signal
    private String activityStatus; // ACTIVE, DELIVERING, IDLE

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
