package com.trustpay.backend.controller;

import com.trustpay.backend.model.Claim;
import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.repository.DisruptionEventRepository;
import com.trustpay.backend.service.PayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claim")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClaimController {

    private final PayoutService payoutService;
    private final DisruptionEventRepository eventRepository;

    @PostMapping("/evaluate")
    public ResponseEntity<Claim> evaluate(
            @RequestBody Map<String, Object> payload) {
        
        String workerId = (String) payload.get("workerId");
        Long eventId = ((Number) payload.get("eventId")).longValue();

        DisruptionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        return ResponseEntity.ok(payoutService.evaluateClaim(workerId, event));
    }

    @PostMapping("/payout")
    public ResponseEntity<Claim> payout(
            @RequestBody Map<String, String> payload) {
        
        String claimId = payload.get("claimId");
        return ResponseEntity.ok(payoutService.processPayout(claimId));
    }
}
