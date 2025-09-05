'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { QuickAuth } from '@/src/components/auth/QuickAuth';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the map component to prevent SSR issues with Leaflet
const NewEditorMap = dynamic(() => import('@/src/components/NewEditorMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading Map Editor...</p>
      </div>
    </div>
  )
});

export default function MapEditorPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading Map Editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the map editor.</p>
          </div>
        </div>
        <QuickAuth />
      </div>
    );
  }

  // Check if user has permission to edit maps
  if (user.role !== 'owner' && user.role !== 'volunteer') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You need to be assigned as a volunteer or owner to access the map editor.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mb-4">
              <strong>Your current role:</strong> {user.role}<br/>
              <strong>Province:</strong> {user.assignedProvince || 'None'}
            </div>
            <Link 
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href={user.role === 'owner' ? '/admin' : '/'}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {user.role === 'owner' ? 'Dashboard' : 'Home'}
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Map Editor</h1>
                <p className="text-sm text-gray-600">
                  {user.role === 'owner' 
                    ? 'All Provinces' 
                    : user.assignedProvince || 'No Province Assigned'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user.role === 'owner' && (
                <Link 
                  href="/admin"
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  Admin Panel
                </Link>
              )}
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900">{user.displayName || user.email}</div>
                <div className="text-green-600 capitalize">{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Editor - Full Height */}
      <div className="flex-1 overflow-hidden">
        <NewEditorMap />
      </div>
    </div>
  );
}