package com.trustpay.backend.service;

import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.DisruptionEventRepository;
import com.trustpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClaimTriggerService {

    private final UserRepository userRepository;
    private final DisruptionEventRepository disruptionEventRepository;
    private final AIVerificationService aiVerificationService;

    public void evaluateWorkerDisruptions(Long workerId) {
        User worker = userRepository.findById(workerId).orElseThrow(() -> new RuntimeException("Worker not found"));
        
        if (worker.getCurrentH3Index() == null) {
            log.info("Worker {} has no H3 index yet", workerId);
            return; // Needs an H3 index to match
        }

        List<DisruptionEvent> activeDisruptions = disruptionEventRepository.findAll().stream()
                .filter(DisruptionEvent::getIsActive)
                .toList();

        for (DisruptionEvent disruption : activeDisruptions) {
            if (disruption.getH3Index().equals(worker.getCurrentH3Index())) {
                log.info("Disruption matched for worker {}! Evaluating Claim...", workerId);
                aiVerificationService.verifyAndAutoApprove(worker, disruption);
            }
        }
    }

    public void scanAllWorkers() {
        List<User> workers = userRepository.findAll().stream()
                .filter(u -> "ROLE_WORKER".equals(u.getRole()))
                .toList();
        for (User worker : workers) {
            evaluateWorkerDisruptions(worker.getId());
        }
    }
}
