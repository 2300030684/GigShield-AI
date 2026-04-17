package com.trustpay.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "insurance_products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category; // e.g., "Health", "Life", "Auto"

    private BigDecimal monthlyPremium;
    private BigDecimal coverageAmount;
    private String iconName; // Lucide icon name or image path
    
    @Builder.Default
    private boolean active = true;
}
