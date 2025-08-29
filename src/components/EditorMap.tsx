// file: components/EditorMap.tsx
'use client';

import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; // Jangan lupa CSS untuk drawing tools
import type { LatLngExpression } from 'leaflet';

const EditorMap = () => {
  const position: LatLngExpression = [-6.2088, 106.8456];

  const handleCreate = (e: any) => {
    const { layerType, layer } = e;
    const geoJSON = layer.toGeoJSON();

    console.log(`Bentuk Dibuat! Tipe: ${layerType}`);
    console.log("Data GeoJSON:", geoJSON);
    // Di langkah selanjutnya, data ini akan kita kirim ke database!
  };

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreate}
          draw={{
            rectangle: true,
            polygon: true,
            circle: true,
            circlemarker: false,
            marker: true,
            polyline: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default EditorMap;