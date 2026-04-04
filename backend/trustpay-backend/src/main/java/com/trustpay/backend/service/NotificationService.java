package com.trustpay.backend.service;

import com.trustpay.backend.model.Notification;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.NotificationRepository;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Notification sendNotification(Long userId, String title, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        return notificationRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
