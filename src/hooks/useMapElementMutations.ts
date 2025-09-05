import { useState, useCallback, useRef } from 'react';
import type { 
  CreateMapElementRequest, 
  UpdateMapElementRequest, 
  MapElement 
} from '@/src/types/map';
import { mapElementService, type MapElementServiceInterface } from '@/src/services/mapElementService';
import { mapElementServiceWithAuth, type AuthenticatedCreateMapElementRequest } from '@/src/services/mapElementServiceWithAuth';
import { useAuth } from '@/src/hooks/useAuth';
import { DEBOUNCE_DELAYS } from '@/src/config/map';

export interface UseMapElementMutationsReturn {
  // Create (now uses authentication)
  createMapElement: (request: AuthenticatedCreateMapElementRequest) => Promise<MapElement | null>;
  createLoading: boolean;
  createError: string | null;

  // Update  
  updateMapElement: (request: UpdateMapElementRequest) => Promise<MapElement | null>;
  updateLoading: boolean;
  updateError: string | null;

  // Delete single
  deleteMapElement: (id: string) => Promise<boolean>;
  deleteLoading: boolean;
  deleteError: string | null;

  // Batch delete with debouncing
  debouncedBatchDelete: (ids: string[]) => void;
  batchDeleteLoading: boolean;
  batchDeleteError: string | null;
  
  // Clear all errors
  clearErrors: () => void;
}

export function useMapElementMutations(
  service: MapElementServiceInterface = mapElementService
): UseMapElementMutationsReturn {
  const { user } = useAuth();
  // Create state
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Update state
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Batch delete state
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [batchDeleteError, setBatchDeleteError] = useState<string | null>(null);

  // Debounced batch delete refs
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDeletesRef = useRef<string[]>([]);

  const createMapElement = useCallback(async (
    request: AuthenticatedCreateMapElementRequest
  ): Promise<MapElement | null> => {
    setCreateLoading(true);
    setCreateError(null);

    try {
      const response = await mapElementServiceWithAuth.createMapElement(request, user);
      
      if (response.error) {
        setCreateError(response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create map element';
      setCreateError(errorMessage);
      return null;
    } finally {
      setCreateLoading(false);
    }
  }, [user]);

  const updateMapElement = useCallback(async (
    request: UpdateMapElementRequest
  ): Promise<MapElement | null> => {
    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const response = await service.updateMapElement(request);
      
      if (response.error) {
        setUpdateError(response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update map element';
      setUpdateError(errorMessage);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  }, [service]);

  const deleteMapElement = useCallback(async (id: string): Promise<boolean> => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await service.deleteMapElement(id);
      
      if (response.error) {
        setDeleteError(response.error);
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete map element';
      setDeleteError(errorMessage);
      return false;
    } finally {
      setDeleteLoading(false);
    }
  }, [service]);

  const debouncedBatchDelete = useCallback((ids: string[]) => {
    // Clear any existing timer
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    // Add new IDs to pending deletes (avoid duplicates)
    ids.forEach(id => {
      if (!pendingDeletesRef.current.includes(id)) {
        pendingDeletesRef.current.push(id);
      }
    });

    // Set new timer
    deleteTimerRef.current = setTimeout(async () => {
      if (pendingDeletesRef.current.length === 0) return;

      setBatchDeleteLoading(true);
      setBatchDeleteError(null);

      try {
        const response = await service.batchDeleteMapElements({ 
          ids: pendingDeletesRef.current 
        });
        
        if (response.error) {
          setBatchDeleteError(response.error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to batch delete map elements';
        setBatchDeleteError(errorMessage);
      } finally {
        setBatchDeleteLoading(false);
        pendingDeletesRef.current = [];
      }
    }, DEBOUNCE_DELAYS.DELETE);
  }, [service]);

  const clearErrors = useCallback(() => {
    setCreateError(null);
    setUpdateError(null);
    setDeleteError(null);
    setBatchDeleteError(null);
  }, []);

  return {
    createMapElement,
    createLoading,
    createError,
    
    updateMapElement,
    updateLoading,
    updateError,
    
    deleteMapElement,
    deleteLoading,
    deleteError,
    
    debouncedBatchDelete,
    batchDeleteLoading,
    batchDeleteError,
    
    clearErrors
  };
}