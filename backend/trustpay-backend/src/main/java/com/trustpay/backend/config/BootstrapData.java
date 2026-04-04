package com.trustpay.backend.config;

import com.trustpay.backend.model.*;
import com.trustpay.backend.repository.*;
import com.trustpay.backend.service.H3GeoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class BootstrapData implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapData.class);

    private final UserRepository userRepository;
    private final WorkerZoneLogRepository zoneLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final H3GeoService h3GeoService;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final FraudCaseRepository fraudCaseRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Bootstrapping Trustpay Backend demo data...");

        // 1. Create Default Worker
        User worker;
        if (!userRepository.existsByUsername("demo_worker")) {
            worker = User.builder()
                    .username("demo_worker")
                    .password(passwordEncoder.encode("password123"))
                    .email("worker@trustpay.ai")
                    .name("Rahul Sharma")
                    .phone("+91 98765 43210")
                    .role("ROLE_WORKER")
                    .workerId("W-7721") // Use realistic worker ID
                    .city("Hyderabad")
                    .zone("Kondapur")
                    .platform("Swiggy")
                    .protectionScore(85)
                    .rewardsBalance(450.0)
                    .activeDays(124)
                    .baseHourlyRate(150.0) // INR 150/hr for demo
                    .riskTier("MEDIUM")
                    .isOnboardingComplete(true)
                    .build();
            userRepository.save(worker);
            log.info("Created demo worker: Rahul Sharma (demo_worker)");
        } else {
            worker = userRepository.findByUsername("demo_worker").get();
            boolean changed = false;
            if (worker.getWorkerId() == null) {
               worker.setWorkerId("W-7721");
               changed = true;
            }
            if (worker.getBaseHourlyRate() == null) {
                worker.setBaseHourlyRate(150.0);
                changed = true;
            }
            if (changed) userRepository.save(worker);
        }

        // 2. Create Admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@trustpay.ai")
                    .role("ROLE_ADMIN")
                    .name("Platform Admin")
                    .build();
            userRepository.save(admin);
            log.info("Created platform admin: admin");
        }

        // 3. Create Active Policy
        if (policyRepository.findByWorkerId(worker.getWorkerId()).isEmpty()) {
            Policy policy = Policy.builder()
                    .workerId(worker.getWorkerId())
                    .planType("standard")
                    .status("ACTIVE")
                    .weeklyPremium(25.0)
                    .maxCoverage(3500.0)
                    .coverageMultiplier(1.2) // 1.2x multiplier for standard
                    .autoRenew(true)
                    .build();
            policyRepository.save(policy);
            log.info("Assigned Standard Plan to demo_worker (1.2x multiplier)");
        }

        // 4. Create Sample Claims
        if (claimRepository.findByWorkerId(worker.getWorkerId()).isEmpty()) {
            claimRepository.save(Claim.builder()
                    .workerId(worker.getWorkerId())
                    .claimId("TP-C-1001")
                    .eventType("Heavy Rainfall")
                    .h3Index("8960b135b0fffff")
                    .estimatedLoss(300.0)
                    .payoutAmount(225.0)
                    .claimStatus("PAID")
                    .aiConfidenceScore(94.2)
                    .build());
            claimRepository.save(Claim.builder()
                    .workerId(worker.getWorkerId())
                    .claimId("TP-C-1002")
                    .eventType("AQI Spike")
                    .h3Index("8960b135b0fffff")
                    .estimatedLoss(200.0)
                    .payoutAmount(150.0)
                    .claimStatus("PAID")
                    .aiConfidenceScore(88.5)
                    .build());
        }

        // 5. Create Fraud Cases for Admin Dashboard
        if (fraudCaseRepository.count() == 0) {
            fraudCaseRepository.save(FraudCase.builder()
                    .claimId("TP-C-9999")
                    .workerName("Vikram Singh")
                    .city("Hyderabad")
                    .type("GPS Mismatch")
                    .score(82)
                    .status("PENDING")
                    .flag("CLAIM_OUTSIDE_ZONE")
                    .aiVerdict("Worker GPS heartbeats were detected 4.2km outside the disruption radius during the storm peak.")
                    .findings(Arrays.asList("Distance Mismatch: 4.2km", "Active Signal: Heartbeat found", "Peer Anomaly: 0 neighbors corroborating"))
                    .build());
        }

        // 6. Create Transactions for Revenue
        if (transactionRepository.count() == 0) {
            transactionRepository.save(Transaction.builder()
                    .txnId("TXN-101")
                    .workerId(worker.getWorkerId())
                    .amount(25.0)
                    .transactionType("PREMIUM")
                    .status("COMPLETED")
                    .method("UPI")
                    .description("Standard Weekly Premium")
                    .build());
        }

        // 7. Initial GPS Heartbeat
        double lat = 17.4726;
        double lng = 78.3572;
        String h3Index = h3GeoService.convertGpsToH3(lat, lng, 9);
        zoneLogRepository.save(WorkerZoneLog.builder()
                .workerId(worker.getWorkerId())
                .h3Index(h3Index)
                .latitude(lat)
                .longitude(lng)
                .activityStatus("ACTIVE")
                .build());
    }
}
