package com.trustpay.backend.controller;

import com.trustpay.backend.model.Claim;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.ClaimRepository;
import com.trustpay.backend.repository.UserRepository;
import com.trustpay.backend.service.ClaimTriggerService;
import com.trustpay.backend.service.PayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimTriggerService claimTriggerService;
    private final PayoutService payoutService;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory() {
        User user = getCurrentUser();
        List<Claim> claims = claimRepository.findByWorkerIdOrderByCreatedAtDesc(user.getWorkerId());
        return ResponseEntity.ok(Map.of("claims", claims));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        User user = getCurrentUser();
        List<Claim> claims = claimRepository.findByWorkerId(user.getWorkerId());
        
        double totalPaid = claims.stream()
                .filter(c -> "PAID".equalsIgnoreCase(c.getClaimStatus()) || "APPROVED".equalsIgnoreCase(c.getClaimStatus()))
                .mapToDouble(c -> c.getPayoutAmount() != null ? c.getPayoutAmount() : 0.0)
                .sum();

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        double thisWeekProtected = claims.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(oneWeekAgo))
                .filter(c -> "PAID".equalsIgnoreCase(c.getClaimStatus()) || "APPROVED".equalsIgnoreCase(c.getClaimStatus()))
                .mapToDouble(c -> c.getPayoutAmount() != null ? c.getPayoutAmount() : 0.0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPaid", totalPaid);
        stats.put("totalClaims", claims.size());
        stats.put("thisWeekProtected", thisWeekProtected);
        stats.put("thisWeekEarnings", 4500.0); // Would need income log repo
        stats.put("claimSuccessRate", claims.isEmpty() ? 100 : 
            (int)(claims.stream().filter(c -> !"REJECTED".equalsIgnoreCase(c.getClaimStatus())).count() * 100 / claims.size()));
        stats.put("recentClaims", claims.stream().limit(5).collect(Collectors.toList()));
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/initiate")
    public ResponseEntity<Claim> initiateClaim(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        Claim claim = Claim.builder()
                .workerId(user.getWorkerId())
                .eventType((String) payload.getOrDefault("event", "Rain"))
                .h3Index(user.getZone())
                .claimStatus("PENDING")
                .estimatedLoss(250.0)
                .aiConfidenceScore(85.0)
                .build();
        
        return ResponseEntity.ok(claimRepository.save(claim));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Claim> confirmClaim(@RequestBody Map<String, String> payload) {
        String claimId = payload.get("claimID");
        Claim claim = claimRepository.findByClaimId(claimId).orElseThrow();
        claim.setClaimStatus("APPROVED");
        claim.setPayoutAmount(claim.getEstimatedLoss() != null ? claim.getEstimatedLoss() : 150.0);
        
        // Trigger payout logic
        payoutService.processPayoutForClaim(claim);
        
        return ResponseEntity.ok(claimRepository.save(claim));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }
}
