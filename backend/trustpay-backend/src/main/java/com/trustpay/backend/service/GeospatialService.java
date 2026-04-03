package com.trustpay.backend.service;

import com.uber.h3core.H3Core;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;

@Service
public class GeospatialService {

    private H3Core h3;

    @PostConstruct
    public void init() throws IOException {
        this.h3 = H3Core.newInstance();
    }

    /**
     * Converts GPS coordinates to H3 Index (Hex ID)
     * @param lat Latitude
     * @param lng Longitude
     * @param resolution H3 Resolution (Recommended: 9 for workers, 8 for disruptions)
     * @return H3 Address (String)
     */
    public String latLngToH3(double lat, double lng, int resolution) {
        return h3.latLngToCellAddress(lat, lng, resolution);
    }

    /**
     * Checks if a point is within or near a specific hexagon
     */
    public boolean isWithinHex(double lat, double lng, String h3Index) {
        String pointIndex = h3.latLngToCellAddress(lat, lng, h3.getResolution(h3Index));
        return pointIndex.equals(h3Index);
    }

    /**
     * Finds neighboring hexes within 'k' distance
     */
    public List<String> getNeighboringHexes(String h3Index, int k) {
        return h3.gridDisk(h3Index, k);
    }
    
    public long getDistanceBetweenHexes(String h3Index1, String h3Index2) {
        return h3.gridDistance(h3Index1, h3Index2);
    }
}
