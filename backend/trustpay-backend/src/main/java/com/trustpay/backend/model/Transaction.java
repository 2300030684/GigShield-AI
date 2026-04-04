package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String txnId;

    @Column(nullable = false)
    private String workerId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String transactionType; // Modified from type

    @Column(nullable = false)
    private String status; // COMPLETED, PENDING, FAILED

    private String method; // UPI, WALLET, BANK

    private Boolean parametricPayout; // New field

    private String description;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime transactionTime; // Modified from timestamp

    @PrePersist
    protected void onCreate() {
        transactionTime = LocalDateTime.now();
        if (txnId == null) txnId = "TXN-" + System.currentTimeMillis();
    }
}
