'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ZONE_TYPES, ZONE_CATEGORIES, getZonesByCategory, type ZoneType } from '@/src/config/zoneTypes';

interface ZoneStyleSelectorProps {
  selectedZone: ZoneType | null;
  onZoneSelect: (zone: ZoneType | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  activeTool: string;
}

export function ZoneStyleSelector({ 
  selectedZone, 
  onZoneSelect, 
  isOpen, 
  onToggle,
  activeTool
}: ZoneStyleSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof ZONE_CATEGORIES>('safety');

  // Only show when drawing shapes (not markers or select)
  if (activeTool === 'marker' || activeTool === 'select') {
    return null;
  }

  const handleZoneClick = (zone: ZoneType) => {
    onZoneSelect(zone);
    onToggle();
  };

  const handleClearSelection = () => {
    onZoneSelect(null);
    onToggle();
  };

  return (
    <div className="absolute top-4 left-4 z-1000 bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm">
      {/* Zone Type Selector Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full rounded-t-xl"
      >
        {selectedZone ? (
          <>
            <div 
              className="w-6 h-6 rounded-lg border-2 flex items-center justify-center text-sm"
              style={{ 
                backgroundColor: selectedZone.style.fillColor + '40',
                borderColor: selectedZone.style.color
              }}
            >
              {selectedZone.emoji}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{selectedZone.name}</div>
              <div className="text-xs text-gray-500">{selectedZone.description}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              🎨
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Select Zone Type</div>
              <div className="text-xs text-gray-500">Choose color and style</div>
            </div>
          </>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          {/* Clear Selection */}
          {selectedZone && (
            <button
              onClick={handleClearSelection}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <span className="text-lg">🚫</span>
              <span>Use Default Style</span>
            </button>
          )}

          {/* Category Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {Object.entries(ZONE_CATEGORIES).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveCategory(categoryKey as keyof typeof ZONE_CATEGORIES)}
                className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeCategory === categoryKey
                    ? 'text-white border-b-2 bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: activeCategory === categoryKey ? category.color : undefined,
                  borderBottomColor: activeCategory === categoryKey ? category.color : 'transparent'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Zone Options */}
          <div className="p-3 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {getZonesByCategory(activeCategory).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  className={`w-full flex items-center gap-3 p-3 text-sm rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedZone?.id === zone.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* Zone Color Preview */}
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-8 h-6 rounded border-2 flex items-center justify-center text-xs"
                      style={{ 
                        backgroundColor: zone.style.fillColor,
                        borderColor: zone.style.color,
                        opacity: zone.style.fillOpacity + 0.5,
                        borderStyle: zone.style.dashArray ? 'dashed' : 'solid'
                      }}
                    >
                      {zone.emoji}
                    </div>
                    <div className="text-xs text-gray-400 text-center">Preview</div>
                  </div>
                  
                  {/* Zone Info */}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{zone.name}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {zone.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Category Description */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ZONE_CATEGORIES[activeCategory].color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {ZONE_CATEGORIES[activeCategory].label}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {ZONE_CATEGORIES[activeCategory].description}
              </p>
            </div>

            {/* Usage Instructions */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Select a zone type first, then draw on the map. 
                The area will automatically use the selected color scheme and style.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}