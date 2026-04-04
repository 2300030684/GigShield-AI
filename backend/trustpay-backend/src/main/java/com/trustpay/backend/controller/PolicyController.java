package com.trustpay.backend.controller;

import com.trustpay.backend.model.Policy;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.PolicyRepository;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PolicyController {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;

    @GetMapping("/plans")
    public ResponseEntity<Map<String, Object>> getPlans() {
        // Return structured plans expected by PlansPage
        List<Map<String, Object>> plans = Arrays.asList(
                createPlan("lite", "Lite Plan", 15.0, 1500.0, Arrays.asList("Rain"), "Delayed (~2h)"),
                createPlan("standard", "Standard Plan", 25.0, 3500.0, Arrays.asList("Rain", "AQI", "Traffic"), "Direct UPI (~45m)"),
                createPlan("pro", "Pro Plan", 40.0, 6000.0, Arrays.asList("Rain", "AQI", "Traffic", "Heat", "ShutDown"), "Instant (<15m)")
        );
        
        return ResponseEntity.ok(Map.of(
            "plans", plans,
            "recommendedPlan", "standard",
            "userZoneRisk", 55
        ));
    }

    @GetMapping("/my-policy")
    public ResponseEntity<Policy> getMyPolicy() {
        User user = getCurrentUser();
        return ResponseEntity.of(policyRepository.findByWorkerIdAndStatus(user.getWorkerId(), "ACTIVE"));
    }

    @PostMapping("/activate")
    public ResponseEntity<Policy> activatePlan(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        String planId = (String) body.get("plan");
        
        // Deactivate old policies
        policyRepository.findByWorkerIdAndStatus(user.getWorkerId(), "ACTIVE").ifPresent(p -> {
            p.setStatus("CANCELLED");
            policyRepository.save(p);
        });

        Double premium = 25.0;
        Double coverage = 3500.0;

        if ("custom".equalsIgnoreCase(planId)) {
            premium = Double.valueOf(body.getOrDefault("weeklyPremium", 25.0).toString());
            coverage = Double.valueOf(body.getOrDefault("maxCoverage", 3500.0).toString());
        } else if ("pro".equalsIgnoreCase(planId)) {
            premium = 40.0;
            coverage = 6000.0;
        } else if ("lite".equalsIgnoreCase(planId)) {
            premium = 15.0;
            coverage = 1500.0;
        }

        Policy policy = Policy.builder()
                .workerId(user.getWorkerId())
                .planType(planId.toUpperCase())
                .status("ACTIVE")
                .weeklyPremium(premium)
                .maxCoverage(coverage)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusWeeks(1))
                .autoRenew(true)
                .build();

        return ResponseEntity.ok(policyRepository.save(policy));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    private Map<String, Object> createPlan(String id, String name, double premium, double coverage, List<String> events, String payoutTime) {
        Map<String, Object> p = new HashMap<>();
        p.put("id", id);
        p.put("name", name);
        p.put("weeklyPremium", premium);
        p.put("maxWeeklyCoverage", coverage);
        p.put("events", events);
        p.put("payoutTime", payoutTime);
        p.put("claimsPerMonth", id.equals("pro") ? 999 : 4);
        p.put("features", Arrays.asList("AI Verification", "Zero-Touch Claims"));
        return p;
    }
}
