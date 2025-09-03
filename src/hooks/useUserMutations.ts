'use client';

import { useState } from 'react';
import { getUserService } from '@/src/services/userService';
import type { CreateUserData, UpdateUserData, User } from '@/src/types/user';

interface MutationState {
  loading: boolean;
  error: string | null;
}

export function useUserMutations() {
  const [createState, setCreateState] = useState<MutationState>({ loading: false, error: null });
  const [updateState, setUpdateState] = useState<MutationState>({ loading: false, error: null });
  const [deleteState, setDeleteState] = useState<MutationState>({ loading: false, error: null });

  const userService = getUserService();

  // Create user
  const createUser = async (userData: CreateUserData, userId?: string): Promise<User | null> => {
    setCreateState({ loading: true, error: null });
    
    try {
      const response = await userService.createUser(userData, userId);
      
      if (response.success && response.user) {
        setCreateState({ loading: false, error: null });
        return response.user;
      } else {
        setCreateState({ loading: false, error: response.error || 'Failed to create user' });
        return null;
      }
    } catch (error) {
      console.error('Create user error:', error);
      setCreateState({ loading: false, error: 'Failed to create user' });
      return null;
    }
  };

  // Update user
  const updateUser = async (userId: string, updates: UpdateUserData): Promise<User | null> => {
    setUpdateState({ loading: true, error: null });
    
    try {
      const response = await userService.updateUser(userId, updates);
      
      if (response.success && response.user) {
        setUpdateState({ loading: false, error: null });
        return response.user;
      } else {
        setUpdateState({ loading: false, error: response.error || 'Failed to update user' });
        return null;
      }
    } catch (error) {
      console.error('Update user error:', error);
      setUpdateState({ loading: false, error: 'Failed to update user' });
      return null;
    }
  };

  // Deactivate user
  const deactivateUser = async (userId: string): Promise<boolean> => {
    setDeleteState({ loading: true, error: null });
    
    try {
      const success = await userService.deactivateUser(userId);
      
      if (success) {
        setDeleteState({ loading: false, error: null });
        return true;
      } else {
        setDeleteState({ loading: false, error: 'Failed to deactivate user' });
        return false;
      }
    } catch (error) {
      console.error('Deactivate user error:', error);
      setDeleteState({ loading: false, error: 'Failed to deactivate user' });
      return false;
    }
  };

  // Activate user
  const activateUser = async (userId: string): Promise<boolean> => {
    setUpdateState({ loading: true, error: null });
    
    try {
      const success = await userService.activateUser(userId);
      
      if (success) {
        setUpdateState({ loading: false, error: null });
        return true;
      } else {
        setUpdateState({ loading: false, error: 'Failed to activate user' });
        return false;
      }
    } catch (error) {
      console.error('Activate user error:', error);
      setUpdateState({ loading: false, error: 'Failed to activate user' });
      return false;
    }
  };

  // Update last login
  const updateLastLogin = async (userId: string): Promise<void> => {
    try {
      await userService.updateLastLogin(userId);
    } catch (error) {
      console.error('Update last login error:', error);
    }
  };

  // Clear errors
  const clearCreateError = () => setCreateState(prev => ({ ...prev, error: null }));
  const clearUpdateError = () => setUpdateState(prev => ({ ...prev, error: null }));
  const clearDeleteError = () => setDeleteState(prev => ({ ...prev, error: null }));

  return {
    // Mutations
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    updateLastLogin,
    
    // States
    createLoading: createState.loading,
    createError: createState.error,
    updateLoading: updateState.loading,
    updateError: updateState.error,
    deleteLoading: deleteState.loading,
    deleteError: deleteState.error,
    
    // Error clearers
    clearCreateError,
    clearUpdateError,
    clearDeleteError,
  };
}

// Hook for user permissions and utilities
export function useUserPermissions() {
  const userService = getUserService();

  const canAccessProvince = (user: User, province: string): boolean => {
    return userService.canAccessProvince(user, province);
  };

  const canModifyInProvince = (user: User, province: string): boolean => {
    return userService.canModifyInProvince(user, province);
  };

  const getDisplayName = (user: User): string => {
    return userService.getDisplayName(user);
  };

  const getRoleDisplayText = (role: User['role']): string => {
    return userService.getRoleDisplayText(role);
  };

  const getProvinceDisplayName = (user: User): string => {
    return userService.getProvinceDisplayName(user);
  };

  return {
    canAccessProvince,
    canModifyInProvince,
    getDisplayName,
    getRoleDisplayText,
    getProvinceDisplayName,
  };
}