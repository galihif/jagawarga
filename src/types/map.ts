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
  createdAt: Date;
  updatedAt?: Date;
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