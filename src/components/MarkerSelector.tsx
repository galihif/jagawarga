'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { MARKER_CATEGORIES, MARKER_LEGEND, getMarkersByCategory, type MarkerLegendItem } from '@/src/config/markerLegend';

interface MarkerSelectorProps {
  selectedMarker: MarkerLegendItem | null;
  onMarkerSelect: (marker: MarkerLegendItem | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function MarkerSelector({ 
  selectedMarker, 
  onMarkerSelect, 
  isOpen, 
  onToggle 
}: MarkerSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof MARKER_CATEGORIES>('info');

  const handleMarkerClick = (marker: MarkerLegendItem) => {
    onMarkerSelect(marker);
    onToggle(); // Close the selector after selection
  };

  const handleClearSelection = () => {
    onMarkerSelect(null);
    onToggle();
  };

  return (
    <div className="absolute top-4 left-4 z-1000 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Selector Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full rounded-t-lg"
      >
        {selectedMarker ? (
          <>
            <span className="text-lg">{selectedMarker.emoji}</span>
            <span>{selectedMarker.label}</span>
          </>
        ) : (
          <>
            <span className="text-lg">📍</span>
            <span>Select Marker Type</span>
          </>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          {/* Clear Selection Button */}
          {selectedMarker && (
            <button
              onClick={handleClearSelection}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <X className="w-4 h-4" />
              <span>Clear Selection</span>
            </button>
          )}

          {/* Category Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {Object.entries(MARKER_CATEGORIES).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveCategory(categoryKey as keyof typeof MARKER_CATEGORIES)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  activeCategory === categoryKey
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ 
                  borderBottomColor: activeCategory === categoryKey ? category.color : 'transparent'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Marker Grid */}
          <div className="p-3 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {getMarkersByCategory(activeCategory).map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => handleMarkerClick(marker)}
                  className={`flex items-center gap-2 p-2 text-sm rounded-md border-2 transition-all hover:shadow-md ${
                    selectedMarker?.id === marker.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  title={marker.description}
                >
                  <span 
                    className="text-lg flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedMarker?.id === marker.id ? marker.color + '20' : 'transparent',
                      border: selectedMarker?.id === marker.id ? `2px solid ${marker.color}` : 'none'
                    }}
                  >
                    {marker.emoji}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{marker.label}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {marker.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Category Description */}
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>{MARKER_CATEGORIES[activeCategory].label}:</strong>{' '}
                {MARKER_CATEGORIES[activeCategory].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}