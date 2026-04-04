package com.trustpay.backend.service;

import com.trustpay.backend.model.UserActivityLog;
import com.trustpay.backend.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserActivityLogRepository activityLogRepository;

    public String generateActivityReportCsv() {
        List<UserActivityLog> activities = activityLogRepository.findAll();
        StringBuilder csvBuilder = new StringBuilder();
        
        // Header
        csvBuilder.append("ID,UserID,Username,Action,PageName,Timestamp,LoginTime,LogoutTime,SessionDuration,IsOnline\n");
        
        // Rows
        for (UserActivityLog log : activities) {
            csvBuilder.append(log.getId()).append(",")
                      .append(log.getUserId()).append(",")
                      .append(log.getUsername()).append(",")
                      .append(log.getAction()).append(",")
                      .append(log.getPageName()).append(",")
                      .append(log.getTimestamp()).append(",")
                      .append(log.getLoginTime() != null ? log.getLoginTime() : "").append(",")
                      .append(log.getLogoutTime() != null ? log.getLogoutTime() : "").append(",")
                      .append(log.getSessionDuration() != null ? log.getSessionDuration() : "").append(",")
                      .append(log.getIsOnline())
                      .append("\n");
        }
        
        return csvBuilder.toString();
    }
}
