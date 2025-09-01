import { useState, useEffect, useCallback } from 'react';
import type { AsyncState } from '@/src/types/common';
import type { MapElement } from '@/src/types/map';
import { mapElementService, type MapElementServiceInterface } from '@/src/services/mapElementService';

export interface UseMapElementsReturn extends AsyncState<MapElement[]> {
  refetch: () => Promise<void>;
}

export function useMapElements(
  service: MapElementServiceInterface = mapElementService
): UseMapElementsReturn {
  const [state, setState] = useState<AsyncState<MapElement[]>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchMapElements = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await service.getAllMapElements();
      
      if (response.error) {
        setState({
          data: null,
          loading: false,
          error: response.error
        });
        return;
      }

      setState({
        data: response.data || [],
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch map elements'
      });
    }
  }, [service]);

  useEffect(() => {
    fetchMapElements();
  }, [fetchMapElements]);

  return {
    ...state,
    refetch: fetchMapElements
  };
}