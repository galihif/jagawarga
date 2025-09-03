// Type definitions for Leaflet Draw events and layers
export interface LeafletDrawEvent {
  layerType: string;
  layer: {
    toGeoJSON(): any;
  };
}

export interface LeafletEditEvent {
  layers: {
    _layers: {
      [key: string]: {
        feature: {
          properties?: {
            id?: string;
          } | null;
        };
        toGeoJSON(): any;
      };
    };
  };
}

export interface LeafletDeleteEvent {
  layers: {
    _layers: {
      [key: string]: {
        feature?: {
          properties?: {
            id?: string;
          } | null;
        };
      };
    };
  };
}