'use client';

import React, { useState, useMemo } from 'react';
import { useUsers, useUserStats } from '@/src/hooks/useUsers';
import type { User, UserRole } from '@/src/types/user';
import { UserProfileCard } from './UserProfileCard';
import { CreateUserModal } from './CreateUserModal';
import { ProvinceSelector } from '@/src/components/ui/ProvinceSelector';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { getProvinceByCode } from '@/src/config/provinces';
import { IndonesianRegion } from '@/src/types/province';

interface UserManagementProps {
  className?: string;
}

type FilterTab = 'all' | 'owners' | 'volunteers' | 'active' | 'inactive';

export function UserManagement({ className = '' }: UserManagementProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Get filters based on active tab
  const filters = useMemo(() => {
    const baseFilters: {
      role?: UserRole;
      isActive?: boolean;
    } = {};

    switch (activeTab) {
      case 'owners':
        baseFilters.role = 'owner';
        break;
      case 'volunteers':
        baseFilters.role = 'volunteer';
        break;
      case 'active':
        baseFilters.isActive = true;
        break;
      case 'inactive':
        baseFilters.isActive = false;
        break;
      default:
        // All users - no additional filters
        break;
    }

    return baseFilters;
  }, [activeTab]);

  // Fetch users and stats
  const { users, loading: usersLoading, error: usersError, refresh } = useUsers({
    ...filters,
    realTime: true,
  });

  const { stats, loading: statsLoading, error: statsError } = useUserStats();

  // Filter users by search term and provinces
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.assignedProvince && getProvinceByCode(user.assignedProvince)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Province filter
    if (selectedProvinces.length > 0) {
      filtered = filtered.filter(user =>
        user.assignedProvince && selectedProvinces.includes(user.assignedProvince)
      );
    }

    return filtered;
  }, [users, searchTerm, selectedProvinces]);

  const tabs = [
    { id: 'all' as FilterTab, label: 'All Users', count: stats.total },
    { id: 'owners' as FilterTab, label: 'Owners', count: stats.owners },
    { id: 'volunteers' as FilterTab, label: 'Volunteers', count: stats.volunteers },
    { id: 'active' as FilterTab, label: 'Active', count: stats.active },
    { id: 'inactive' as FilterTab, label: 'Inactive', count: stats.inactive },
  ];

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    refresh();
    handleCloseUserDetails();
  };

  if (usersError) {
    return <ErrorMessage message={usersError} className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage users, assign roles, and control province access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add User
        </button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && !statsError && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                ${activeTab === tab.id
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tab.count}</div>
                <div className="text-sm text-gray-600">{tab.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Province Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Province
            </label>
            <ProvinceSelector
              selectedProvinceCodes={selectedProvinces}
              multiple
              placeholder="All provinces"
              onSelectionChange={(selection) => setSelectedProvinces(selection as string[])}
              showRegionGroups
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedProvinces.length > 0) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProvinces([]);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {usersLoading ? (
            <div className="p-8">
              <LoadingSpinner message="Loading users..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-xl mb-2">👥</div>
              <div className="font-medium mb-1">No users found</div>
              <div className="text-sm">
                {searchTerm || selectedProvinces.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first user'
                }
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserProfileCard
                key={user.id}
                user={user}
                onClick={() => handleUserClick(user)}
                onUserUpdated={refresh}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              />
            ))
          )}
        </div>
      </div>

      {/* Province Statistics */}
      {!statsLoading && Object.keys(stats.byProvince).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users by Province</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byProvince)
                .sort(([, a], [, b]) => b - a)
                .map(([provinceCode, count]) => {
                  const province = getProvinceByCode(provinceCode);
                  return (
                    <div
                      key={provinceCode}
                      className="p-3 bg-gray-50 rounded-lg text-center"
                    >
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">
                        {province?.name || provinceCode}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={() => {
            setShowCreateModal(false);
            refresh();
          }}
        />
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseUserDetails}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}

// User Details Modal Component
interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

function UserDetailsModal({ user, onClose, onUserUpdated }: UserDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  User Details
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <UserProfileCard
                user={user}
                detailed
                onUserUpdated={onUserUpdated}
                className="border-0 p-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}