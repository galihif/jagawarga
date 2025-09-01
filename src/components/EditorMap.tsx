'use client';

import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useRealtimeMapElements } from '@/src/hooks/useRealtimeMapElements';
import { useMapElementMutations } from '@/src/hooks/useMapElementMutations';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { DEFAULT_MAP_CONFIG, MAP_STYLES, TILE_LAYER } from '@/src/config/map';
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


  const handleCreate = async (e: LeafletDrawEvent) => {
    const { layerType, layer } = e;
    const geoJSON = layer.toGeoJSON();
    
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
    <MapContainer 
      center={DEFAULT_MAP_CONFIG.center} 
      zoom={DEFAULT_MAP_CONFIG.zoom}
      maxZoom={DEFAULT_MAP_CONFIG.maxZoom}
      minZoom={DEFAULT_MAP_CONFIG.minZoom}
      style={{ height: '100vh', width: '100%' }}
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
            marker: true, 
            polyline: false,
          }}
        />
        {mapElements?.map((element) => (
          <GeoJSON 
            key={element.id} 
            data={element.geojson} 
            style={getMapElementStyle} 
          />
        ))}
      </FeatureGroup>
    </MapContainer>
  );
};

export default EditorMap;