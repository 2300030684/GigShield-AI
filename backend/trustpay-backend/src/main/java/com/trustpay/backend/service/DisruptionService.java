package com.trustpay.backend.service;

import com.trustpay.backend.model.DisruptionEvent;
import com.trustpay.backend.repository.DisruptionEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisruptionService {

    private final DisruptionEventRepository repository;
    private final GeospatialService geospatialService;

    /**
     * Finds active disruptions for a specific worker's GPS
     */
    public List<DisruptionEvent> getActiveDisruptions(double lat, double lng) {
        String h3Index = geospatialService.latLngToH3(lat, lng, 9);
        return repository.findByH3IndexAndIsActiveTrue(h3Index);
    }

    /**
     * Simulates a disruption event (RAIN, AQI) for testing
     */
    public DisruptionEvent simulateDisruption(String type, double lat, double lng, double intensity) {
        String h3Index = geospatialService.latLngToH3(lat, lng, 9);
        
        DisruptionEvent event = DisruptionEvent.builder()
                .type(type)
                .h3Index(h3Index)
                .intensity(intensity)
                .startTime(LocalDateTime.now())
                .isActive(true)
                .build();
                
        return repository.save(event);
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
