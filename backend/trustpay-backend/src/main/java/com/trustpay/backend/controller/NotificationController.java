package com.trustpay.backend.controller;

import com.trustpay.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
    
    // For admin to send notifications
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestParam Long userId, @RequestParam String title, @RequestParam String message) {
        return ResponseEntity.ok(notificationService.sendNotification(userId, title, message));
    }
}
