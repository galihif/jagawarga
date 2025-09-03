/**
 * Firebase Collections Schema for Multi-Admin JagaWarga
 * This file documents the Firebase Firestore collections structure
 */

import type { Timestamp } from 'firebase/firestore';
import type { MapElement } from './map';
import type { User } from './user';
import type { Invitation } from './invitation';

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  MAP_ELEMENTS: 'mapElements', 
  INVITATIONS: 'invitations',
} as const;

// Firebase Document Interfaces (with Timestamp types for Firestore)

export interface UserDocument extends Omit<User, 'createdAt' | 'updatedAt' | 'lastLoginAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface MapElementDocument extends Omit<MapElement, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface InvitationDocument extends Omit<Invitation, 'createdAt' | 'expiresAt' | 'usedAt' | 'revokedAt'> {
  createdAt: Timestamp;
  expiresAt: Timestamp;
  usedAt?: Timestamp;
  revokedAt?: Timestamp;
}

// Query helpers for type safety
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

// Index definitions for Firestore (for documentation purposes)
export const FIRESTORE_INDEXES = {
  // For province-based queries
  mapElements: [
    { fields: ['province'], queryScope: 'COLLECTION' },
    { fields: ['province', 'createdAt'], queryScope: 'COLLECTION' },
    { fields: ['createdBy'], queryScope: 'COLLECTION' },
  ],
  
  // For user management
  users: [
    { fields: ['role'], queryScope: 'COLLECTION' },
    { fields: ['assignedProvince'], queryScope: 'COLLECTION' },
    { fields: ['role', 'isActive'], queryScope: 'COLLECTION' },
  ],
  
  // For invitation management
  invitations: [
    { fields: ['createdBy'], queryScope: 'COLLECTION' },
    { fields: ['province'], queryScope: 'COLLECTION' },
    { fields: ['isUsed'], queryScope: 'COLLECTION' },
    { fields: ['expiresAt'], queryScope: 'COLLECTION' },
  ],
} as const;

// Security Rules Helpers (for documentation)
export const SECURITY_RULE_FUNCTIONS = `
// Helper functions for Firestore Security Rules

function isOwner() {
  return request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "owner";
}

function isVolunteerForProvince(province) {
  return request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedProvince == province;
}

function canWriteToProvince(province) {
  return isOwner() || isVolunteerForProvince(province);
}

function isActiveUser() {
  return request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
}
` as const;