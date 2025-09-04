'use client';

import React, { useState } from 'react';
import { getUserService } from '@/src/services/userService';
import type { UserRole, CreateUserData } from '@/src/types/user';
import { ProvinceSelector } from '@/src/components/ui/ProvinceSelector';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

interface CreateUserModalProps {
  onClose: () => void;
  onUserCreated?: () => void;
}

export function CreateUserModal({ onClose, onUserCreated }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    displayName: '',
    role: 'volunteer',
    assignedProvince: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userService = getUserService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Prepare data for submission
      const userData: CreateUserData = {
        email: formData.email.trim(),
        displayName: formData.displayName.trim() || undefined,
        role: formData.role,
        assignedProvince: formData.role === 'volunteer' && formData.assignedProvince 
          ? formData.assignedProvince 
          : undefined,
      };

      const result = await userService.createUser(userData);

      if (result.success) {
        onUserCreated?.();
        onClose();
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
      assignedProvince: role === 'owner' ? '' : formData.assignedProvince,
    });
  };

  const isFormValid = () => {
    return (
      formData.email.trim() &&
      formData.role &&
      (formData.role === 'owner' || formData.assignedProvince)
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Create New User
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                If not provided, will use part of the email address
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange('owner')}
                  disabled={isLoading}
                  className={`
                    p-4 border rounded-lg text-center transition-all disabled:opacity-50
                    ${formData.role === 'owner'
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="text-purple-600 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900">Owner</div>
                  <div className="text-sm text-gray-500">Full access to all provinces</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('volunteer')}
                  disabled={isLoading}
                  className={`
                    p-4 border rounded-lg text-center transition-all disabled:opacity-50
                    ${formData.role === 'volunteer'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="text-blue-600 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900">Volunteer</div>
                  <div className="text-sm text-gray-500">Access to assigned province</div>
                </button>
              </div>
            </div>

            {/* Province Selection (only for volunteers) */}
            {formData.role === 'volunteer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Province <span className="text-red-500">*</span>
                </label>
                <ProvinceSelector
                  selectedProvinceCode={formData.assignedProvince}
                  onSelectionChange={(selection) => 
                    setFormData({ ...formData, assignedProvince: selection as string })
                  }
                  placeholder="Select a province"
                  disabled={isLoading}
                  showRegionGroups
                />
                <p className="mt-1 text-sm text-gray-500">
                  This volunteer will only be able to manage elements in the selected province
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {isLoading && <LoadingSpinner size="sm" className="p-0" />}
                <span>Create User</span>
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  How user creation works
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>User will be created in the database with the provided information</li>
                    <li>The user will need to register using Firebase Authentication with the same email</li>
                    <li>Once authenticated, they will automatically get the assigned role and permissions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}