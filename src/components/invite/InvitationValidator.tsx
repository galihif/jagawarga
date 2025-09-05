'use client';

import React, { useState, useEffect } from 'react';
import { getInvitationService } from '@/src/services/invitationService';
import { getProvinceByCode } from '@/src/config/provinces';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';
import { LoginForm } from '@/src/components/auth/LoginForm';
import { RegisterForm } from '@/src/components/auth/RegisterForm';
import type { Invitation } from '@/src/types/invitation';

interface InvitationValidatorProps {
  token: string;
}

type ViewState = 'loading' | 'invalid' | 'expired' | 'used' | 'valid' | 'auth-required' | 'success';

export function InvitationValidator({ token }: InvitationValidatorProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const invitationService = getInvitationService();

  // Validate invitation token
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setViewState('invalid');
        setError('No invitation token provided');
        return;
      }

      try {
        const invitationData = await invitationService.getInvitationByToken(token);
        
        if (!invitationData) {
          setViewState('invalid');
          setError('Invitation not found');
          return;
        }

        // Check if invitation is expired
        const now = new Date();
        const expiresAt = invitationData.expiresAt instanceof Date 
          ? invitationData.expiresAt 
          : invitationData.expiresAt.toDate();

        if (now > expiresAt) {
          setViewState('expired');
          setError('This invitation has expired');
          return;
        }

        // Check if invitation is already used
        if (invitationData.isUsed) {
          setViewState('used');
          setError('This invitation has already been used');
          return;
        }

        // Check if invitation is revoked
        if (invitationData.isRevoked) {
          setViewState('invalid');
          setError('This invitation has been revoked');
          return;
        }

        setInvitation(invitationData);
        setViewState('valid');
      } catch (error) {
        console.error('Error validating invitation:', error);
        setViewState('invalid');
        setError('Failed to validate invitation');
      }
    };

    validateInvitation();
  }, [token, invitationService]);

  // Check authentication state when user changes
  useEffect(() => {
    if (viewState !== 'valid' || authLoading) return;

    if (!user || !firebaseUser) {
      setViewState('auth-required');
    } else {
      // User is authenticated, process the invitation
      processInvitation();
    }
  }, [user, firebaseUser, viewState, authLoading]);

  const processInvitation = async () => {
    if (!invitation || !firebaseUser) return;

    setIsProcessing(true);
    
    try {
      const result = await invitationService.validateAndUseInvitation(
        token, 
        firebaseUser.uid,
        firebaseUser.email || undefined,
        firebaseUser.displayName || undefined
      );
      
      if (result.isValid) {
        setViewState('success');
      } else {
        setError(result.error || 'Failed to process invitation');
        setViewState('invalid');
      }
    } catch (error) {
      console.error('Error processing invitation:', error);
      setError('Failed to process invitation');
      setViewState('invalid');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthSuccess = () => {
    // After successful authentication, the useEffect will trigger processInvitation
    setViewState('valid');
  };

  const province = invitation ? getProvinceByCode(invitation.province) : null;

  // Loading state
  if (viewState === 'loading' || authLoading) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Processing invitation
  if (isProcessing) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Processing your invitation...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (viewState === 'success') {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to JagaWarga!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully joined the crisis management team for{' '}
            <strong>{invitation?.provinceName}</strong>.
          </p>
          <div className="space-y-3">
            <a
              href="/admin"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Access Dashboard
            </a>
            <p className="text-xs text-gray-500">
              You can now manage crisis information for your assigned province.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authentication required
  if (viewState === 'auth-required') {
    return (
      <div className="space-y-6">
        {/* Invitation Info */}
        {invitation && province && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Invitation for {province.name}
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                You've been invited to join the crisis management team for {province.name} province.
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Token: {token.substring(0, 8)}...
              </div>
            </div>
          </div>
        )}

        {/* Auth Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Auth Forms */}
        {authMode === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm
            invitationEmail={undefined} // We don't pre-fill email for invitations
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  // Error states
  const errorConfig = {
    invalid: {
      icon: (
        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      title: 'Invalid Invitation',
      description: 'This invitation link is not valid or has been revoked.'
    },
    expired: {
      icon: (
        <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Invitation Expired',
      description: 'This invitation has expired. Please request a new invitation from your administrator.'
    },
    used: {
      icon: (
        <svg className="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: 'Invitation Already Used',
      description: 'This invitation has already been used by another user.'
    }
  };

  const config = errorConfig[viewState as keyof typeof errorConfig];

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          {config.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {config.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {config.description}
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <div className="space-y-3">
          <a
            href="/"
            className="block w-full px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
          >
            Go to Homepage
          </a>
          <p className="text-xs text-gray-500">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}