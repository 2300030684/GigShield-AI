package com.trustpay.backend.service;

import com.trustpay.backend.dto.ActivityRequest;
import com.trustpay.backend.model.User;
import com.trustpay.backend.model.UserActivityLog;
import com.trustpay.backend.repository.UserActivityLogRepository;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final UserActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public UserActivityLog logActivity(ActivityRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        UserActivityLog lastActivity = activityLogRepository.findFirstByUserIdOrderByTimestampDesc(user.getId()).orElse(null);
        
        UserActivityLog log = UserActivityLog.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .action(request.getAction())
                .pageName(request.getPageName())
                .ipAddress(request.getIpAddress())
                .deviceInfo(request.getDeviceInfo())
                .timestamp(LocalDateTime.now())
                .isOnline(true)
                .build();

        if (lastActivity != null && "LOGIN".equals(lastActivity.getAction()) && !"LOGOUT".equals(request.getAction())) {
            log.setLoginTime(lastActivity.getLoginTime() != null ? lastActivity.getLoginTime() : lastActivity.getTimestamp());
        } else if ("LOGIN".equals(request.getAction())) {
            log.setLoginTime(LocalDateTime.now());
        }

        if ("LOGOUT".equals(request.getAction())) {
            log.setLogoutTime(LocalDateTime.now());
            log.setIsOnline(false);
            if (lastActivity != null && lastActivity.getLoginTime() != null) {
                long duration = ChronoUnit.SECONDS.between(lastActivity.getLoginTime(), LocalDateTime.now());
                log.setSessionDuration(duration);
            }
        }

        return activityLogRepository.save(log);
    }

    public List<UserActivityLog> getRecentActivities() {
        return activityLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<UserActivityLog> getUserActivities(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<UserActivityLog> getLiveUsers() {
        // Simple representation: returning latest activities marked as online
        return activityLogRepository.findByIsOnlineTrue();
    }
}
