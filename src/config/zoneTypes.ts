export interface ZoneStyle {
  fillColor: string;
  fillOpacity: number;
  color: string; // border color
  weight: number; // border weight
  dashArray?: string;
}

export interface ZoneType {
  id: string;
  name: string;
  description: string;
  emoji: string;
  style: ZoneStyle;
  category: 'safety' | 'danger' | 'neutral' | 'restricted' | 'service';
  priority: number; // Higher priority zones appear on top
}

export const ZONE_TYPES: Record<string, ZoneType> = {
  safeZone: {
    id: 'safeZone',
    name: 'Safe Zone',
    description: 'Designated safe area - recommended for gathering',
    emoji: '🟢',
    category: 'safety',
    priority: 1,
    style: {
      fillColor: '#22c55e',
      fillOpacity: 0.3,
      color: '#16a34a',
      weight: 3
    }
  },
  
  assemblyPoint: {
    id: 'assemblyPoint',
    name: 'Assembly Point',
    description: 'Primary gathering location for participants',
    emoji: '🟡',
    category: 'neutral',
    priority: 2,
    style: {
      fillColor: '#eab308',
      fillOpacity: 0.4,
      color: '#ca8a04',
      weight: 3
    }
  },
  
  cautionZone: {
    id: 'cautionZone',
    name: 'Caution Zone',
    description: 'Exercise caution - potential risks present',
    emoji: '🟠',
    category: 'neutral',
    priority: 3,
    style: {
      fillColor: '#f97316',
      fillOpacity: 0.3,
      color: '#ea580c',
      weight: 3,
      dashArray: '5, 5'
    }
  },
  
  dangerZone: {
    id: 'dangerZone',
    name: 'Danger Zone',
    description: 'High risk area - avoid this location',
    emoji: '🔴',
    category: 'danger',
    priority: 4,
    style: {
      fillColor: '#ef4444',
      fillOpacity: 0.4,
      color: '#dc2626',
      weight: 4
    }
  },
  
  noGoZone: {
    id: 'noGoZone',
    name: 'No-Go Zone',
    description: 'Extremely dangerous - do not enter',
    emoji: '⚫',
    category: 'danger',
    priority: 5,
    style: {
      fillColor: '#991b1b',
      fillOpacity: 0.5,
      color: '#7f1d1d',
      weight: 4,
      dashArray: '10, 5'
    }
  },
  
  restrictedArea: {
    id: 'restrictedArea',
    name: 'Restricted Area',
    description: 'Access limited - authorization required',
    emoji: '🚫',
    category: 'restricted',
    priority: 3,
    style: {
      fillColor: '#8b5cf6',
      fillOpacity: 0.3,
      color: '#7c3aed',
      weight: 3,
      dashArray: '8, 4'
    }
  },
  
  medicalZone: {
    id: 'medicalZone',
    name: 'Medical Zone',
    description: 'Medical services and first aid available',
    emoji: '🏥',
    category: 'service',
    priority: 2,
    style: {
      fillColor: '#06b6d4',
      fillOpacity: 0.3,
      color: '#0891b2',
      weight: 3
    }
  },
  
  logisticsZone: {
    id: 'logisticsZone',
    name: 'Logistics Zone',
    description: 'Supply distribution and coordination area',
    emoji: '📦',
    category: 'service',
    priority: 1,
    style: {
      fillColor: '#3b82f6',
      fillOpacity: 0.25,
      color: '#2563eb',
      weight: 2
    }
  },
  
  evacuationRoute: {
    id: 'evacuationRoute',
    name: 'Evacuation Route',
    description: 'Emergency exit path - keep clear',
    emoji: '🚪',
    category: 'safety',
    priority: 4,
    style: {
      fillColor: '#10b981',
      fillOpacity: 0.2,
      color: '#059669',
      weight: 4,
      dashArray: '15, 5'
    }
  },
  
  securityPerimeter: {
    id: 'securityPerimeter',
    name: 'Security Perimeter',
    description: 'Security forces operational area',
    emoji: '🛡️',
    category: 'restricted',
    priority: 2,
    style: {
      fillColor: '#64748b',
      fillOpacity: 0.2,
      color: '#475569',
      weight: 2,
      dashArray: '3, 3'
    }
  }
};

export const ZONE_CATEGORIES = {
  safety: {
    label: 'Safety Zones',
    description: 'Safe areas and evacuation routes',
    color: '#22c55e'
  },
  danger: {
    label: 'Danger Zones',
    description: 'High-risk areas to avoid',
    color: '#ef4444'
  },
  neutral: {
    label: 'General Areas',
    description: 'Assembly points and caution zones',
    color: '#f59e0b'
  },
  restricted: {
    label: 'Restricted Areas',
    description: 'Limited access zones',
    color: '#8b5cf6'
  },
  service: {
    label: 'Service Areas',
    description: 'Medical, logistics, and support zones',
    color: '#3b82f6'
  }
} as const;

// Get zones by category
export function getZonesByCategory(category: keyof typeof ZONE_CATEGORIES): ZoneType[] {
  return Object.values(ZONE_TYPES).filter(zone => zone.category === category);
}

// Get all zones sorted by priority
export function getAllZonesSorted(): ZoneType[] {
  return Object.values(ZONE_TYPES).sort((a, b) => b.priority - a.priority);
}

// Get zone by ID
export function getZoneById(id: string): ZoneType | undefined {
  return ZONE_TYPES[id];
}