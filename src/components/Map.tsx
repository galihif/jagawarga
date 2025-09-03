'use client';

import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapElement } from '@/src/types/map';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, TILE_LAYER } from '@/src/config/map';
import { createEmojiIcon } from '@/src/utils/markerRenderer';
import { getMarkerById } from '@/src/config/markerLegend';
import { getZoneById } from '@/src/config/zoneTypes';
import { MapLegend } from '@/src/components/MapLegend';

export interface MapProps {
  mapElements: MapElement[];
}

const Map = ({ mapElements }: MapProps) => {
  // Calculate last update time
  const lastUpdate = useMemo(() => {
    if (!mapElements?.length) return null;
    const latest = mapElements.reduce((latest, current) => {
      return current.updatedAt && current.updatedAt > (latest?.updatedAt || new Date(0))
        ? current : latest;
    });
    return latest?.updatedAt || latest?.createdAt || null;
  }, [mapElements]);

  // Render map elements with proper styling for public view
  const renderMapElement = (element: any) => {
    console.log('Rendering element:', element.id, element.geojson.geometry.type, element.geojson.properties);

    // Handle circles with preserved radius information
    if (element.geojson.properties?.circleRadius && element.geojson.properties?.circleCenter) {
      const [lng, lat] = element.geojson.properties.circleCenter;
      const radius = element.geojson.properties.circleRadius;
      
      // Get circle style for public view
      const getCircleStyle = () => {
        if (element.geojson.properties?.zoneType) {
          const zone = getZoneById(element.geojson.properties.zoneType);
          if (zone) {
            return zone.style;
          }
        }
        
        return {
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          color: '#2563eb',
          weight: 2
        };
      };

      const CircleComponent = () => {
        const map = useMap();
        useEffect(() => {
          const circle = L.circle([lat, lng], radius, getCircleStyle());
          circle.addTo(map);
          
          return () => {
            circle.remove();
          };
        }, [map]);
        
        return null;
      };

      return <CircleComponent key={element.id} />;
    }

    // Handle emoji markers (only for Point geometries with markerType)
    if (element.geojson.geometry.type === 'Point' && element.geojson.properties?.markerType && element.geojson.properties?.emoji) {
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
    
    // Handle all other geometries (polygons, rectangles) with proper zone styling
    const getShapeStyle = () => {
      if (element.geojson.properties?.zoneType) {
        const zone = getZoneById(element.geojson.properties.zoneType);
        if (zone) {
          console.log('Using zone style for public view:', zone.style);
          return zone.style;
        }
      }
      
      // Fallback to default public style
      const defaultStyle = MAP_STYLES.PUBLIC();
      console.log('Using default public style:', defaultStyle);
      return defaultStyle;
    };
    
    return (
      <GeoJSON 
        key={element.id} 
        data={element.geojson} 
        style={getShapeStyle}
        pointToLayer={(feature, latlng) => {
          // For Point geometries that aren't emoji markers, create a circle marker
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#2563eb',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.2
          });
        }}
      />
    );
  };

  return (
    <div className="relative h-screen w-full">
      {/* Map Legend for public view */}
      <MapLegend />

      {/* Last Updated Display */}
      {lastUpdate && (
        <div className="fixed bottom-4 right-4 z-1000 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-sm">
              <span className="text-gray-600">Last updated:</span>
              <br />
              <span className="font-medium text-gray-800">
                {lastUpdate.toLocaleString('id-ID', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </span>
            </div>
          </div>
        </div>
      )}

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

        {mapElements?.map(renderMapElement)}
      </MapContainer>
    </div>
  );
};

export default Map;