package com.trustpay.backend.service;

import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.repository.DisruptionEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisruptionService {

    private final DisruptionEventRepository repository;
    private final H3GeoService h3GeoService;
    private final ClaimTriggerService claimTriggerService;

    /**
     * Finds active disruptions for a specific worker's GPS
     */
    public List<DisruptionEvent> getActiveDisruptions(double lat, double lng) {
        String h3Index = h3GeoService.convertGpsToH3(lat, lng, 9);
        return repository.findByH3IndexAndIsActiveTrue(h3Index);
    }

    /**
     * Simulates a disruption event (RAIN, AQI) for testing
     */
    public void simulateDisruption(String eventType, double lat, double lng, double intensity) {
        simulateDisruptionWithDuration(eventType, lat, lng, intensity, 1.0); // Default 1 hr
    }

    public void simulateDisruptionWithDuration(String eventType, double lat, double lng, double intensity, double duration) {
        String h3Index = h3GeoService.convertGpsToH3(lat, lng, 9);
        log.info("📢 Parametric Trigger Activated: {} in H3: {} (Intensity: {}, Duration: {} hrs)", 
                eventType, h3Index, intensity, duration);

        DisruptionEvent event = DisruptionEvent.builder()
                .eventType(eventType)
                .h3Index(h3Index)
                .intensityValue(intensity)
                .durationHours(duration)
                .startTime(LocalDateTime.now())
                .isActive(true)
                .build();

        repository.save(event);
        claimTriggerService.scanAllWorkers(); 
    }

    /**
     * T4: Curfew / Section 144 Trigger
     */
    public void triggerCurfewDisruption(double lat, double lng) {
        log.warn("T4 TRIGGER: Government-issued Curfew / Section 144 detected!");
        simulateDisruptionWithDuration("CURFEW", lat, lng, 1.0, 6.0); // Typically 6+ hrs
    }

    /**
     * T5: Flood / Natural Disaster Trigger
     */
    public void triggerFloodDisruption(double lat, double lng) {
        log.warn("T5 TRIGGER: IMD Flood Warning issued for pincode!");
        simulateDisruptionWithDuration("FLOOD", lat, lng, 1.0, 12.0); // Typically 12+ hrs
    }

    public List<DisruptionEvent> getAllActive() {
        return repository.findByIsActiveTrue();
    }
    
    public void deactivateEvent(Long id) {
        repository.findById(id).ifPresent(event -> {
            event.setIsActive(false);
            event.setEndTime(LocalDateTime.now());
            repository.save(event);
        });
    }
}
