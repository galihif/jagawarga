'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';
import { UserManagement } from '@/src/components/admin/UserManagement';
import { InvitationManager } from '@/src/components/admin/InvitationManager';
import { QuickAuth } from '@/src/components/auth/QuickAuth';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading JagaWarga Admin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard.</p>
          </div>
        </div>
        <QuickAuth />
      </div>
    );
  }

  if (user.role !== 'owner') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Owner Access Required</h1>
            <p className="text-gray-600 mb-4">
              This admin dashboard requires Owner role access.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Your current role:</strong> {user.role}<br/>
              <strong>Province:</strong> {user.assignedProvince || 'None'}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Contact your system administrator to upgrade your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JagaWarga Admin</h1>
              <p className="text-sm text-gray-600">Multi-Province Crisis Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/mapeditor"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Map Editor
              </Link>
              <Link 
                href="/"
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Home
              </Link>
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900">{user.displayName || user.email}</div>
                <div className="text-green-600">Owner Access</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invitations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invitations
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'invitations' && <InvitationManager />}
      </div>
    </div>
  );
}