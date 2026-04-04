package com.trustpay.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AIInsightsDTO {
    private Integer riskScore;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String riskReason;
    private String safeHours;
    private List<Map<String, Object>> hourlyRisk;
}
