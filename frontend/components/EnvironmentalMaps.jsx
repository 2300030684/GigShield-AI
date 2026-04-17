import React, { useEffect, useRef } from 'react';
import { Card } from './Card';
import api from '../services/api.js';

const EnvironmentalMaps = ({ city = "Bangalore", cityCoords = { lat: 12.9716, lng: 77.5946 } }) => {
  const googleMapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const waqiToken = "YOUR_WAQI_TOKEN"; // Placeholder

  useEffect(() => {
    // ── GOOGLE TRAFFIC MAP ──
    if (window.google && googleMapRef.current) {
      const map = new window.google.maps.Map(googleMapRef.current, {
        zoom: 12,
        center: cityCoords,
        styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
            { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
            { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
            { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
        ]
      });
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }

    // ── WAQI LEAFLET MAP ──
    if (window.L && leafletMapRef.current) {
      leafletMapRef.current.innerHTML = "";
      const mapContainer = document.createElement('div');
      mapContainer.style.height = "100%";
      mapContainer.id = "waqi-leaflet-map";
      leafletMapRef.current.appendChild(mapContainer);

      const map = window.L.map(mapContainer, {
        attributionControl: false,
        zoomSnap: 0.1,
      }).setView([cityCoords.lat, cityCoords.lng], 11);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // ── BACKEND DISRUPTIONS ──
      api.getLiveDisruptions().then(res => {
        const disruptions = Array.isArray(res) ? res : (res.disruptions || []);
        disruptions.forEach(d => {
          const color = d.severity === 'CRITICAL' ? '#ef4444' : d.severity === 'HIGH' ? '#f97316' : '#eab308';
          window.L.circle([d.latitude, d.longitude], {
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
            radius: 2000
          }).addTo(map).bindPopup(`<b>${d.eventType}</b><br/>Severity: ${d.severity}<br/>Zone: ${d.zoneRank || 'High Risk'}`);
        });
      });

      const populateMarkers = (bounds) => {
        fetch(`https://api.waqi.info/v2/map/bounds/?latlng=${bounds}&token=${waqiToken}`)
          .then(x => x.json())
          .then(stations => {
            if (stations.status !== "ok") return;
            stations.data.forEach(station => {
              let icon = window.L.icon({
                iconUrl: `https://waqi.info/mapicon/${station.aqi}.30.png`,
                iconSize: [30, 40],
                iconAnchor: [15, 40],
              });
              window.L.marker([station.lat, station.lon], { icon }).addTo(map)
              .bindPopup(`<b>${station.station.name}</b><br/>AQI: ${station.aqi}`);
            });
          });
      };

      map.on("moveend", () => {
        const b = map.getBounds();
        populateMarkers(`${b.getNorth()},${b.getWest()},${b.getSouth()},${b.getEast()}`);
      });

      const b = map.getBounds();
      populateMarkers(`${b.getNorth()},${b.getWest()},${b.getSouth()},${b.getEast()}`);

      return () => { map.remove(); };
    }
  }, [cityCoords]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '60px' }}>
      <Card glow style={{ padding: 0, overflow: 'hidden', height: '500px', border: '1px solid rgba(0, 224, 255, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ 
          padding: '16px 28px', 
          background: 'linear-gradient(90deg, var(--bg-card), rgba(6,182,212,0.05))', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🚦</span>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px' }}>LIVE TRAFFIC DENSITY (GOOGLE MAPS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)' }}>REAL-TIME FEED</span>
          </div>
        </div>
        <div ref={googleMapRef} style={{ width: '100%', height: 'calc(100% - 56px)' }}></div>
      </Card>

      <Card glow style={{ padding: 0, overflow: 'hidden', height: '500px', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ 
          padding: '16px 28px', 
          background: 'linear-gradient(90deg, var(--bg-card), rgba(16,185,129,0.05))', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🌫️</span>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px' }}>AIR QUALITY INDEX (WAQI RADAR)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>ACTIVE MONITORING</span>
          </div>
        </div>
        <div ref={leafletMapRef} style={{ width: '100%', height: 'calc(100% - 56px)' }}></div>
      </Card>
    </div>
  );
};

export default EnvironmentalMaps;
