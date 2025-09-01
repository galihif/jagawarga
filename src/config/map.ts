import type { MapConfig, MapStyle } from '@/src/types/map';

export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: [-6.2088, 106.8456], // Jakarta coordinates
  zoom: 13,
  maxZoom: 18,
  minZoom: 3
};

export const MAP_STYLES = {
  PUBLIC: {
    color: '#e60000',
    weight: 2,
    fillColor: '#ff3333',
    fillOpacity: 0.4,
    opacity: 1
  } as MapStyle,
  
  EDITOR: {
    color: '#2563eb',
    weight: 2,
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    opacity: 1
  } as MapStyle
};

export const TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

export const DEBOUNCE_DELAYS = {
  DELETE: 100,
  SEARCH: 300,
  SAVE: 500
} as const;

export const FIREBASE_COLLECTIONS = {
  MAP_ELEMENTS: 'map_elements'
} as const;