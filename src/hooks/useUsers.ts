'use client';

import { useState, useEffect } from 'react';
import { getUserService } from '@/src/services/userService';
import type { User, UserRole } from '@/src/types/user';

interface UseUsersOptions {
  role?: UserRole;
  province?: string;
  isActive?: boolean;
  realTime?: boolean;
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService = getUserService();
  const { role, province, isActive, realTime = false } = options;

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        ...(role && { role }),
        ...(province && { province }),
        ...(isActive !== undefined && { isActive }),
      };
      
      const data = await userService.getUsers(filters);
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (realTime) {
      // Set up real-time subscription
      const filters = {
        ...(role && { role }),
        ...(province && { province }),
        ...(isActive !== undefined && { isActive }),
      };

      setLoading(true);
      const unsubscribe = userService.subscribeToUsers((data) => {
        setUsers(data);
        setError(null);
        setLoading(false);
      }, filters);

      return unsubscribe;
    } else {
      // Load users once
      loadUsers();
    }
  }, [role, province, isActive, realTime]);

  return {
    users,
    loading,
    error,
    refresh: loadUsers,
  };
}

// Hook for getting a specific user by ID
export function useUser(userId: string | null, realTime = false): {
  user: User | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userService = getUserService();

  const loadUser = async () => {
    if (!userId) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUserById(userId);
      setUser(data);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (realTime) {
      // Set up real-time subscription
      setLoading(true);
      const unsubscribe = userService.subscribeToUser(userId, (data) => {
        setUser(data);
        setError(null);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Load user once
      loadUser();
    }
  }, [userId, realTime]);

  return {
    user,
    loading,
    error,
    refresh: loadUser,
  };
}

// Hook for user statistics
export function useUserStats(): {
  stats: {
    total: number;
    owners: number;
    volunteers: number;
    active: number;
    inactive: number;
    byProvince: Record<string, number>;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState({
    total: 0,
    owners: 0,
    volunteers: 0,
    active: 0,
    inactive: 0,
    byProvince: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService = getUserService();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userService.getUserStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading user stats:', err);
      setError('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

// Hook for volunteers by province
export function useVolunteersByProvince(province: string): UseUsersResult {
  return useUsers({
    role: 'volunteer',
    province,
    isActive: true,
    realTime: true,
  });
}