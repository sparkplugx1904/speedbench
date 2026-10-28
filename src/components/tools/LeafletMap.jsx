import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PRIMARY_PIN_HTML = `
  <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#2563eb;color:#ffffff;box-shadow:0 2px 10px rgba(37,99,235,0.5);border:2px solid #ffffff;">
    <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"/>
    </svg>
  </div>
`;

const ALT_PIN_HTML = `
  <div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#64748b;color:#ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #ffffff;">
    <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"/>
    </svg>
  </div>
`;

export function LeafletMap({ primary, sources = [] }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !primary || !Number.isFinite(primary.lat) || !Number.isFinite(primary.lon)) {
      return;
    }

    // Clean up prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [primary.lat, primary.lon],
      zoom: 12,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap tile layer as used in route-planner (zero API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const primaryIcon = L.divIcon({
      className: 'leaflet-primary-pin',
      html: PRIMARY_PIN_HTML,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const altIcon = L.divIcon({
      className: 'leaflet-alt-pin',
      html: ALT_PIN_HTML,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });

    const bounds = L.latLngBounds([[primary.lat, primary.lon]]);

    // Render other provider pins if different
    sources.forEach((src) => {
      if (src === primary || !Number.isFinite(src.lat) || !Number.isFinite(src.lon)) return;
      bounds.extend([src.lat, src.lon]);
      const popupText = `
        <div style="font-family:sans-serif;font-size:12px;">
          <strong>${src.source}</strong><br/>
          ${[src.city, src.region, src.country].filter(Boolean).join(', ') || 'Unknown'}<br/>
          <span style="color:#64748b;">${src.lat.toFixed(4)}, ${src.lon.toFixed(4)}</span>
        </div>
      `;
      L.marker([src.lat, src.lon], { icon: altIcon })
        .addTo(map)
        .bindPopup(popupText);
    });

    // Render primary pin
    const primaryPopup = `
      <div style="font-family:sans-serif;font-size:12px;">
        <strong>${primary.ip}</strong> <span style="color:#2563eb;">(Best guess)</span><br/>
        ${[primary.city, primary.region, primary.country].filter(Boolean).join(', ') || 'Unknown'}<br/>
        <span style="color:#64748b;">Provider: ${primary.source}</span><br/>
        <span style="color:#64748b;">Coords: ${primary.lat.toFixed(4)}, ${primary.lon.toFixed(4)}</span>
      </div>
    `;

    const primaryMarker = L.marker([primary.lat, primary.lon], { icon: primaryIcon })
      .addTo(map)
      .bindPopup(primaryPopup);

    primaryMarker.openPopup();

    if (sources.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    // Leaflet needs invalidateSize after initial render
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [primary, sources]);

  return (
    <div className="overflow-hidden rounded-[2px] border border-(--border)">
      <div
        ref={containerRef}
        className="h-72 w-full sm:h-80 bg-(--surface)"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
