import React, { useEffect, useRef } from 'react';
import { Card } from './Card';

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
      // Clear existing content if any (React mount/unmount safety)
      leafletMapRef.current.innerHTML = "";
      const mapContainer = document.createElement('div');
      mapContainer.style.height = "100%";
      mapContainer.id = "waqi-leaflet-map";
      leafletMapRef.current.appendChild(mapContainer);

      const map = window.L.map(mapContainer, {
        attributionControl: false,
        gestureHandling: true,
        zoomSnap: 0.1,
      }).setView([cityCoords.lat, cityCoords.lng], 11);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const populateMarkers = (bounds) => {
        fetch(`https://api.waqi.info/v2/map/bounds/?latlng=${bounds}&token=${waqiToken}`)
          .then(x => x.json())
          .then(stations => {
            if (stations.status !== "ok") return;
            stations.data.forEach(station => {
              let icon = window.L.icon({
                iconUrl: `https://waqi.info/mapicon/${station.aqi}.30.png`,
                iconSize: [41, 53],
                iconAnchor: [20, 53],
              });

              window.L.marker([station.lat, station.lon], {
                zIndexOffset: station.aqi,
                title: station.station.name,
                icon: icon,
              })
              .addTo(map)
              .bindPopup(`<b>${station.station.name}</b><br/>AQI: ${station.aqi}`);
            });
          })
          .catch(e => console.error("WAQI Fetch Error:", e));
      };

      map.on("moveend", () => {
        const b = map.getBounds();
        const boundsStr = `${b.getNorth()},${b.getWest()},${b.getSouth()},${b.getEast()}`;
        populateMarkers(boundsStr);
      });

      // Initial populate
      const b = map.getBounds();
      const boundsStr = `${b.getNorth()},${b.getWest()},${b.getSouth()},${b.getEast()}`;
      populateMarkers(boundsStr);

      return () => {
        map.remove();
      };
    }
  }, [cityCoords]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
      <Card style={{ padding: 0, overflow: 'hidden', height: '400px', border: '1px solid var(--border)' }}>
        <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>🚦 Live Traffic Layer (Google Maps)</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>● LIVE</span>
        </div>
        <div ref={googleMapRef} style={{ width: '100%', height: 'calc(100% - 45px)' }}></div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden', height: '400px', border: '1px solid var(--border)' }}>
        <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>🌫️ Air Quality Index (WAQI)</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>● ACTIVE</span>
        </div>
        <div ref={leafletMapRef} style={{ width: '100%', height: 'calc(100% - 45px)' }}></div>
      </Card>
    </div>
  );
};

export default EnvironmentalMaps;
