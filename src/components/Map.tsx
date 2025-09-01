'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

// Define the structure of a single shape
export interface Shape {
  id: string;
  geojson: any;
}

// Define the props that this component accepts
export interface MapProps {
  shapes: Shape[];
}

const Map = ({ shapes }: MapProps) => {
  const position: LatLngExpression = [-6.2088, 106.8456];

  const styleGeoJSON = () => {
    return {
      color: '#e60000',
      weight: 2,
      fillColor: '#ff3333',
      fillOpacity: 0.4,
    };
  };

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* This line loops through the shapes prop and renders each one */}
      {shapes.map((shape) => (
        <GeoJSON key={shape.id} data={shape.geojson} style={styleGeoJSON} />
      ))}
    </MapContainer>
  );
};

export default Map;