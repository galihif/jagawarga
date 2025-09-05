'use client';

import React, { useState } from 'react';
import { ProvinceSelector } from '@/src/components/ui/ProvinceSelector';
import { useAuth } from '@/src/hooks/useAuth';
import { getProvinceByCode, PROVINCES } from '@/src/config/provinces';
import type { Province } from '@/src/types/province';

interface ProvinceFilterProps {
  selectedProvinces: string[];
  onProvinceChange: (provinces: string[]) => void;
  className?: string;
}

export function ProvinceFilter({ selectedProvinces, onProvinceChange, className = '' }: ProvinceFilterProps) {
  const { user } = useAuth();
  const [showSelector, setShowSelector] = useState(false);

  // If user is volunteer, they can't change provinces
  if (user?.role === 'volunteer') {
    const province = user.assignedProvince ? getProvinceByCode(user.assignedProvince) : null;
    
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900">Your Province</h3>
            <p className="text-sm text-blue-700">
              {province ? province.name : 'No province assigned'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Volunteer
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Owner view - can select multiple provinces
  const selectedProvinceNames = selectedProvinces
    .map(code => getProvinceByCode(code))
    .filter(Boolean)
    .map(p => p!.name);

  const handleSelectAll = () => {
    onProvinceChange(PROVINCES.map(p => p.code));
  };

  const handleClearAll = () => {
    onProvinceChange([]);
  };

  const showingAll = selectedProvinces.length === 0 || selectedProvinces.length === PROVINCES.length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Province Filter</h3>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Owner
            </span>
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showSelector ? 'Hide' : 'Change'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {showingAll ? (
              <span className="font-medium text-green-600">Showing all provinces</span>
            ) : (
              <span>
                Showing <span className="font-medium text-blue-600">{selectedProvinces.length}</span> of {PROVINCES.length} provinces
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-gray-500 hover:text-gray-700"
              disabled={showingAll}
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
              disabled={selectedProvinces.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Selected provinces preview */}
      {!showingAll && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-1">
            {selectedProvinceNames.slice(0, 5).map((name, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {name}
              </span>
            ))}
            {selectedProvinceNames.length > 5 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                +{selectedProvinceNames.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Province selector */}
      {showSelector && (
        <div className="p-4">
          <ProvinceSelector
            value={selectedProvinces}
            onChange={onProvinceChange}
            multiple={true}
            placeholder="Select provinces to view..."
            className="w-full"
          />
          
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={() => setShowSelector(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>View: {showingAll ? 'All Provinces' : `${selectedProvinces.length} Selected`}</span>
          <span>Total: {PROVINCES.length} provinces</span>
        </div>
      </div>
    </div>
  );
}

// Simple province indicator for display in other components
export function ProvinceIndicator({ 
  provinces, 
  showingAll = false, 
  className = '' 
}: { 
  provinces: string[]; 
  showingAll?: boolean; 
  className?: string; 
}) {
  const provinceNames = provinces
    .map(code => getProvinceByCode(code))
    .filter(Boolean)
    .map(p => p!.name);

  if (showingAll) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        All Provinces
      </span>
    );
  }

  if (provinces.length === 0) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 ${className}`}>
        No provinces
      </span>
    );
  }

  if (provinces.length === 1) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
        {provinceNames[0]}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {provinces.length} provinces
    </span>
  );
}