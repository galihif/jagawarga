import { useState, useEffect, useCallback } from 'react';
import type { AsyncState } from '@/src/types/common';
import type { MapElement } from '@/src/types/map';
import { mapElementService, type MapElementServiceInterface } from '@/src/services/mapElementService';

export type UseRealtimeMapElementsReturn = AsyncState<MapElement[]>;

export function useRealtimeMapElements(
  service: MapElementServiceInterface = mapElementService
): UseRealtimeMapElementsReturn {
  const [state, setState] = useState<AsyncState<MapElement[]>>({
    data: null,
    loading: true,
    error: null
  });

  const handleMapElementsUpdate = useCallback((elements: MapElement[]) => {
    setState({
      data: elements,
      loading: false,
      error: null
    });
  }, []);

  const handleError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error
    }));
  }, []);

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = service.subscribeToMapElements(handleMapElementsUpdate);
    } catch (error) {
      handleError(
        error instanceof Error 
          ? error.message 
          : 'Failed to subscribe to map elements'
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [service, handleMapElementsUpdate, handleError]);

  return state;
}