package com.trustpay.backend.controller;

import com.trustpay.backend.model.WorkerZoneLog;
import com.trustpay.backend.repository.WorkerZoneLogRepository;
import com.trustpay.backend.service.GeospatialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/worker")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerZoneLogRepository repository;
    private final GeospatialService geospatialService;

    @PostMapping("/location")
    public ResponseEntity<WorkerZoneLog> updateLocation(
            @RequestBody Map<String, Object> payload) {
        
        String workerId = (String) payload.get("workerId");
        double lat = (double) payload.get("lat");
        double lng = (double) payload.get("lng");
        String activity = (String) payload.getOrDefault("activity", "ACTIVE");

        // Convert GPS to H3 Res 9 (Street Level)
        String h3Index = geospatialService.latLngToH3(lat, lng, 9);

        WorkerZoneLog log = WorkerZoneLog.builder()
                .workerId(workerId)
                .h3Index(h3Index)
                .latitude(lat)
                .longitude(lng)
                .activityStatus(activity)
                .build();

        return ResponseEntity.ok(repository.save(log));
    }

    @GetMapping("/zone")
    public ResponseEntity<Map<String, Object>> getZone(
            @RequestParam double lat, @RequestParam double lng) {
        
        String h3Index = geospatialService.latLngToH3(lat, lng, 9);
        return ResponseEntity.ok(Map.of("h3Index", h3Index, "resolution", 9));
    }
}
