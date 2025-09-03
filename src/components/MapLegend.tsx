'use client';

import { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { MARKER_CATEGORIES, getAllMarkers } from '@/src/config/markerLegend';

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className = '' }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(Object.keys(MARKER_CATEGORIES))
  );

  const toggleCategory = (categoryKey: string) => {
    const newVisible = new Set(visibleCategories);
    if (newVisible.has(categoryKey)) {
      newVisible.delete(categoryKey);
    } else {
      newVisible.add(categoryKey);
    }
    setVisibleCategories(newVisible);
  };

  const allMarkers = getAllMarkers();
  const markersByCategory = Object.keys(MARKER_CATEGORIES).reduce((acc, categoryKey) => {
    acc[categoryKey] = allMarkers.filter(marker => marker.category === categoryKey);
    return acc;
  }, {} as Record<string, typeof allMarkers>);

  return (
    <div className={`absolute bottom-4 left-4 z-1000 bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm ${className}`}>
      {/* Legend Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full rounded-t-lg"
      >
        <Info className="w-4 h-4" />
        <span>Map Legend</span>
        <span className="ml-auto text-xs text-gray-500">
          {isExpanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Category Filters */}
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-600 mb-2">Show Categories:</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(MARKER_CATEGORIES).map(([categoryKey, category]) => (
                <button
                  key={categoryKey}
                  onClick={() => toggleCategory(categoryKey)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                    visibleCategories.has(categoryKey)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  {visibleCategories.has(categoryKey) ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend Items */}
          <div className="p-3 max-h-96 overflow-y-auto">
            {Object.entries(MARKER_CATEGORIES).map(([categoryKey, category]) => {
              if (!visibleCategories.has(categoryKey)) return null;
              
              const categoryMarkers = markersByCategory[categoryKey] || [];
              
              return (
                <div key={categoryKey} className="mb-4 last:mb-0">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h4 className="text-sm font-medium text-gray-800">
                      {category.label}
                    </h4>
                  </div>

                  {/* Category Markers */}
                  <div className="space-y-1 ml-5">
                    {categoryMarkers.map((marker) => (
                      <div 
                        key={marker.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span 
                          className="text-sm w-6 h-6 rounded-full flex items-center justify-center border"
                          style={{ 
                            borderColor: marker.color,
                            backgroundColor: marker.color + '10'
                          }}
                        >
                          {marker.emoji}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-700">
                            {marker.label}
                          </div>
                          <div className="text-gray-500">
                            {marker.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Instructions */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                💡 <strong>Admin Tip:</strong> Select a marker type from the selector above, 
                then click on the map to place it. Use drawing tools for areas and routes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}