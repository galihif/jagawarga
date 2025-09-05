'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { LoginForm } from '@/src/components/auth/LoginForm';
import { RegisterForm } from '@/src/components/auth/RegisterForm';

export function QuickAuth() {
  const { user, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm">
          <div className="font-medium text-green-600 mb-1">✓ Authenticated</div>
          <div className="text-gray-700">Role: {user.role}</div>
          {user.assignedProvince && (
            <div className="text-gray-700">Province: {user.assignedProvince}</div>
          )}
          <div className="text-gray-500 text-xs mt-1">{user.email}</div>
          <button
            onClick={() => signOut()}
            className="mt-2 text-xs text-red-600 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Auth Status Button */}
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm">
          <div className="font-medium text-red-600 mb-1">⚠ Not Authenticated</div>
          <div className="text-gray-600 text-xs mb-2">
            Login required to create map elements
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Sign In / Register
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Authentication Required</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              You need to be authenticated to create map elements. 
              {' '}
              <strong>Note:</strong> For production, you should use invitation links from administrators.
            </div>

            {/* Auth Toggle */}
            <div className="flex justify-center mb-4">
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
            <div className="max-h-96 overflow-y-auto">
              {authMode === 'login' ? (
                <LoginForm
                  onSuccess={() => setShowAuth(false)}
                  onSwitchToSignUp={() => setAuthMode('register')}
                  className="shadow-none border-0"
                />
              ) : (
                <RegisterForm
                  onSuccess={() => setShowAuth(false)}
                  onSwitchToLogin={() => setAuthMode('login')}
                  className="shadow-none border-0"
                />
              )}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>Development Note:</strong> In production, users should register through invitation links 
              that automatically assign them to the correct province and role.
            </div>
          </div>
        </div>
      )}
    </>
  );
}