// file: components/Map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet'; // <-- TAMBAHKAN IMPORT INI

const Map = () => {
  // Koordinat Jakarta sebagai pusat peta awal
  // BERI TIPE EKSPLISIT DI SINI V
  const position: LatLngExpression = [-6.2088, 106.8456]; 

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Jakarta Pusat. <br /> JagaWarga akan tampil di sini.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;