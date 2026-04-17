package com.trustpay.backend.controller;

import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.service.DisruptionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DisruptionController — manages weather disruption events.
 *
 * 🔒 /simulate endpoint is now ADMIN-ONLY (JWT + ROLE_ADMIN required).
 * ✅ /live endpoint is public (workers can see active disruptions).
 */
@RestController
@RequestMapping("/api/disruptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DisruptionController {

    private static final Logger log = LoggerFactory.getLogger(DisruptionController.class);
    private final DisruptionService disruptionService;

    /**
     * GET /api/disruptions/live
     * Returns all currently active disruption events.
     * Used by frontend to show DisruptionBanner.
     */
    @GetMapping("/live")
    public ResponseEntity<List<DisruptionEvent>> getLiveDisruptions() {
        return ResponseEntity.ok(disruptionService.getAllActive());
    }

    /**
     * POST /api/disruptions/simulate
     * 🔒 ADMIN ONLY — triggers a parametric disruption event.
     *
     * Used for the hackathon "Simulate Storm" demo button.
     *
     * Request body:
     * {
     *   "type":      "STORM",            // RAIN | HEATWAVE | AQI_SPIKE | FLOOD | CURFEW
     *   "lat":       17.4726,
     *   "lng":       78.3572,
     *   "intensity": 75.0,              // mm for rain, °C for heat, AQI for air
     *   "duration":  3.5                // hours (optional, defaults to 1.0)
     * }
     */
    @PostMapping("/simulate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> simulate(@RequestBody Map<String, Object> payload) {
        String type      = (String) payload.getOrDefault("type", "RAIN");
        double lat       = toDouble(payload.getOrDefault("lat", 17.4726));
        double lng       = toDouble(payload.getOrDefault("lng", 78.3572));
        double intensity = toDouble(payload.getOrDefault("intensity", 55.0));
        double duration  = toDouble(payload.getOrDefault("duration", 2.0));

        log.info("🔴 [ADMIN] Simulating {} event at ({}, {}) — intensity={}, duration={}h",
                type, lat, lng, intensity, duration);

        disruptionService.simulateDisruptionWithDuration(type, lat, lng, intensity, duration);

        return ResponseEntity.ok(Map.of(
                "status",    "SUCCESS",
                "message",   type + " disruption simulated successfully",
                "lat",       lat,
                "lng",       lng,
                "intensity", intensity,
                "duration",  duration,
                "note",      "Workers in zone will receive auto-payout within 30s"
        ));
    }

    /**
     * DELETE /api/disruptions/{id}/deactivate
     * 🔒 ADMIN ONLY — deactivates a specific disruption event.
     */
    @DeleteMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deactivate(@PathVariable Long id) {
        disruptionService.deactivateEvent(id);
        return ResponseEntity.ok(Map.of("status", "Disruption " + id + " deactivated"));
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); } catch (Exception e) { return 0.0; }
    }
}
