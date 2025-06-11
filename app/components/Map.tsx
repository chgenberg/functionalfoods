"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  position: LatLngExpression;
  zoom: number;
  className?: string;
}

export default function Map({ position, zoom, className }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix för Leaflet ikoner i Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });

    // Initiera kartan
    const map = L.map(mapContainerRef.current).setView(position, zoom);
    mapRef.current = map;

    // Lägg till OpenStreetMap-lager med anpassad stil
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'map-tiles'
    }).addTo(map);

    // Custom marker med förbättrad design
    const customIcon = L.divIcon({
      html: `<div class="custom-marker">
        <div class="marker-pulse"></div>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#D97757"/>
        </svg>
      </div>`,
      className: 'custom-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Lägg till markör med förbättrad popup
    L.marker(position, { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div class="custom-popup">
          <div class="font-medium text-lg">Functional Foods</div>
          <div class="text-sm text-gray-600 mt-1">Box 6211, Stockholm</div>
        </div>
      `)
      .openPopup();

    // Städa upp när komponenten unmountas
    return () => {
      map.remove();
    };
  }, [position, zoom]);

  return (
    <>
      <div ref={mapContainerRef} className={className} style={{ position: 'relative', zIndex: 1 }} />
      <style jsx global>{`
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        .custom-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .marker-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(217, 119, 87, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 12px;
          font-family: inherit;
        }
        .map-tiles {
          filter: brightness(1.05) contrast(0.95) saturate(0.9) sepia(0.1);
        }
        .leaflet-container {
          border-radius: 18px;
          box-shadow: 0 6px 24px 0 rgba(217,119,87,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.04);
          border: 3px solid transparent;
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          background-image: linear-gradient(#fff, #fff), linear-gradient(120deg, #fbbf24 0%, #f97316 100%);
        }
      `}</style>
    </>
  );
} 