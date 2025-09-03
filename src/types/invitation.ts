import type { Timestamp } from 'firebase/firestore';

export interface Invitation {
  token: string;
  province: string; // Province code
  provinceName: string; // Human readable name
  createdBy: string; // User ID of creator (owner)
  createdByName?: string; // Display name of creator
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  isUsed: boolean;
  usedBy?: string; // User ID who used the invitation
  usedByName?: string; // Display name of user who used it
  usedAt?: Timestamp | Date;
  isRevoked?: boolean;
  revokedAt?: Timestamp | Date;
  revokedBy?: string;
}

export interface CreateInvitationData {
  province: string;
  createdBy: string;
  createdByName?: string;
  expirationDays?: number; // Default 7 days
}

export interface InvitationStats {
  total: number;
  active: number;
  used: number;
  expired: number;
  revoked: number;
}

// Token format: PROVINCE-RANDOM (e.g., JABAR-X7K2M9)
export const generateInvitationToken = (provinceCode: string): string => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${provinceCode}-${randomPart}`;
};

export const parseInvitationToken = (token: string): { province: string; randomPart: string } | null => {
  const parts = token.split('-');
  if (parts.length !== 2) return null;
  
  return {
    province: parts[0],
    randomPart: parts[1]
  };
};