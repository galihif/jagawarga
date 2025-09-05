import { useState, useEffect, useCallback } from 'react';
import type { AsyncState } from '@/src/types/common';
import type { MapElement } from '@/src/types/map';
import { mapElementService, type MapElementServiceInterface } from '@/src/services/mapElementService';
import { useAuth } from '@/src/hooks/useAuth';

export type UseRealtimeMapElementsReturn = AsyncState<MapElement[]> & {
  userAccessibleProvinces: string[];
  showingAllProvinces: boolean;
  userRole?: 'owner' | 'volunteer';
};

interface UseRealtimeMapElementsOptions {
  filterByUserProvince?: boolean; // If true, filter by user's accessible provinces
  specificProvinces?: string[]; // Specific provinces to filter by
  service?: MapElementServiceInterface;
}

export function useRealtimeMapElements(
  options: UseRealtimeMapElementsOptions = {}
): UseRealtimeMapElementsReturn {
  const { 
    filterByUserProvince = true, 
    specificProvinces,
    service = mapElementService 
  } = options;

  const [state, setState] = useState<AsyncState<MapElement[]>>({
    data: null,
    loading: true,
    error: null
  });

  const { user, loading: authLoading } = useAuth();

  // Determine which provinces to show based on user role and options
  const getAccessibleProvinces = useCallback((): string[] => {
    if (specificProvinces) {
      return specificProvinces;
    }

    if (!filterByUserProvince || !user) {
      return []; // Show all elements if not filtering or no user
    }

    if (user.role === 'owner') {
      // Owners can see all provinces - return empty array to show all
      return [];
    }

    if (user.role === 'volunteer' && user.assignedProvince) {
      // Volunteers can only see their assigned province
      return [user.assignedProvince];
    }

    return [];
  }, [user, filterByUserProvince, specificProvinces]);

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
    if (authLoading) return;

    setState(prev => ({ ...prev, loading: true }));

    const accessibleProvinces = getAccessibleProvinces();
    let unsubscribe: (() => void) | null = null;

    try {
      if (accessibleProvinces.length === 0 && filterByUserProvince && user?.role === 'owner') {
        // Owner sees all elements
        unsubscribe = service.subscribeToMapElements(handleMapElementsUpdate);
      } else if (accessibleProvinces.length > 0) {
        // Filtered by provinces
        unsubscribe = service.subscribeToMapElementsByProvinces(
          accessibleProvinces, 
          handleMapElementsUpdate
        );
      } else {
        // No access or no user - show empty
        setState({
          data: [],
          loading: false,
          error: null
        });
      }
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
  }, [service, user, authLoading, getAccessibleProvinces, filterByUserProvince, handleMapElementsUpdate, handleError]);

  // Get current user's accessible provinces for display
  const userAccessibleProvinces = getAccessibleProvinces();
  const showingAllProvinces = user?.role === 'owner' && filterByUserProvince && !specificProvinces;

  return {
    ...state,
    userAccessibleProvinces,
    showingAllProvinces,
    userRole: user?.role,
    loading: state.loading || authLoading
  };
}

// Specialized hook for volunteers (only their province)
export function useVolunteerMapElements() {
  return useRealtimeMapElements({ filterByUserProvince: true });
}

// Specialized hook for owners (all provinces)
export function useOwnerMapElements() {
  return useRealtimeMapElements({ filterByUserProvince: true });
}

// Hook for specific provinces
export function useProvinceMapElements(provinces: string[]) {
  return useRealtimeMapElements({ 
    filterByUserProvince: false, 
    specificProvinces: provinces 
  });
}