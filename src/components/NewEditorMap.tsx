'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Hooks and Services
import { useRealtimeMapElements } from '@/src/hooks/useRealtimeMapElements';
import { useMapElementMutations } from '@/src/hooks/useMapElementMutations';

// Components
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { AdminToolbar, type DrawingTool } from '@/src/components/admin/AdminToolbar';
import { ShapeInfoPanel } from '@/src/components/admin/ShapeInfoPanel';

// Configuration and Types
import { DEFAULT_MAP_CONFIG, TILE_LAYER } from '@/src/config/map';
import { createEmojiIcon } from '@/src/utils/markerRenderer';
import { getMarkerById, type MarkerLegendItem } from '@/src/config/markerLegend';
import { getZoneById, type ZoneType } from '@/src/config/zoneTypes';
import type { MapElementType } from '@/src/types/map';
import type { LeafletDrawEvent } from '@/src/types/leaflet';

// Custom drawing manager component
const DrawingManager = ({ 
  activeTool, 
  selectedZone, 
  selectedMarker, 
  onElementCreate 
}: {
  activeTool: DrawingTool;
  selectedZone: ZoneType | null;
  selectedMarker: MarkerLegendItem | null;
  onElementCreate: (element: any) => void;
}) => {
  const map = useMap();
  const [currentDrawHandler, setCurrentDrawHandler] = useState<any>(null);
  const [drawLibLoaded, setDrawLibLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load leaflet-draw
    const loadLeafletDraw = async () => {
      try {
        await import('leaflet-draw');
        setDrawLibLoaded(true);
      } catch (error) {
        console.error('Failed to load leaflet-draw:', error);
      }
    };

    loadLeafletDraw();
  }, []);

  useEffect(() => {
    if (!map || !drawLibLoaded || !(window as any).L?.Draw) return;

    // Clean up previous handler
    if (currentDrawHandler) {
      currentDrawHandler.disable();
      setCurrentDrawHandler(null);
    }

    // Create new handler based on active tool
    let drawHandler: any = null;
    const DrawLib = (window as any).L.Draw;

    try {
      switch (activeTool) {
        case 'rectangle':
          if (DrawLib.Rectangle) {
            drawHandler = new DrawLib.Rectangle(map, {});
          }
          break;
        case 'circle':
          if (DrawLib.Circle) {
            drawHandler = new DrawLib.Circle(map, {});
          }
          break;
        case 'polygon':
          if (DrawLib.Polygon) {
            drawHandler = new DrawLib.Polygon(map, {});
          }
          break;
        case 'marker':
          if (selectedMarker && DrawLib.Marker) {
            drawHandler = new DrawLib.Marker(map, {});
          }
          break;
        case 'delete':
          // No draw handler needed for delete tool
          break;
        case 'move':
          // No draw handler needed for move tool
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error creating draw handler:', error);
      return;
    }

    if (drawHandler) {
      drawHandler.enable();
      setCurrentDrawHandler(drawHandler);

      // Handle draw creation
      const handleDrawCreated = (e: any) => {
        console.log('Draw created event:', e, 'Active tool:', activeTool);
        const layer = e.layer;
        let geoJSON = layer.toGeoJSON();

        // Add properties based on tool type
        if (activeTool === 'marker' && selectedMarker) {
          geoJSON.properties = {
            ...geoJSON.properties,
            markerType: selectedMarker.id,
            emoji: selectedMarker.emoji,
            label: selectedMarker.label,
            category: selectedMarker.category,
            color: selectedMarker.color
          };
        } else if (activeTool !== 'marker' && selectedZone) {
          geoJSON.properties = {
            ...geoJSON.properties,
            zoneType: selectedZone.id,
            zoneName: selectedZone.name,
            zoneDescription: selectedZone.description,
            zoneCategory: selectedZone.category,
            zoneStyle: selectedZone.style
          };
        }

        console.log('Creating element with geoJSON:', geoJSON);
        onElementCreate({
          type: activeTool as MapElementType,
          geojson: geoJSON
        });

        drawHandler?.disable();
        setCurrentDrawHandler(null);
      };

      map.on(DrawLib.Event.CREATED, handleDrawCreated);

      return () => {
        map.off(DrawLib.Event.CREATED, handleDrawCreated);
        drawHandler?.disable();
      };
    }
  }, [map, activeTool, selectedZone, selectedMarker, onElementCreate]);

  return null;
};

const NewEditorMap = () => {
  const { data: mapElements, loading, error } = useRealtimeMapElements();
  const {
    createMapElement,
    createError,
    updateMapElement,
    debouncedBatchDelete,
    deleteMapElement
  } = useMapElementMutations();

  // UI State
  const [activeTool, setActiveTool] = useState<DrawingTool>('move');
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerLegendItem | null>(null);
  const [isElementsVisible, setIsElementsVisible] = useState(true);
  const [selectedElementForDeletion, setSelectedElementForDeletion] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedElementForMove, setSelectedElementForMove] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Statistics
  const totalShapes = useMemo(() => {
    return mapElements?.filter(el => 
      el.geojson.geometry.type !== 'Point'
    ).length || 0;
  }, [mapElements]);

  const totalMarkers = useMemo(() => {
    return mapElements?.filter(el => 
      el.geojson.geometry.type === 'Point'
    ).length || 0;
  }, [mapElements]);

  const lastUpdate = useMemo(() => {
    if (!mapElements?.length) return null;
    const latest = mapElements.reduce((latest, current) => {
      return current.updatedAt && current.updatedAt > (latest?.updatedAt || new Date(0))
        ? current : latest;
    });
    return latest?.updatedAt || latest?.createdAt || null;
  }, [mapElements]);

  // Tool handlers
  const handleToolChange = (tool: DrawingTool) => {
    setActiveTool(tool);
    
    // Clear selections when switching tools
    if (tool !== 'marker') {
      setSelectedMarker(null);
    }
    
    // Auto-select Safe Zone for drawing tools, clear for non-drawing tools
    if (tool === 'rectangle' || tool === 'circle' || tool === 'polygon') {
      const safeZone = getZoneById('safeZone');
      if (safeZone) {
        setSelectedZone(safeZone);
      }
    } else {
      setSelectedZone(null);
    }
    
    // Clear delete selection when switching away from delete tool
    if (tool !== 'delete') {
      setSelectedElementForDeletion(null);
      setShowDeleteConfirmation(false);
    }
    
    // Clear move selection when switching away from move tool
    if (tool !== 'move') {
      setSelectedElementForMove(null);
      setIsDragging(false);
    }
  };

  // Custom drawing handler
  const handleCustomElementCreate = async (elementData: any) => {
    const result = await createMapElement(elementData);

    if (result) {
      console.log('Element created successfully');
    } else if (createError) {
      alert(`Failed to create element: ${createError}`);
    }
  };



  // Action handlers
  const handleClearAll = () => {
    if (mapElements?.length) {
      const allIds = mapElements.map(el => el.id);
      debouncedBatchDelete(allIds);
    }
  };


  // Delete and Move functionality
  const handleElementClick = (element: any) => {
    if (activeTool === 'delete') {
      setSelectedElementForDeletion(element);
      setShowDeleteConfirmation(true);
    } else if (activeTool === 'move') {
      if (selectedElementForMove?.id === element.id) {
        // Deselect if clicking the same element
        setSelectedElementForMove(null);
      } else {
        // Select element for moving
        setSelectedElementForMove(element);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedElementForDeletion) {
      await deleteMapElement(selectedElementForDeletion.id);
      setSelectedElementForDeletion(null);
      setShowDeleteConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setSelectedElementForDeletion(null);
    setShowDeleteConfirmation(false);
  };

  // Render loading and error states
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading admin interface..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage 
          message={error}
          className="max-w-md"
        />
      </div>
    );
  }


  // Render map elements with proper styling
  const renderMapElement = (element: any) => {
    console.log('Rendering element:', element.id, element.geojson.geometry.type, element.geojson.properties);

    // Handle emoji markers (only for Point geometries with markerType)
    if (element.geojson.geometry.type === 'Point' && element.geojson.properties?.markerType && element.geojson.properties?.emoji) {
      const coords = element.geojson.geometry.coordinates;
      const markerLegend = getMarkerById(element.geojson.properties.markerType);
      
      if (markerLegend) {
        const isSelectedForDeletion = selectedElementForDeletion?.id === element.id;
        const isSelectedForMove = selectedElementForMove?.id === element.id;
        const isSelected = isSelectedForDeletion || isSelectedForMove;
        
        return (
          <Marker
            key={element.id}
            position={[coords[1], coords[0]]}
            icon={createEmojiIcon({
              emoji: markerLegend.emoji,
              backgroundColor: isSelectedForDeletion ? '#fee2e2' : isSelectedForMove ? '#dbeafe' : '#ffffff',
              borderColor: isSelectedForDeletion ? '#dc2626' : isSelectedForMove ? '#2563eb' : markerLegend.color,
              borderWidth: isSelected ? 4 : 3
            })}
            eventHandlers={{
              click: () => handleElementClick(element)
            }}
          />
        );
      }
    }
    
    // Handle all other geometries (polygons, circles, rectangles)
    const getShapeStyle = () => {
      const isSelectedForDeletion = selectedElementForDeletion?.id === element.id;
      const isSelectedForMove = selectedElementForMove?.id === element.id;
      
      if (element.geojson.properties?.zoneType) {
        const zone = getZoneById(element.geojson.properties.zoneType);
        if (zone) {
          console.log('Using zone style:', zone.style);
          return {
            ...zone.style,
            color: isSelectedForDeletion ? '#dc2626' : isSelectedForMove ? '#2563eb' : zone.style.color,
            weight: (isSelectedForDeletion || isSelectedForMove) ? 4 : zone.style.weight || 2,
            fillColor: isSelectedForDeletion ? '#fee2e2' : isSelectedForMove ? '#dbeafe' : zone.style.fillColor,
          };
        }
      }
      
      const defaultStyle = {
        fillColor: isSelectedForDeletion ? '#fee2e2' : isSelectedForMove ? '#dbeafe' : '#3b82f6',
        fillOpacity: 0.2,
        color: isSelectedForDeletion ? '#dc2626' : isSelectedForMove ? '#2563eb' : '#2563eb',
        weight: (isSelectedForDeletion || isSelectedForMove) ? 4 : 2
      };
      console.log('Using default style:', defaultStyle);
      return defaultStyle;
    };
    
    return (
      <GeoJSON 
        key={element.id} 
        data={element.geojson} 
        style={getShapeStyle}
        pointToLayer={(feature, latlng) => {
          // For Point geometries that aren't emoji markers, create a circle marker
          const isSelectedForDeletion = selectedElementForDeletion?.id === element.id;
          const isSelectedForMove = selectedElementForMove?.id === element.id;
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: isSelectedForDeletion ? '#fee2e2' : isSelectedForMove ? '#dbeafe' : '#3b82f6',
            color: isSelectedForDeletion ? '#dc2626' : isSelectedForMove ? '#2563eb' : '#2563eb',
            weight: (isSelectedForDeletion || isSelectedForMove) ? 4 : 2,
            opacity: 1,
            fillOpacity: 0.2
          });
        }}
        eventHandlers={{
          click: () => handleElementClick(element)
        }}
      />
    );
  };

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {/* Unified Admin Toolbar */}
      <AdminToolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onClearAll={handleClearAll}
        isVisible={isElementsVisible}
        onToggleVisibility={() => setIsElementsVisible(!isElementsVisible)}
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
        selectedMarker={selectedMarker}
        onMarkerSelect={setSelectedMarker}
        selectedElementForDeletion={selectedElementForDeletion}
        showDeleteConfirmation={showDeleteConfirmation}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />


      {/* Shape Info Panel */}
      <ShapeInfoPanel
        totalShapes={totalShapes}
        totalMarkers={totalMarkers}
        lastUpdate={lastUpdate}
        isVisible={isElementsVisible}
      />

      {/* Map Container */}
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
        
        {/* Custom Drawing Manager */}
        <DrawingManager
          activeTool={activeTool}
          selectedZone={selectedZone}
          selectedMarker={selectedMarker}
          onElementCreate={handleCustomElementCreate}
        />
        
        {/* Existing map elements - display only */}
        {isElementsVisible && mapElements?.map(renderMapElement)}
      </MapContainer>
    </div>
  );
};

export default NewEditorMap;