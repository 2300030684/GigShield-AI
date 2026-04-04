package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    private String action; // e.g., "LOGIN", "PAGE_VIEW", "CLICK"
    private String pageName; // e.g., "/dashboard", "/claims"

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime timestamp;

    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private Long sessionDuration; // in seconds

    private String ipAddress;
    private String deviceInfo;

    private Boolean isOnline;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
