package com.trustpay.backend.controller;

import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.service.DisruptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disruptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For demo/development
public class DisruptionController {

    private final DisruptionService disruptionService;

    @GetMapping("/live")
    public ResponseEntity<List<DisruptionEvent>> getLiveDisruptions() {
        return ResponseEntity.ok(disruptionService.getAllActive());
    }

    @PostMapping("/simulate")
    public ResponseEntity<String> simulate(
            @RequestBody Map<String, Object> payload) {
        
        String type = (String) payload.getOrDefault("type", "RAIN");
        double lat = (double) payload.getOrDefault("lat", 17.4726);
        double lng = (double) payload.getOrDefault("lng", 78.3572);
        double intensity = (double) payload.getOrDefault("intensity", 45.0);

        disruptionService.simulateDisruption(type, lat, lng, intensity);
        return ResponseEntity.ok("Disruption simulated successfully");
    }
}
