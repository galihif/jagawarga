'use client';

import { useState } from 'react';
import { 
  Square, 
  Circle, 
  Triangle, 
  MapPin, 
  Trash2, 
  Eye,
  EyeOff,
  Info,
  Settings,
  MousePointer
} from 'lucide-react';

export type DrawingTool = 'delete' | 'marker' | 'rectangle' | 'circle' | 'polygon';

import { ZONE_TYPES, ZONE_CATEGORIES, getZonesByCategory, getZoneById, type ZoneType } from '@/src/config/zoneTypes';
import { MARKER_LEGEND, MARKER_CATEGORIES, getMarkersByCategory, getMarkerById, type MarkerLegendItem } from '@/src/config/markerLegend';

interface AdminToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClearAll: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  // New props for integrated selectors
  selectedZone: ZoneType | null;
  onZoneSelect: (zone: ZoneType | null) => void;
  selectedMarker: MarkerLegendItem | null;
  onMarkerSelect: (marker: MarkerLegendItem | null) => void;
  // Delete confirmation props
  selectedElementForDeletion: any;
  showDeleteConfirmation: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function AdminToolbar({
  activeTool,
  onToolChange,
  onClearAll,
  isVisible,
  onToggleVisibility,
  selectedZone,
  onZoneSelect,
  selectedMarker,
  onMarkerSelect,
  selectedElementForDeletion,
  showDeleteConfirmation,
  onConfirmDelete,
  onCancelDelete
}: AdminToolbarProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [activeZoneCategory, setActiveZoneCategory] = useState<keyof typeof ZONE_CATEGORIES>('safety');
  const [activeMarkerCategory, setActiveMarkerCategory] = useState<keyof typeof MARKER_CATEGORIES>('emergency');

  const tools = [
    {
      id: 'delete' as DrawingTool,
      icon: MousePointer,
      label: 'Select to Delete',
      description: 'Click elements to select and delete them',
      color: 'bg-red-100 text-red-700 hover:bg-red-200'
    },
    {
      id: 'marker' as DrawingTool,
      icon: MapPin,
      label: 'Place Marker',
      description: 'Add emoji markers for specific incidents',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      id: 'rectangle' as DrawingTool,
      icon: Square,
      label: 'Draw Area',
      description: 'Draw rectangular zones',
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      id: 'circle' as DrawingTool,
      icon: Circle,
      label: 'Draw Circle',
      description: 'Draw circular zones',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    {
      id: 'polygon' as DrawingTool,
      icon: Triangle,
      label: 'Draw Polygon',
      description: 'Draw custom shaped zones',
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    }
  ];

  const handleClearAll = () => {
    if (showConfirmClear) {
      onClearAll();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-1000 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-96 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Admin Tools</h3>
            <p className="text-xs text-gray-500">All controls in one place</p>
          </div>
        </div>
        
        <button
          onClick={onToggleVisibility}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isVisible ? 'Hide all elements' : 'Show all elements'}
        >
          {isVisible ? (
            <Eye className="w-4 h-4 text-gray-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Drawing Tools */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Step 1: Select Tool</h4>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`p-3 rounded-xl border-2 transition-all group ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                }`}
                title={tool.description}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-500 text-white' : tool.color
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium leading-tight text-center ${
                    isActive ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {tool.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone Style Selector - for shape tools */}
      {(activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'polygon') && (
        <div className="mb-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Step 2: Choose Zone Style</h4>
          
          {/* Zone Category Tabs */}
          <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
            {Object.entries(ZONE_CATEGORIES).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveZoneCategory(categoryKey as keyof typeof ZONE_CATEGORIES)}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeZoneCategory === categoryKey
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Zone Options */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getZonesByCategory(activeZoneCategory).map((zone) => (
              <button
                key={zone.id}
                onClick={() => onZoneSelect(zone)}
                className={`w-full flex items-center gap-3 p-2 text-sm rounded-lg border-2 transition-all ${
                  selectedZone?.id === zone.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Zone Color Preview */}
                <div 
                  className="w-6 h-6 rounded border-2 flex items-center justify-center text-xs"
                  style={{ 
                    backgroundColor: zone.style.fillColor,
                    borderColor: zone.style.color,
                    opacity: zone.style.fillOpacity + 0.5,
                    borderStyle: zone.style.dashArray ? 'dashed' : 'solid'
                  }}
                >
                  {zone.emoji}
                </div>
                
                {/* Zone Info */}
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800 text-sm leading-tight">{zone.name}</div>
                  <div className="text-xs text-gray-500 leading-tight">
                    {zone.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Marker Selector - for marker tool */}
      {activeTool === 'marker' && (
        <div className="mb-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Step 2: Choose Marker Type</h4>
          
          {/* Marker Category Tabs */}
          <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
            {Object.entries(MARKER_CATEGORIES).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveMarkerCategory(categoryKey as keyof typeof MARKER_CATEGORIES)}
                className={`flex-1 px-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMarkerCategory === categoryKey
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Marker Options */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Clear Selection */}
            {selectedMarker && (
              <button
                onClick={() => onMarkerSelect(null)}
                className="w-full flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
              >
                <span className="text-base">🚫</span>
                <span>Clear Selection</span>
              </button>
            )}
            
            {getMarkersByCategory(activeMarkerCategory).map((marker) => (
              <button
                key={marker.id}
                onClick={() => onMarkerSelect(marker)}
                className={`w-full flex items-center gap-3 p-2 text-sm rounded-lg border-2 transition-all ${
                  selectedMarker?.id === marker.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Marker Preview */}
                <div 
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: marker.color
                  }}
                >
                  {marker.emoji}
                </div>
                
                {/* Marker Info */}
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800 text-sm leading-tight">{marker.label}</div>
                  <div className="text-xs text-gray-500 leading-tight">
                    {marker.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Selection Display */}
      {(selectedZone || selectedMarker) && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Ready to Draw</span>
          </div>
          {selectedZone && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedZone.emoji}</span>
              <span className="text-sm text-green-600">{selectedZone.name} - Click and drag on map</span>
            </div>
          )}
          {selectedMarker && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedMarker.emoji}</span>
              <span className="text-sm text-green-600">{selectedMarker.label} - Click on map to place</span>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Section */}
      {showDeleteConfirmation && selectedElementForDeletion && (
        <div className="border-t pt-4 mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-3">Confirm Deletion</h4>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-red-600 mb-3">
              Are you sure you want to delete this element?
            </p>
            
            {/* Element Preview */}
            <div className="bg-white p-3 rounded border mb-3">
              {selectedElementForDeletion.geojson.geometry.type === 'Point' && selectedElementForDeletion.geojson.properties?.markerType ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedElementForDeletion.geojson.properties.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {selectedElementForDeletion.geojson.properties.label || 'Marker'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedElementForDeletion.geojson.properties.category || 'Unknown'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{
                      backgroundColor: selectedElementForDeletion.geojson.properties?.zoneStyle?.fillColor || '#3b82f6',
                      borderColor: selectedElementForDeletion.geojson.properties?.zoneStyle?.color || '#2563eb',
                      opacity: 0.7
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {selectedElementForDeletion.geojson.properties?.zoneName || 'Zone'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedElementForDeletion.geojson.geometry.type}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirmation Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onCancelDelete}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        
        {!showConfirmClear ? (
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-600 text-center font-medium">
              Delete all elements?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}