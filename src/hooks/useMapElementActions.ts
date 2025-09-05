'use client';

import { useState, useCallback } from 'react';
import { mapElementServiceWithAuth, type AuthenticatedCreateMapElementRequest } from '@/src/services/mapElementServiceWithAuth';
import { useAuth } from '@/src/hooks/useAuth';
import type { MapElement, UpdateMapElementRequest } from '@/src/types/map';
import type { ApiResponse } from '@/src/types/common';

interface UseMapElementActionsReturn {
  // Create actions
  createMapElement: (request: AuthenticatedCreateMapElementRequest) => Promise<ApiResponse<MapElement>>;
  createMapElementWithAutoProvince: (request: AuthenticatedCreateMapElementRequest) => Promise<ApiResponse<MapElement>>;
  
  // Update/Delete actions (delegated)
  updateMapElement: (request: UpdateMapElementRequest) => Promise<ApiResponse<MapElement>>;
  deleteMapElement: (id: string) => Promise<ApiResponse<void>>;
  batchDeleteMapElements: (ids: string[]) => Promise<ApiResponse<void>>;
  
  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // User capabilities
  canCreateElements: boolean;
  userCreationProvinces: string[];
  isVolunteer: boolean;
  isOwner: boolean;
}

export function useMapElementActions(): UseMapElementActionsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { user } = useAuth();

  // Create with authentication and auto-province detection
  const createMapElement = useCallback(async (request: AuthenticatedCreateMapElementRequest): Promise<ApiResponse<MapElement>> => {
    setIsCreating(true);
    try {
      const result = await mapElementServiceWithAuth.createMapElement(request, user);
      return result;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  // Create with auto-province (convenience method)
  const createMapElementWithAutoProvince = useCallback(async (request: AuthenticatedCreateMapElementRequest): Promise<ApiResponse<MapElement>> => {
    setIsCreating(true);
    try {
      const result = await mapElementServiceWithAuth.createMapElementWithAutoProvince(request, user);
      return result;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  // Update map element
  const updateMapElement = useCallback(async (request: UpdateMapElementRequest): Promise<ApiResponse<MapElement>> => {
    setIsUpdating(true);
    try {
      const result = await mapElementServiceWithAuth.updateMapElement(request);
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Delete single map element
  const deleteMapElement = useCallback(async (id: string): Promise<ApiResponse<void>> => {
    setIsDeleting(true);
    try {
      const result = await mapElementServiceWithAuth.deleteMapElement(id);
      return result;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Batch delete map elements
  const batchDeleteMapElements = useCallback(async (ids: string[]): Promise<ApiResponse<void>> => {
    setIsDeleting(true);
    try {
      const result = await mapElementServiceWithAuth.batchDeleteMapElements({ ids });
      return result;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // User capabilities
  const canCreateElements = mapElementServiceWithAuth.canUserCreateElements(user);
  const userCreationProvinces = mapElementServiceWithAuth.getUserCreationProvinces(user);
  const isVolunteer = user?.role === 'volunteer';
  const isOwner = user?.role === 'owner';

  return {
    // Actions
    createMapElement,
    createMapElementWithAutoProvince,
    updateMapElement,
    deleteMapElement,
    batchDeleteMapElements,
    
    // State
    isCreating,
    isUpdating,
    isDeleting,
    
    // Capabilities
    canCreateElements,
    userCreationProvinces,
    isVolunteer,
    isOwner,
  };
}

// Specialized hooks for different user types
export function useVolunteerMapActions() {
  const actions = useMapElementActions();
  
  // Volunteers always use auto-province
  const createMapElement = useCallback(
    (request: Omit<AuthenticatedCreateMapElementRequest, 'province'>) => 
      actions.createMapElementWithAutoProvince(request),
    [actions.createMapElementWithAutoProvince]
  );

  return {
    ...actions,
    createMapElement,
  };
}

export function useOwnerMapActions() {
  const actions = useMapElementActions();
  
  // Owners must specify province explicitly
  return actions;
}