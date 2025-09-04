'use client';

import React, { useState, useMemo } from 'react';
import type { Province, ProvinceSelectOption } from '@/src/types/province';
import { IndonesianRegion } from '@/src/types/province';
import { 
  getProvinceSelectOptions, 
  getRegionSelectOptions,
  getProvincesByRegion,
  getProvinceByCode
} from '@/src/config/provinces';

interface ProvinceSelectorProps {
  selectedProvinceCode?: string;
  selectedProvinceCodes?: string[];
  multiple?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showRegionGroups?: boolean;
  allowAll?: boolean;
  onSelectionChange: (selection: string | string[]) => void;
  onProvinceChange?: (province: Province | Province[] | null) => void;
}

export function ProvinceSelector({
  selectedProvinceCode,
  selectedProvinceCodes = [],
  multiple = false,
  placeholder = 'Pilih Provinsi',
  className = '',
  disabled = false,
  showRegionGroups = true,
  allowAll = false,
  onSelectionChange,
  onProvinceChange
}: ProvinceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<IndonesianRegion | 'all'>('all');

  const provinceOptions = useMemo(() => {
    return getProvinceSelectOptions();
  }, []);

  const regionOptions = useMemo(() => {
    const options = getRegionSelectOptions();
    if (allowAll) {
      return [{ value: 'all' as const, label: 'Semua Region' }, ...options];
    }
    return options;
  }, [allowAll]);

  const filteredOptions = useMemo(() => {
    let filtered = provinceOptions;

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(option => option.region === selectedRegion);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [provinceOptions, selectedRegion, searchTerm]);

  const groupedOptions = useMemo(() => {
    if (!showRegionGroups) return { 'all': filteredOptions };

    return filteredOptions.reduce((acc, option) => {
      const region = option.region;
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(option);
      return acc;
    }, {} as Record<IndonesianRegion | string, ProvinceSelectOption[]>);
  }, [filteredOptions, showRegionGroups]);

  const currentSelection = useMemo(() => {
    if (multiple) {
      return selectedProvinceCodes
        .map(code => getProvinceByCode(code))
        .filter(Boolean) as Province[];
    } else {
      return selectedProvinceCode ? getProvinceByCode(selectedProvinceCode) : null;
    }
  }, [multiple, selectedProvinceCodes, selectedProvinceCode]);

  const handleOptionClick = (option: ProvinceSelectOption) => {
    if (multiple) {
      const newSelection = selectedProvinceCodes.includes(option.value)
        ? selectedProvinceCodes.filter(code => code !== option.value)
        : [...selectedProvinceCodes, option.value];
      
      onSelectionChange(newSelection);
      
      if (onProvinceChange) {
        const provinces = newSelection
          .map(code => getProvinceByCode(code))
          .filter(Boolean) as Province[];
        onProvinceChange(provinces);
      }
    } else {
      onSelectionChange(option.value);
      if (onProvinceChange) {
        const province = getProvinceByCode(option.value);
        onProvinceChange(province || null);
      }
      setIsOpen(false);
    }
  };

  const handleClearSelection = () => {
    if (multiple) {
      onSelectionChange([]);
      onProvinceChange?.([]);
    } else {
      onSelectionChange('');
      onProvinceChange?.(null);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedProvinceCodes.length === 0) return placeholder;
      if (selectedProvinceCodes.length === 1) {
        const province = getProvinceByCode(selectedProvinceCodes[0]);
        return province?.name || placeholder;
      }
      return `${selectedProvinceCodes.length} provinsi dipilih`;
    } else {
      const province = getProvinceByCode(selectedProvinceCode || '');
      return province?.name || placeholder;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          hover:bg-gray-50 transition-colors
        `}
      >
        <div className="flex items-center justify-between">
          <span className="block truncate text-sm">
            {getDisplayText()}
          </span>
          <div className="flex items-center space-x-2">
            {/* Clear Button */}
            {((multiple && selectedProvinceCodes.length > 0) || 
              (!multiple && selectedProvinceCode)) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            {/* Dropdown Arrow */}
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
          {/* Search and Region Filter */}
          <div className="p-3 border-b border-gray-200 space-y-2">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as IndonesianRegion | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {regionOptions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(groupedOptions).map(([regionKey, options]) => (
              <div key={regionKey}>
                {showRegionGroups && options.length > 0 && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 border-b border-gray-200">
                    {regionKey === 'all' ? 'Semua Provinsi' : regionKey}
                  </div>
                )}
                
                {options.map((option) => {
                  const isSelected = multiple 
                    ? selectedProvinceCodes.includes(option.value)
                    : selectedProvinceCode === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      disabled={option.disabled}
                      className={`
                        w-full px-3 py-2 text-left text-sm hover:bg-gray-100 
                        focus:outline-none focus:bg-gray-100
                        disabled:text-gray-400 disabled:cursor-not-allowed
                        ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {multiple && isSelected && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-6 text-center text-gray-500 text-sm">
                Tidak ada provinsi yang ditemukan
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click Outside Handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Simple Province Badge Component
interface ProvinceBadgeProps {
  provinceCode: string;
  className?: string;
  showFullName?: boolean;
  onRemove?: () => void;
}

export function ProvinceBadge({ 
  provinceCode, 
  className = '', 
  showFullName = false,
  onRemove
}: ProvinceBadgeProps) {
  const province = getProvinceByCode(provinceCode);
  
  if (!province) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {showFullName ? province.name : province.code}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 text-blue-400 hover:text-blue-600"
        >
          ✕
        </button>
      )}
    </span>
  );
}

// Province List Component for displaying selected provinces
interface ProvinceListProps {
  provinceCodes: string[];
  onRemove?: (provinceCode: string) => void;
  className?: string;
}

export function ProvinceList({ 
  provinceCodes, 
  onRemove, 
  className = '' 
}: ProvinceListProps) {
  if (provinceCodes.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Belum ada provinsi dipilih
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {provinceCodes.map(code => (
        <ProvinceBadge
          key={code}
          provinceCode={code}
          showFullName
          onRemove={onRemove ? () => onRemove(code) : undefined}
        />
      ))}
    </div>
  );
}