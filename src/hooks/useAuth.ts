'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getAuthInstance } from '@/src/lib/firebase';
import { getAuthService, type AuthResult, type SignUpData } from '@/src/services/authService';
import type { User } from '@/src/types/user';

interface AuthContextType {
  // User state
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  
  // Authentication methods
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (data: SignUpData) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // User profile methods
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<{ success: boolean; error?: string }>;
  sendEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  
  // Utility methods
  isEmailVerified: boolean;
  canAccessProvince: (province: string) => boolean;
  canModifyInProvince: (province: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuthInstance();
  const authService = getAuthService();

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // User is signed in, get user data from database
          const userData = await authService.getCurrentUser();
          setUser(userData);
          
          // Update last login if user data exists
          if (userData) {
            await authService.updateUserProfile({});
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        setFirebaseUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, authService]);

  // Authentication methods
  const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    const result = await authService.signInWithEmail(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setFirebaseUser(result.firebaseUser!);
    }
    return result;
  };

  const signUpWithEmail = async (data: SignUpData): Promise<AuthResult> => {
    const result = await authService.signUpWithEmail(data);
    if (result.success && result.user) {
      setUser(result.user);
      setFirebaseUser(result.firebaseUser!);
    }
    return result;
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    const result = await authService.signInWithGoogle();
    if (result.success && result.user) {
      setUser(result.user);
      setFirebaseUser(result.firebaseUser!);
    }
    return result;
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const sendPasswordResetEmail = async (email: string) => {
    return await authService.sendPasswordResetEmail(email);
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    const result = await authService.updateUserProfile(updates);
    if (result.success && user) {
      // Update local user state
      setUser({
        ...user,
        displayName: updates.displayName || user.displayName,
        photoURL: updates.photoURL || user.photoURL,
      });
    }
    return result;
  };

  const sendEmailVerification = async () => {
    if (!firebaseUser) {
      return { success: false, error: 'User not authenticated' };
    }
    return await authService.sendEmailVerification(firebaseUser);
  };

  // Utility methods
  const isEmailVerified = firebaseUser?.emailVerified ?? false;

  const canAccessProvince = (province: string): boolean => {
    if (!user) return false;
    
    // Owners can access all provinces
    if (user.role === 'owner') return true;
    
    // Volunteers can only access their assigned province
    return user.role === 'volunteer' && user.assignedProvince === province;
  };

  const canModifyInProvince = (province: string): boolean => {
    if (!user || !user.isActive) return false;
    return canAccessProvince(province);
  };

  const value: AuthContextType = {
    // State
    user,
    firebaseUser,
    loading,
    
    // Methods
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification,
    
    // Utilities
    isEmailVerified,
    canAccessProvince,
    canModifyInProvince,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for authentication guards
export function useAuthGuard(requiredRole?: 'owner' | 'volunteer', requiredProvince?: string) {
  const { user, loading } = useAuth();

  const isAuthenticated = !!user;
  const isActive = user?.isActive ?? false;
  
  const hasRequiredRole = !requiredRole || user?.role === requiredRole;
  const hasProvinceAccess = !requiredProvince || 
    (user?.role === 'owner') || 
    (user?.role === 'volunteer' && user?.assignedProvince === requiredProvince);

  const isAuthorized = isAuthenticated && isActive && hasRequiredRole && hasProvinceAccess;

  return {
    user,
    loading,
    isAuthenticated,
    isActive,
    isAuthorized,
    hasRequiredRole,
    hasProvinceAccess,
  };
}

// Hook for protecting admin routes
export function useAdminAuth() {
  return useAuthGuard('owner');
}

// Hook for protecting province-specific routes
export function useProvinceAuth(province: string) {
  const { user, loading } = useAuth();
  const canAccess = user?.role === 'owner' || 
    (user?.role === 'volunteer' && user?.assignedProvince === province);

  return {
    user,
    loading,
    canAccess,
    isOwner: user?.role === 'owner',
    isVolunteer: user?.role === 'volunteer',
    assignedProvince: user?.assignedProvince,
  };
}