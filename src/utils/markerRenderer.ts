import L from 'leaflet';
import type { MarkerLegendItem } from '@/src/config/markerLegend';

export interface EmojiMarkerOptions extends L.MarkerOptions {
  emoji: string;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export class EmojiMarker extends L.Marker {
  constructor(latlng: L.LatLngExpression, options: EmojiMarkerOptions) {
    const icon = createEmojiIcon(options);
    super(latlng, { ...options, icon });
  }
}

export function createEmojiIcon(options: EmojiMarkerOptions): L.DivIcon {
  const {
    emoji,
    size = 40,
    backgroundColor = '#ffffff',
    borderColor = '#000000',
    borderWidth = 2
  } = options;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${backgroundColor};
      border: ${borderWidth}px solid ${borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${size * 0.6}px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      user-select: none;
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'emoji-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

export function createMarkerFromLegend(
  latlng: L.LatLngExpression, 
  legendItem: MarkerLegendItem,
  options: Partial<EmojiMarkerOptions> = {}
): EmojiMarker {
  return new EmojiMarker(latlng, {
    emoji: legendItem.emoji,
    backgroundColor: '#ffffff',
    borderColor: legendItem.color,
    borderWidth: 3,
    ...options
  });
}

// Create a marker icon for the draw control
export function createDrawControlIcon(legendItem: MarkerLegendItem): L.Icon {
  const canvas = document.createElement('canvas');
  canvas.width = 25;
  canvas.height = 41; // Standard leaflet marker height
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw marker shape background
  ctx.fillStyle = legendItem.color;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  // Draw teardrop shape
  ctx.beginPath();
  ctx.arc(12.5, 15, 12, 0, Math.PI * 2);
  ctx.moveTo(12.5, 27);
  ctx.lineTo(12.5, 39);
  ctx.fill();
  ctx.stroke();
  
  // Draw emoji
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';
  ctx.fillText(legendItem.emoji, 12.5, 15);

  const dataUrl = canvas.toDataURL();
  
  return L.icon({
    iconUrl: dataUrl,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41]
  });
}

// Helper to get CSS class for marker category
export function getMarkerCategoryClass(category: string): string {
  const categoryClasses: Record<string, string> = {
    emergency: 'marker-emergency',
    medical: 'marker-medical',
    security: 'marker-security',
    logistics: 'marker-logistics',
    info: 'marker-info'
  };
  
  return categoryClasses[category] || 'marker-default';
}