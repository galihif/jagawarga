'use client';

import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapElement } from '@/src/types/map';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, TILE_LAYER } from '@/src/config/map';
import { createEmojiIcon } from '@/src/utils/markerRenderer';
import { getMarkerById } from '@/src/config/markerLegend';
import { MapLegend } from '@/src/components/MapLegend';

export interface MapProps {
  mapElements: MapElement[];
}

const Map = ({ mapElements }: MapProps) => {
  const getMapElementStyle = () => MAP_STYLES.PUBLIC;

  return (
    <div className="relative h-screen w-full">
      {/* Map Legend for public view */}
      <MapLegend />

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

        {mapElements.map((element) => {
          // Render emoji markers differently in public view
          if (element.geojson.properties?.markerType && element.geojson.properties?.emoji) {
            const coords = element.geojson.geometry.coordinates;
            const markerLegend = getMarkerById(element.geojson.properties.markerType);
            
            if (markerLegend) {
              return (
                <Marker
                  key={element.id}
                  position={[coords[1], coords[0]]}
                  icon={createEmojiIcon({
                    emoji: markerLegend.emoji,
                    backgroundColor: '#ffffff',
                    borderColor: markerLegend.color,
                    borderWidth: 3
                  })}
                />
              );
            }
          }
          
          // Regular GeoJSON rendering for shapes
          return (
            <GeoJSON 
              key={element.id} 
              data={element.geojson} 
              style={getMapElementStyle} 
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;