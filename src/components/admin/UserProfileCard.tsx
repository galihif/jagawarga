'use client';

import React, { useState } from 'react';
import type { User, UserRole } from '@/src/types/user';
import { getUserService } from '@/src/services/userService';
import { getProvinceByCode } from '@/src/config/provinces';
import { ProvinceSelector } from '@/src/components/ui/ProvinceSelector';
import { ProvinceBadge } from '@/src/components/ui/ProvinceSelector';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

interface UserProfileCardProps {
  user: User;
  onClick?: () => void;
  onUserUpdated?: () => void;
  className?: string;
  detailed?: boolean;
  showActions?: boolean;
}

export function UserProfileCard({
  user,
  onClick,
  onUserUpdated,
  className = '',
  detailed = false,
  showActions = true,
}: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user.displayName || '',
    role: user.role,
    assignedProvince: user.assignedProvince || '',
    isActive: user.isActive,
  });

  const userService = getUserService();
  const province = user.assignedProvince ? getProvinceByCode(user.assignedProvince) : null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditData({
      displayName: user.displayName || '',
      role: user.role,
      assignedProvince: user.assignedProvince || '',
      isActive: user.isActive,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      displayName: user.displayName || '',
      role: user.role,
      assignedProvince: user.assignedProvince || '',
      isActive: user.isActive,
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const updates = {
        displayName: editData.displayName.trim() || undefined,
        role: editData.role,
        assignedProvince: editData.role === 'volunteer' && editData.assignedProvince 
          ? editData.assignedProvince 
          : undefined,
        isActive: editData.isActive,
      };

      const result = await userService.updateUser(user.id, updates);
      
      if (result.success) {
        setIsEditing(false);
        onUserUpdated?.();
      } else {
        alert(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      const success = user.isActive 
        ? await userService.deactivateUser(user.id)
        : await userService.activateUser(user.id);
      
      if (success) {
        onUserUpdated?.();
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user active status:', error);
      alert('An error occurred while updating user status');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isEditing) {
    return (
      <div className={`bg-white border border-blue-200 rounded-lg ${className}`}>
        <div className="p-6 space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={editData.displayName}
              onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter display name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={editData.role}
              onChange={(e) => setEditData({ 
                ...editData, 
                role: e.target.value as UserRole,
                assignedProvince: e.target.value === 'owner' ? '' : editData.assignedProvince
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="owner">Owner</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          {/* Province (only for volunteers) */}
          {editData.role === 'volunteer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Province
              </label>
              <ProvinceSelector
                selectedProvinceCode={editData.assignedProvince}
                onSelectionChange={(selection) => 
                  setEditData({ ...editData, assignedProvince: selection as string })
                }
                placeholder="Select province"
                className="w-full"
              />
            </div>
          )}

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editData.isActive}
                onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active User
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isLoading && <LoadingSpinner size="sm" className="p-0" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Main User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {(user.displayName || user.email)[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {user.displayName || user.email.split('@')[0]}
                </h3>
                
                {/* Status Badge */}
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                  }
                `}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>

                {/* Role Badge */}
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${user.role === 'owner' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                  }
                `}>
                  {user.role === 'owner' ? 'Owner' : 'Volunteer'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">{user.email}</p>

              {/* Province */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">Province:</span>
                {user.assignedProvince ? (
                  <ProvinceBadge 
                    provinceCode={user.assignedProvince}
                    showFullName
                    className="text-xs"
                  />
                ) : (
                  <span className="text-sm text-gray-400 italic">All Provinces</span>
                )}
              </div>

              {/* Detailed Info */}
              {detailed && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDate(user.createdAt)}
                  </div>
                  {user.updatedAt && (
                    <div>
                      <span className="font-medium">Updated:</span>{' '}
                      {formatDate(user.updatedAt)}
                    </div>
                  )}
                  {user.lastLoginAt && (
                    <div>
                      <span className="font-medium">Last Login:</span>{' '}
                      {formatDate(user.lastLoginAt)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">User ID:</span>{' '}
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {isLoading && <LoadingSpinner size="sm" className="p-0" />}
            
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              title="Edit user"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={handleToggleActive}
              disabled={isLoading}
              className={`
                p-2 transition-colors disabled:opacity-50
                ${user.isActive 
                  ? 'text-red-400 hover:text-red-600' 
                  : 'text-green-400 hover:text-green-600'
                }
              `}
              title={user.isActive ? 'Deactivate user' : 'Activate user'}
            >
              {user.isActive ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}