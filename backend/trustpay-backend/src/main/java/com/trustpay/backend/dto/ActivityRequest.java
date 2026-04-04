package com.trustpay.backend.dto;

import lombok.Data;

@Data
public class ActivityRequest {
    private String action;
    private String pageName;
    private String ipAddress;
    private String deviceInfo;
}
