package com.trustpay.backend.controller;

import com.trustpay.backend.model.FraudCase;
import com.trustpay.backend.repository.FraudCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fraud")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FraudController {

    private final FraudCaseRepository repository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCases(@RequestParam(required = false) String status) {
        List<FraudCase> cases = (status != null && !status.equalsIgnoreCase("all")) 
                ? repository.findByStatus(status.toUpperCase()) 
                : repository.findAll();
        return ResponseEntity.ok(Map.of("cases", cases));
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<Map<String, Object>> takeAction(
            @PathVariable Long id, 
            @RequestParam String action) {
        
        FraudCase fraudCase = repository.findById(id).orElseThrow();
        if ("approve".equalsIgnoreCase(action)) {
            fraudCase.setStatus("APPROVED");
        } else if ("reject".equalsIgnoreCase(action)) {
            fraudCase.setStatus("REJECTED");
        }
        repository.save(fraudCase);
        
        return ResponseEntity.ok(Map.of("success", true, "status", fraudCase.getStatus()));
    }
}
