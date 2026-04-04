package com.trustpay.backend.service;

import com.trustpay.backend.model.*;
import com.trustpay.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayoutService {

    private final ClaimRepository claimRepository;
    private final TransactionRepository transactionRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final DisruptionEventRepository disruptionEventRepository;

    public void processPayoutForClaim(Claim claim) {
        log.info("Processing payout for Claim {}", claim.getClaimId());
        
        User worker = userRepository.findById(Long.parseLong(claim.getWorkerId()))
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        
        Optional<Policy> policyOpt = policyRepository.findByWorkerId(worker.getWorkerId())
                .stream().filter(p -> "ACTIVE".equals(p.getStatus())).findFirst();

        double baseHourlyRate = worker.getBaseHourlyRate() != null ? worker.getBaseHourlyRate() : 120.0;
        double coverageMultiplier = 1.0;
        double maxCap = 5000.0;

        if (policyOpt.isPresent()) {
            Policy p = policyOpt.get();
            coverageMultiplier = p.getCoverageMultiplier() != null ? p.getCoverageMultiplier() : 1.0;
            maxCap = p.getMaxCoverage() != null ? p.getMaxCoverage() : 5000.0;
        }

        // Fetch disruption duration
        double disruptionHours = 1.0;
        Optional<DisruptionEvent> event = disruptionEventRepository.findById(claim.getDisruptionEventId());
        if (event.isPresent()) {
            disruptionHours = event.get().getDurationHours() != null ? event.get().getDurationHours() : 1.0;
        }

        // Formula: Payout = (Hours * Rate) * Multiplier
        double calculatedPayout = (disruptionHours * baseHourlyRate) * coverageMultiplier;
        
        // Apply Cap
        double finalPayout = Math.min(calculatedPayout, maxCap);
        
        claim.setPayoutAmount(Math.round(finalPayout * 100.0) / 100.0);
        claim.setClaimStatus("PAID");
        claim.setUpiTxnId("TXN-UPI-" + System.currentTimeMillis());

        claimRepository.save(claim);

        log.info("Calculations: ({} hrs * {} rate) * {} multiplier = {} (Capped at {})", 
                disruptionHours, baseHourlyRate, coverageMultiplier, calculatedPayout, finalPayout);

        // Store transaction
        Transaction txn = Transaction.builder()
                .workerId(claim.getWorkerId())
                .amount(finalPayout)
                .transactionType("PAYOUT")
                .status("COMPLETED")
                .method("UPI")
                .description("Parametric payout for " + claim.getEventType() + " (" + disruptionHours + " hrs)")
                .parametricPayout(true)
                .build();
                
        transactionRepository.save(txn);
    }
}
