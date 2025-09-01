export interface MarkerLegendItem {
  id: string;
  emoji: string;
  label: string;
  description: string;
  category: 'emergency' | 'security' | 'logistics' | 'medical' | 'info';
  color: string;
}

export const MARKER_LEGEND: Record<string, MarkerLegendItem> = {
  fire: {
    id: 'fire',
    emoji: '🔥',
    label: 'Fire/Hazard',
    description: 'Fire incident or dangerous area',
    category: 'emergency',
    color: '#ef4444'
  },
  medical: {
    id: 'medical',
    emoji: '🏥',
    label: 'Medical Post',
    description: 'Medical assistance available',
    category: 'medical',
    color: '#22c55e'
  },
  medic: {
    id: 'medic',
    emoji: '⛑️',
    label: 'Medic Team',
    description: 'Mobile medical team location',
    category: 'medical',
    color: '#22c55e'
  },
  ambulance: {
    id: 'ambulance',
    emoji: '🚑',
    label: 'Ambulance',
    description: 'Ambulance stationed or en route',
    category: 'medical',
    color: '#22c55e'
  },
  logistics: {
    id: 'logistics',
    emoji: '📦',
    label: 'Supply Point',
    description: 'Logistics and supply distribution',
    category: 'logistics',
    color: '#3b82f6'
  },
  water: {
    id: 'water',
    emoji: '🚰',
    label: 'Water Station',
    description: 'Drinking water available',
    category: 'logistics',
    color: '#06b6d4'
  },
  food: {
    id: 'food',
    emoji: '🍽️',
    label: 'Food Distribution',
    description: 'Food and refreshments available',
    category: 'logistics',
    color: '#f59e0b'
  },
  restroom: {
    id: 'restroom',
    emoji: '🚻',
    label: 'Restroom',
    description: 'Public restroom facilities',
    category: 'logistics',
    color: '#8b5cf6'
  },
  riot: {
    id: 'riot',
    emoji: '⚠️',
    label: 'Riot/Conflict',
    description: 'Violence or conflict area - avoid',
    category: 'emergency',
    color: '#dc2626'
  },
  police: {
    id: 'police',
    emoji: '👮',
    label: 'Police',
    description: 'Police presence or checkpoint',
    category: 'security',
    color: '#1e40af'
  },
  policeCar: {
    id: 'policeCar',
    emoji: '🚔',
    label: 'Police Vehicle',
    description: 'Police patrol or stationed unit',
    category: 'security',
    color: '#1e40af'
  },
  military: {
    id: 'military',
    emoji: '⚔️',
    label: 'Military',
    description: 'Military personnel or checkpoint',
    category: 'security',
    color: '#059669'
  },
  tank: {
    id: 'tank',
    emoji: '🚗',
    label: 'Armored Vehicle',
    description: 'Military vehicle presence',
    category: 'security',
    color: '#059669'
  },
  roadblock: {
    id: 'roadblock',
    emoji: '🚧',
    label: 'Road Block',
    description: 'Road closed or blocked',
    category: 'info',
    color: '#f59e0b'
  },
  safeZone: {
    id: 'safeZone',
    emoji: '✅',
    label: 'Safe Zone',
    description: 'Confirmed safe area',
    category: 'info',
    color: '#10b981'
  },
  dangerZone: {
    id: 'dangerZone',
    emoji: '❌',
    label: 'Danger Zone',
    description: 'Dangerous area - avoid',
    category: 'emergency',
    color: '#dc2626'
  },
  assembly: {
    id: 'assembly',
    emoji: '👥',
    label: 'Assembly Point',
    description: 'Gathering or meeting location',
    category: 'info',
    color: '#6366f1'
  },
  speaker: {
    id: 'speaker',
    emoji: '📢',
    label: 'Speaker/Stage',
    description: 'Speaking event or announcement area',
    category: 'info',
    color: '#8b5cf6'
  },
  parking: {
    id: 'parking',
    emoji: '🅿️',
    label: 'Parking Area',
    description: 'Vehicle parking location',
    category: 'logistics',
    color: '#64748b'
  },
  exit: {
    id: 'exit',
    emoji: '🚪',
    label: 'Emergency Exit',
    description: 'Emergency evacuation route',
    category: 'info',
    color: '#22c55e'
  },
  communication: {
    id: 'communication',
    emoji: '📡',
    label: 'Communication Hub',
    description: 'Communication or coordination center',
    category: 'logistics',
    color: '#0ea5e9'
  }
};

export const MARKER_CATEGORIES = {
  emergency: {
    label: 'Emergency',
    color: '#ef4444',
    description: 'Critical incidents and hazards'
  },
  medical: {
    label: 'Medical',
    color: '#22c55e',
    description: 'Healthcare and medical services'
  },
  security: {
    label: 'Security Forces',
    color: '#1e40af',
    description: 'Police, military, and security'
  },
  logistics: {
    label: 'Logistics',
    color: '#3b82f6',
    description: 'Supplies, facilities, and services'
  },
  info: {
    label: 'Information',
    color: '#6366f1',
    description: 'General information and locations'
  }
} as const;

// Get markers by category
export function getMarkersByCategory(category: keyof typeof MARKER_CATEGORIES): MarkerLegendItem[] {
  return Object.values(MARKER_LEGEND).filter(marker => marker.category === category);
}

// Get all markers as array
export function getAllMarkers(): MarkerLegendItem[] {
  return Object.values(MARKER_LEGEND);
}

// Get marker by ID
export function getMarkerById(id: string): MarkerLegendItem | undefined {
  return MARKER_LEGEND[id];
}