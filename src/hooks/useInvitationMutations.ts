'use client';

import { useState } from 'react';
import { getInvitationService } from '@/src/services/invitationService';
import type { CreateInvitationData, Invitation } from '@/src/types/invitation';
import type { CreateInvitationResponse, InvitationValidationResponse } from '@/src/services/invitationService';

interface MutationState {
  loading: boolean;
  error: string | null;
}

export function useInvitationMutations() {
  const [createState, setCreateState] = useState<MutationState>({ loading: false, error: null });
  const [validateState, setValidateState] = useState<MutationState>({ loading: false, error: null });
  const [revokeState, setRevokeState] = useState<MutationState>({ loading: false, error: null });

  const invitationService = getInvitationService();

  // Create invitation
  const createInvitation = async (data: CreateInvitationData): Promise<CreateInvitationResponse | null> => {
    setCreateState({ loading: true, error: null });
    
    try {
      const response = await invitationService.createInvitation(data);
      
      if (response.success) {
        setCreateState({ loading: false, error: null });
        return response;
      } else {
        setCreateState({ loading: false, error: response.error || 'Failed to create invitation' });
        return response;
      }
    } catch (error) {
      console.error('Create invitation error:', error);
      setCreateState({ loading: false, error: 'Failed to create invitation' });
      return null;
    }
  };

  // Validate and use invitation
  const validateAndUseInvitation = async (token: string, userId: string): Promise<InvitationValidationResponse | null> => {
    setValidateState({ loading: true, error: null });
    
    try {
      const response = await invitationService.validateAndUseInvitation(token, userId);
      
      if (response.isValid) {
        setValidateState({ loading: false, error: null });
      } else {
        setValidateState({ loading: false, error: response.error || 'Invalid invitation' });
      }
      
      return response;
    } catch (error) {
      console.error('Validate invitation error:', error);
      setValidateState({ loading: false, error: 'Failed to validate invitation' });
      return null;
    }
  };

  // Revoke invitation
  const revokeInvitation = async (token: string, revokedBy: string): Promise<boolean> => {
    setRevokeState({ loading: true, error: null });
    
    try {
      const success = await invitationService.revokeInvitation(token, revokedBy);
      
      if (success) {
        setRevokeState({ loading: false, error: null });
        return true;
      } else {
        setRevokeState({ loading: false, error: 'Failed to revoke invitation' });
        return false;
      }
    } catch (error) {
      console.error('Revoke invitation error:', error);
      setRevokeState({ loading: false, error: 'Failed to revoke invitation' });
      return false;
    }
  };

  // Generate WhatsApp URL
  const generateWhatsAppUrl = (token: string, provinceName: string): string => {
    return invitationService.generateWhatsAppUrl(token, provinceName);
  };

  // Generate invitation link
  const generateInvitationLink = (token: string): string => {
    return invitationService.generateInvitationLink(token);
  };

  // Check if user can create invitations
  const canCreateInvitation = async (userId: string, province: string): Promise<boolean> => {
    try {
      return await invitationService.canCreateInvitation(userId, province);
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  };

  // Clear errors
  const clearCreateError = () => setCreateState(prev => ({ ...prev, error: null }));
  const clearValidateError = () => setValidateState(prev => ({ ...prev, error: null }));
  const clearRevokeError = () => setRevokeState(prev => ({ ...prev, error: null }));

  return {
    // Mutations
    createInvitation,
    validateAndUseInvitation,
    revokeInvitation,
    
    // Utilities
    generateWhatsAppUrl,
    generateInvitationLink,
    canCreateInvitation,
    
    // States
    createLoading: createState.loading,
    createError: createState.error,
    validateLoading: validateState.loading,
    validateError: validateState.error,
    revokeLoading: revokeState.loading,
    revokeError: revokeState.error,
    
    // Error clearers
    clearCreateError,
    clearValidateError,
    clearRevokeError,
  };
}

// Hook for invitation permissions and utilities
export function useInvitationPermissions() {
  const invitationService = getInvitationService();

  const canCreateInvitation = async (userId: string, province: string): Promise<boolean> => {
    return invitationService.canCreateInvitation(userId, province);
  };

  const generateWhatsAppUrl = (token: string, provinceName: string): string => {
    return invitationService.generateWhatsAppUrl(token, provinceName);
  };

  const generateInvitationLink = (token: string): string => {
    return invitationService.generateInvitationLink(token);
  };

  const parseToken = (token: string): { province: string; randomPart: string } | null => {
    const parts = token.split('-');
    if (parts.length !== 2) return null;
    
    return {
      province: parts[0],
      randomPart: parts[1]
    };
  };

  return {
    canCreateInvitation,
    generateWhatsAppUrl,
    generateInvitationLink,
    parseToken,
  };
}