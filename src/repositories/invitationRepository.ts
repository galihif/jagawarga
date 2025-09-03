import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';

import { getInvitationsCollection } from '@/src/lib/firebase';
import type { Invitation, CreateInvitationData } from '@/src/types/invitation';
import { generateInvitationToken } from '@/src/types/invitation';
import type { InvitationDocument } from '@/src/types/firebase';
import { getProvinceByCode } from '@/src/config/provinces';

export class InvitationRepository {
  private collection = getInvitationsCollection();

  // Convert Firestore document to Invitation object
  private mapDocumentToInvitation(doc: DocumentSnapshot<InvitationDocument>): Invitation | null {
    const data = doc.data();
    if (!data) return null;

    return {
      token: doc.id, // Use document ID as token
      province: data.province,
      provinceName: data.provinceName,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : data.expiresAt,
      isUsed: data.isUsed,
      usedBy: data.usedBy,
      usedByName: data.usedByName,
      usedAt: data.usedAt instanceof Timestamp ? data.usedAt?.toDate() : data.usedAt,
      isRevoked: data.isRevoked,
      revokedAt: data.revokedAt instanceof Timestamp ? data.revokedAt?.toDate() : data.revokedAt,
      revokedBy: data.revokedBy,
    };
  }

  // Create new invitation
  async createInvitation(invitationData: CreateInvitationData): Promise<Invitation | null> {
    try {
      const province = getProvinceByCode(invitationData.province);
      if (!province) {
        throw new Error('Invalid province code');
      }

      // Generate unique token
      let token: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        token = generateInvitationToken(invitationData.province);
        const existing = await this.getInvitationByToken(token);
        isUnique = !existing;
        attempts++;
      } while (!isUnique && attempts < maxAttempts);

      if (!isUnique) {
        throw new Error('Unable to generate unique token');
      }

      const now = serverTimestamp();
      const expirationDays = invitationData.expirationDays || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      const docData: Omit<InvitationDocument, 'token'> = {
        province: invitationData.province,
        provinceName: province.name,
        createdBy: invitationData.createdBy,
        createdByName: invitationData.createdByName,
        createdAt: now as Timestamp,
        expiresAt: Timestamp.fromDate(expiresAt),
        isUsed: false,
        isRevoked: false,
      };

      // Use token as document ID
      const docRef = doc(this.collection, token!);
      await updateDoc(docRef, docData as any);

      // Return the created invitation
      const createdDoc = await getDoc(docRef);
      return this.mapDocumentToInvitation(createdDoc);
    } catch (error) {
      console.error('Error creating invitation:', error);
      return null;
    }
  }

  // Get invitation by token
  async getInvitationByToken(token: string): Promise<Invitation | null> {
    try {
      const docRef = doc(this.collection, token);
      const docSnap = await getDoc(docRef);
      return this.mapDocumentToInvitation(docSnap);
    } catch (error) {
      console.error('Error getting invitation by token:', error);
      return null;
    }
  }

  // Mark invitation as used
  async markInvitationAsUsed(token: string, userId: string, userName?: string): Promise<boolean> {
    try {
      const docRef = doc(this.collection, token);
      await updateDoc(docRef, {
        isUsed: true,
        usedBy: userId,
        usedByName: userName,
        usedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error marking invitation as used:', error);
      return false;
    }
  }

  // Revoke invitation
  async revokeInvitation(token: string, revokedBy: string): Promise<boolean> {
    try {
      const docRef = doc(this.collection, token);
      await updateDoc(docRef, {
        isRevoked: true,
        revokedBy,
        revokedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error revoking invitation:', error);
      return false;
    }
  }

  // Get all invitations with optional filters
  async getInvitations(filters?: {
    province?: string;
    createdBy?: string;
    isUsed?: boolean;
    isExpired?: boolean;
    isRevoked?: boolean;
  }): Promise<Invitation[]> {
    try {
      let q = query(this.collection, orderBy('createdAt', 'desc'));

      if (filters?.province) {
        q = query(q, where('province', '==', filters.province));
      }

      if (filters?.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy));
      }

      if (filters?.isUsed !== undefined) {
        q = query(q, where('isUsed', '==', filters.isUsed));
      }

      if (filters?.isRevoked !== undefined) {
        q = query(q, where('isRevoked', '==', filters.isRevoked));
      }

      const querySnapshot = await getDocs(q);
      const invitations: Invitation[] = [];
      const now = new Date();

      querySnapshot.forEach((doc) => {
        const invitation = this.mapDocumentToInvitation(doc);
        if (invitation) {
          // Apply client-side filtering for expiration
          const isExpired = invitation.expiresAt < now;
          if (filters?.isExpired !== undefined && isExpired !== filters.isExpired) {
            return; // Skip this invitation
          }
          invitations.push(invitation);
        }
      });

      return invitations;
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  }

  // Get invitations by province
  async getInvitationsByProvince(province: string): Promise<Invitation[]> {
    return this.getInvitations({ province });
  }

  // Get invitations created by user
  async getInvitationsByCreator(userId: string): Promise<Invitation[]> {
    return this.getInvitations({ createdBy: userId });
  }

  // Get active invitations (not used, not expired, not revoked)
  async getActiveInvitations(province?: string): Promise<Invitation[]> {
    const filters: any = {
      isUsed: false,
      isRevoked: false,
      isExpired: false,
    };

    if (province) {
      filters.province = province;
    }

    return this.getInvitations(filters);
  }

  // Real-time subscription to invitations
  subscribeToInvitations(
    callback: (invitations: Invitation[]) => void,
    filters?: {
      province?: string;
      createdBy?: string;
      isUsed?: boolean;
      isRevoked?: boolean;
    }
  ): Unsubscribe {
    let q = query(this.collection, orderBy('createdAt', 'desc'));

    if (filters?.province) {
      q = query(q, where('province', '==', filters.province));
    }

    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }

    if (filters?.isUsed !== undefined) {
      q = query(q, where('isUsed', '==', filters.isUsed));
    }

    if (filters?.isRevoked !== undefined) {
      q = query(q, where('isRevoked', '==', filters.isRevoked));
    }

    return onSnapshot(q, (snapshot: QuerySnapshot<InvitationDocument>) => {
      const invitations: Invitation[] = [];
      snapshot.forEach((doc) => {
        const invitation = this.mapDocumentToInvitation(doc);
        if (invitation) invitations.push(invitation);
      });
      callback(invitations);
    });
  }

  // Get invitation statistics
  async getInvitationStats(province?: string): Promise<{
    total: number;
    active: number;
    used: number;
    expired: number;
    revoked: number;
  }> {
    try {
      const allInvitations = await this.getInvitations(province ? { province } : undefined);
      const now = new Date();

      const stats = {
        total: allInvitations.length,
        active: 0,
        used: 0,
        expired: 0,
        revoked: 0,
      };

      allInvitations.forEach(invitation => {
        if (invitation.isRevoked) {
          stats.revoked++;
        } else if (invitation.isUsed) {
          stats.used++;
        } else if (invitation.expiresAt < now) {
          stats.expired++;
        } else {
          stats.active++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting invitation stats:', error);
      return {
        total: 0,
        active: 0,
        used: 0,
        expired: 0,
        revoked: 0,
      };
    }
  }

  // Validate invitation token
  async validateInvitationToken(token: string): Promise<{
    isValid: boolean;
    invitation?: Invitation;
    error?: string;
  }> {
    try {
      const invitation = await this.getInvitationByToken(token);
      
      if (!invitation) {
        return {
          isValid: false,
          error: 'Invitation not found'
        };
      }

      if (invitation.isRevoked) {
        return {
          isValid: false,
          error: 'Invitation has been revoked'
        };
      }

      if (invitation.isUsed) {
        return {
          isValid: false,
          error: 'Invitation has already been used'
        };
      }

      const now = new Date();
      if (invitation.expiresAt < now) {
        return {
          isValid: false,
          error: 'Invitation has expired'
        };
      }

      return {
        isValid: true,
        invitation
      };
    } catch (error) {
      console.error('Error validating invitation token:', error);
      return {
        isValid: false,
        error: 'Failed to validate invitation'
      };
    }
  }
}