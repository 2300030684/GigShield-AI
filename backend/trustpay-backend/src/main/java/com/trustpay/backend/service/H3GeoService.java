package com.trustpay.backend.service;

import com.uber.h3core.H3Core;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;

@Service
public class H3GeoService {

    private H3Core h3;

    @PostConstruct
    public void init() throws IOException {
        this.h3 = H3Core.newInstance();
    }

    public String convertGpsToH3(double latitude, double longitude, int resolution) {
        return h3.latLngToCellAddress(latitude, longitude, resolution);
    }

    public List<String> getNeighborHexes(String h3Index) {
        return h3.gridDisk(h3Index, 1);
    }

    public boolean isSameZone(String zone1, String zone2) {
        if (zone1 == null || zone2 == null) return false;
        return zone1.equals(zone2);
    }

    public boolean isWithinHex(double lat, double lng, String h3Index) {
        String pointIndex = h3.latLngToCellAddress(lat, lng, h3.getResolution(h3Index));
        return pointIndex.equals(h3Index);
    }

    public long getDistanceBetweenHexes(String h3Index1, String h3Index2) {
        return h3.gridDistance(h3Index1, h3Index2);
    }
}
