package com.trustpay.backend.controller;

import com.trustpay.backend.dto.AIInsightsDTO;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.UserRepository;
import com.trustpay.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;
    private final UserRepository userRepository;

    @GetMapping("/insights")
    public ResponseEntity<AIInsightsDTO> getInsights() {
        User user = getCurrentUser();
        return ResponseEntity.ok(aiService.getInsights(user));
    }

    @GetMapping("/earnings-forecast")
    public ResponseEntity<Map<String, Object>> getForecast() {
        User user = getCurrentUser();
        return ResponseEntity.ok(aiService.getEarningsForecast(user));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }
}
