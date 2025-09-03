import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'owner' | 'volunteer';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  assignedProvince?: string; // Province code for volunteers
  isActive: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt?: Timestamp | Date;
}

export interface CreateUserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  assignedProvince?: string;
}

export interface UpdateUserData {
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
  assignedProvince?: string;
  isActive?: boolean;
}

// Firebase Auth Custom Claims
export interface CustomClaims {
  role: UserRole;
  province?: string;
  isActive?: boolean;
}