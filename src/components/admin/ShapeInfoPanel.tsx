'use client';

interface ShapeInfoPanelProps {
  totalShapes: number;
  totalMarkers: number;
  lastUpdate: Date | null;
  isVisible: boolean;
}

export function ShapeInfoPanel({ 
  totalShapes, 
  totalMarkers, 
  lastUpdate, 
  isVisible 
}: ShapeInfoPanelProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-4 z-1000 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Live Status
      </h4>
      
      <div className="space-y-3">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalShapes}</div>
            <div className="text-xs text-blue-500">Zones Drawn</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalMarkers}</div>
            <div className="text-xs text-green-500">Markers Placed</div>
          </div>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600">Last Update</div>
            <div className="text-sm font-medium text-gray-800">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Real-time Sync
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Auto-save Active
          </span>
        </div>
      </div>
    </div>
  );
}