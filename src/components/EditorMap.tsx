'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, Marker } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useRealtimeMapElements } from '@/src/hooks/useRealtimeMapElements';
import { useMapElementMutations } from '@/src/hooks/useMapElementMutations';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { MarkerSelector } from '@/src/components/MarkerSelector';
import { MapLegend } from '@/src/components/MapLegend';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, TILE_LAYER } from '@/src/config/map';
import { createEmojiIcon } from '@/src/utils/markerRenderer';
import { getMarkerById, type MarkerLegendItem } from '@/src/config/markerLegend';
import type { MapElementType } from '@/src/types/map';
import type { LeafletDrawEvent, LeafletEditEvent, LeafletDeleteEvent } from '@/src/types/leaflet';

const EditorMap = () => {
  const { data: mapElements, loading, error } = useRealtimeMapElements();
  const {
    createMapElement,
    createError,
    updateMapElement,
    debouncedBatchDelete
  } = useMapElementMutations();
  
  // Marker selection state
  const [selectedMarker, setSelectedMarker] = useState<MarkerLegendItem | null>(null);
  const [isMarkerSelectorOpen, setIsMarkerSelectorOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);


  const handleCreate = async (e: LeafletDrawEvent) => {
    const { layerType, layer } = e;
    let geoJSON = layer.toGeoJSON();
    
    // If it's a marker and we have a selected emoji marker, add metadata
    if (layerType === 'marker' && selectedMarker) {
      geoJSON.properties = {
        ...geoJSON.properties,
        markerType: selectedMarker.id,
        emoji: selectedMarker.emoji,
        label: selectedMarker.label,
        category: selectedMarker.category,
        color: selectedMarker.color
      };
    }
    
    const result = await createMapElement({
      type: layerType as MapElementType,
      geojson: geoJSON as any
    });

    if (result) {
      alert('Shape created successfully!');
    } else if (createError) {
      alert(`Failed to create shape: ${createError}`);
    }
  };

  const handleEdit = async (e: LeafletEditEvent) => {
    const updatePromises: Promise<any>[] = [];
    
    for (const layerId in e.layers._layers) {
      const editedLayer = e.layers._layers[layerId];
      const docId = editedLayer.feature.properties?.id;
      
      if (docId) {
        const newGeoJSON = editedLayer.toGeoJSON();
        updatePromises.push(
          updateMapElement({
            id: docId,
            geojson: newGeoJSON as any
          })
        );
      }
    }

    try {
      await Promise.all(updatePromises);
      alert('Shapes updated successfully!');
    } catch {
      alert('Failed to update some shapes');
    }
  };

  const handleDelete = (e: LeafletDeleteEvent) => {
    const idsToDelete: string[] = [];
    
    for (const layerId in e.layers._layers) {
      const deletedLayer = e.layers._layers[layerId];
      const id = deletedLayer.feature?.properties?.id;
      if (id) {
        idsToDelete.push(id);
      }
    }
    
    if (idsToDelete.length > 0) {
      debouncedBatchDelete(idsToDelete);
    }
  };
  const getMapElementStyle = () => MAP_STYLES.EDITOR;

  const renderMapElement = (element: any) => {
    // Check if this is a marker with emoji data
    if (element.geojson.properties?.markerType && element.geojson.properties?.emoji) {
      const markerLegend = getMarkerById(element.geojson.properties.markerType);
      if (markerLegend) {
        // Create a custom marker component for emoji markers
        return null; // We'll handle this differently
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
  };

  // Handle map click for custom marker placement
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (selectedMarker) {
      // Create a custom marker
      const geoJSON = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [e.latlng.lng, e.latlng.lat]
        },
        properties: {
          markerType: selectedMarker.id,
          emoji: selectedMarker.emoji,
          label: selectedMarker.label,
          category: selectedMarker.category,
          color: selectedMarker.color
        }
      };
      
      createMapElement({
        type: 'marker' as MapElementType,
        geojson: geoJSON as any
      });
      
      // Clear selection after placement
      setSelectedMarker(null);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('click', handleMapClick);
      return () => {
        if (mapRef.current) {
          mapRef.current.off('click', handleMapClick);
        }
      };
    }
  }, [selectedMarker]);

  if (loading) {
    return <LoadingSpinner message="Loading editor..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        className="h-screen flex items-center justify-center"
      />
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Marker Selector */}
      <MarkerSelector
        selectedMarker={selectedMarker}
        onMarkerSelect={setSelectedMarker}
        isOpen={isMarkerSelectorOpen}
        onToggle={() => setIsMarkerSelectorOpen(!isMarkerSelectorOpen)}
      />

      {/* Map Legend */}
      <MapLegend />

      {/* Selected Marker Indicator */}
      {selectedMarker && (
        <div className="absolute top-4 right-4 z-1000 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-lg">{selectedMarker.emoji}</span>
          <span className="text-sm font-medium">Click map to place {selectedMarker.label}</span>
          <button 
            onClick={() => setSelectedMarker(null)}
            className="ml-2 hover:bg-blue-700 rounded px-1"
          >
            ✕
          </button>
        </div>
      )}

      <MapContainer 
        center={DEFAULT_MAP_CONFIG.center} 
        zoom={DEFAULT_MAP_CONFIG.zoom}
        maxZoom={DEFAULT_MAP_CONFIG.maxZoom}
        minZoom={DEFAULT_MAP_CONFIG.minZoom}
        style={{ height: '100vh', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer 
          url={TILE_LAYER.url}
          attribution={TILE_LAYER.attribution}
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onEdited={handleEdit}
            onDeleted={handleDelete}
            draw={{
              rectangle: true, 
              polygon: true, 
              circle: true,
              circlemarker: false, 
              marker: !selectedMarker, // Disable default marker when custom marker is selected
              polyline: false,
            }}
          />
          {mapElements?.map((element) => {
            // Render emoji markers differently
            if (element.geojson.properties?.markerType && element.geojson.properties?.emoji) {
              // For emoji markers, we'll create a custom marker
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
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default EditorMap;