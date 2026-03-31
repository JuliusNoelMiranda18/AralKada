'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setAddressStr }: { position: [number, number] | null, setPosition: (p: [number, number]) => void, setAddressStr: (s: string) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
      // basic reverse geocoding via nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setAddressStr(data.display_name);
          }
        })
        .catch(console.error);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function CommuterMap({ 
  onLocationSelect 
}: { 
  onLocationSelect: (loc: { lat: number, lng: number, address: string }) => void 
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>('');
  
  // Default to Manila
  const center: [number, number] = [14.5995, 120.9842];

  useEffect(() => {
    if (position && address) {
      onLocationSelect({ lat: position[0], lng: position[1], address });
    }
  }, [position, address, onLocationSelect]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner relative" style={{ zIndex: 0 }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} setAddressStr={setAddress} />
      </MapContainer>
      
      {!position && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md pointer-events-none z-[1000] text-sm font-bold border-2" style={{ color: 'var(--pal-cafenoir)', borderColor: 'var(--pal-cafenoir)' }}>
          Tap on the map to pin your origin
        </div>
      )}
    </div>
  );
}
