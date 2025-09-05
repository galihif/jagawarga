import type { LatLngExpression } from 'leaflet';

export interface GeoJSONProperties {
  id?: string;
  [key: string]: unknown;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONProperties;
  geometry: GeoJSONGeometry;
}

export interface MapElement {
  id: string;
  type: MapElementType;
  geojson: GeoJSONFeature;
  province: string; // Province code where this element belongs
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string; // User ID of creator
  createdByName?: string; // Display name of creator
}

export enum MapElementType {
  MARKER = 'marker',
  POLYGON = 'polygon',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  POLYLINE = 'polyline'
}

export interface MapConfig {
  center: LatLngExpression;
  zoom: number;
  maxZoom?: number;
  minZoom?: number;
}

export interface MapStyle {
  color: string;
  weight: number;
  fillColor?: string;
  fillOpacity?: number;
  opacity?: number;
}

export interface CreateMapElementRequest {
  type: MapElementType;
  geojson: GeoJSONFeature;
  province?: string; // Optional - will be auto-detected from user if not provided
  createdBy?: string; // Optional - will be auto-set from authenticated user
  createdByName?: string; // Optional - will be auto-set from authenticated user
}

export interface UpdateMapElementRequest {
  id: string;
  geojson: GeoJSONFeature;
}

export interface DeleteMapElementRequest {
  id: string;
}

export interface BatchDeleteMapElementsRequest {
  ids: string[];
}