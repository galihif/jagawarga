'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapElement } from '@/src/types/map';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, TILE_LAYER } from '@/src/config/map';

export interface MapProps {
  mapElements: MapElement[];
}

const Map = ({ mapElements }: MapProps) => {
  const getMapElementStyle = () => MAP_STYLES.PUBLIC;

  return (
    <MapContainer 
      center={DEFAULT_MAP_CONFIG.center} 
      zoom={DEFAULT_MAP_CONFIG.zoom} 
      maxZoom={DEFAULT_MAP_CONFIG.maxZoom}
      minZoom={DEFAULT_MAP_CONFIG.minZoom}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution={TILE_LAYER.attribution}
        url={TILE_LAYER.url}
      />

      {mapElements.map((element) => (
        <GeoJSON 
          key={element.id} 
          data={element.geojson} 
          style={getMapElementStyle} 
        />
      ))}
    </MapContainer>
  );
};

export default Map;