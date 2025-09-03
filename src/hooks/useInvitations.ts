'use client';

import { useState, useEffect } from 'react';
import { getInvitationService } from '@/src/services/invitationService';
import type { Invitation } from '@/src/types/invitation';

interface UseInvitationsOptions {
  province?: string;
  createdBy?: string;
  isUsed?: boolean;
  isRevoked?: boolean;
  realTime?: boolean;
}

interface UseInvitationsResult {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInvitations(options: UseInvitationsOptions = {}): UseInvitationsResult {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invitationService = getInvitationService();
  const { province, createdBy, isUsed, isRevoked, realTime = false } = options;

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        ...(province && { province }),
        ...(createdBy && { createdBy }),
        ...(isUsed !== undefined && { isUsed }),
        ...(isRevoked !== undefined && { isRevoked }),
      };
      
      const data = await invitationService.getInvitations(filters);
      setInvitations(data);
    } catch (err) {
      console.error('Error loading invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (realTime) {
      // Set up real-time subscription
      const filters = {
        ...(province && { province }),
        ...(createdBy && { createdBy }),
        ...(isUsed !== undefined && { isUsed }),
        ...(isRevoked !== undefined && { isRevoked }),
      };

      setLoading(true);
      const unsubscribe = invitationService.subscribeToInvitations((data) => {
        setInvitations(data);
        setError(null);
        setLoading(false);
      }, filters);

      return unsubscribe;
    } else {
      // Load invitations once
      loadInvitations();
    }
  }, [province, createdBy, isUsed, isRevoked, realTime]);

  return {
    invitations,
    loading,
    error,
    refresh: loadInvitations,
  };
}

// Hook for getting a specific invitation by token
export function useInvitation(token: string | null): {
  invitation: Invitation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitationService = getInvitationService();

  const loadInvitation = async () => {
    if (!token) {
      setInvitation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await invitationService.getInvitationByToken(token);
      setInvitation(data);
    } catch (err) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitation();
  }, [token]);

  return {
    invitation,
    loading,
    error,
    refresh: loadInvitation,
  };
}

// Hook for invitation statistics
export function useInvitationStats(province?: string): {
  stats: {
    total: number;
    active: number;
    used: number;
    expired: number;
    revoked: number;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
    revoked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invitationService = getInvitationService();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await invitationService.getInvitationStats(province);
      setStats(data);
    } catch (err) {
      console.error('Error loading invitation stats:', err);
      setError('Failed to load invitation statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [province]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

// Hook for active invitations by province
export function useActiveInvitations(province: string): UseInvitationsResult {
  return useInvitations({
    province,
    isUsed: false,
    isRevoked: false,
    realTime: true,
  });
}

// Hook for invitations created by user
export function useMyInvitations(userId: string): UseInvitationsResult {
  return useInvitations({
    createdBy: userId,
    realTime: true,
  });
}