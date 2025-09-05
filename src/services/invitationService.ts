import { InvitationRepository } from '@/src/repositories/invitationRepository';
import type { Invitation, CreateInvitationData } from '@/src/types/invitation';
import { parseInvitationToken } from '@/src/types/invitation';
import { getProvinceByCode } from '@/src/config/provinces';
import { getUserService } from './userService';

export interface CreateInvitationResponse {
  success: boolean;
  invitation?: Invitation;
  error?: string;
  whatsappUrl?: string;
}

export interface InvitationValidationResponse {
  isValid: boolean;
  invitation?: Invitation;
  error?: string;
}

export class InvitationService {
  private repository: InvitationRepository;
  private userService = getUserService();

  constructor() {
    this.repository = new InvitationRepository();
  }

  // Validate invitation data before creation
  validateInvitationData(data: CreateInvitationData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate province
    const province = getProvinceByCode(data.province);
    if (!province) {
      errors.push('Invalid province code');
    }

    // Validate creator exists
    if (!data.createdBy) {
      errors.push('Creator ID is required');
    }

    // Validate expiration days
    if (data.expirationDays && (data.expirationDays < 1 || data.expirationDays > 365)) {
      errors.push('Expiration days must be between 1 and 365');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create new invitation with validation
  async createInvitation(data: CreateInvitationData): Promise<CreateInvitationResponse> {
    try {
      // Validate input data
      const validation = this.validateInvitationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Verify creator exists and has permission
      const creator = await this.userService.getUserById(data.createdBy);
      if (!creator) {
        return {
          success: false,
          error: 'Creator not found'
        };
      }

      if (creator.role !== 'owner') {
        return {
          success: false,
          error: 'Only owners can create invitations'
        };
      }

      // Create invitation
      const invitation = await this.repository.createInvitation(data);
      if (!invitation) {
        return {
          success: false,
          error: 'Failed to create invitation'
        };
      }

      // Generate WhatsApp URL
      const whatsappUrl = this.generateWhatsAppUrl(invitation.token, invitation.provinceName);

      return {
        success: true,
        invitation,
        whatsappUrl
      };
    } catch (error) {
      console.error('InvitationService.createInvitation error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  // Get invitation by token with validation
  async getInvitationByToken(token: string): Promise<Invitation | null> {
    try {
      return await this.repository.getInvitationByToken(token);
    } catch (error) {
      console.error('InvitationService.getInvitationByToken error:', error);
      return null;
    }
  }

  // Validate and use invitation
  async validateAndUseInvitation(token: string, userId: string, userEmail?: string, displayName?: string): Promise<InvitationValidationResponse> {
    try {
      // First validate the token format
      const tokenParts = parseInvitationToken(token);
      if (!tokenParts) {
        return {
          isValid: false,
          error: 'Invalid token format'
        };
      }

      // Validate invitation exists and is usable
      const validation = await this.repository.validateInvitationToken(token);
      if (!validation.isValid) {
        return validation;
      }

      const invitation = validation.invitation!;

      // Check if user already exists in our database
      const existingUser = await this.userService.getUserById(userId);
      if (existingUser) {
        // User exists - check if they can access this province
        if (existingUser.role === 'owner' || existingUser.assignedProvince === invitation.province) {
          return {
            isValid: false,
            error: 'You already have access to this province'
          };
        }

        // User exists but for different province - not allowed
        return {
          isValid: false,
          error: 'You are already registered for a different province'
        };
      }

      // User doesn't exist in our database, create them as a volunteer
      if (userEmail) {
        const createUserResult = await this.userService.createUser({
          id: userId,
          email: userEmail,
          displayName: displayName || 'Volunteer',
          role: 'volunteer',
          assignedProvince: invitation.province,
          isActive: true,
          createdBy: invitation.createdBy,
        });

        if (!createUserResult.success) {
          return {
            isValid: false,
            error: createUserResult.error || 'Failed to create user account'
          };
        }
      }

      // Mark invitation as used
      const userName = displayName || userEmail || 'New User';
      const marked = await this.repository.markInvitationAsUsed(token, userId, userName);
      if (!marked) {
        return {
          isValid: false,
          error: 'Failed to use invitation'
        };
      }

      return {
        isValid: true,
        invitation
      };
    } catch (error) {
      console.error('InvitationService.validateAndUseInvitation error:', error);
      return {
        isValid: false,
        error: 'Internal server error'
      };
    }
  }

  // Revoke invitation
  async revokeInvitation(token: string, revokedBy: string): Promise<boolean> {
    try {
      // Verify revoker has permission
      const user = await this.userService.getUserById(revokedBy);
      if (!user || user.role !== 'owner') {
        return false;
      }

      return await this.repository.revokeInvitation(token, revokedBy);
    } catch (error) {
      console.error('InvitationService.revokeInvitation error:', error);
      return false;
    }
  }

  // Get invitations with filters
  async getInvitations(filters?: {
    province?: string;
    createdBy?: string;
    isUsed?: boolean;
    isExpired?: boolean;
    isRevoked?: boolean;
  }): Promise<Invitation[]> {
    try {
      return await this.repository.getInvitations(filters);
    } catch (error) {
      console.error('InvitationService.getInvitations error:', error);
      return [];
    }
  }

  // Get active invitations for province
  async getActiveInvitationsForProvince(province: string): Promise<Invitation[]> {
    try {
      return await this.repository.getActiveInvitations(province);
    } catch (error) {
      console.error('InvitationService.getActiveInvitationsForProvince error:', error);
      return [];
    }
  }

  // Get invitations created by user
  async getInvitationsByCreator(userId: string): Promise<Invitation[]> {
    try {
      return await this.repository.getInvitationsByCreator(userId);
    } catch (error) {
      console.error('InvitationService.getInvitationsByCreator error:', error);
      return [];
    }
  }

  // Get invitation statistics
  async getInvitationStats(province?: string) {
    try {
      return await this.repository.getInvitationStats(province);
    } catch (error) {
      console.error('InvitationService.getInvitationStats error:', error);
      return {
        total: 0,
        active: 0,
        used: 0,
        expired: 0,
        revoked: 0,
      };
    }
  }

  // Subscribe to invitations
  subscribeToInvitations(
    callback: (invitations: Invitation[]) => void,
    filters?: {
      province?: string;
      createdBy?: string;
      isUsed?: boolean;
      isRevoked?: boolean;
    }
  ) {
    return this.repository.subscribeToInvitations(callback, filters);
  }

  // Generate WhatsApp invitation URL
  generateWhatsAppUrl(token: string, provinceName: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${token}`;
    
    const message = encodeURIComponent(
      `🚨 *JagaWarga ${provinceName}* 🚨\n\n` +
      `Anda diundang untuk menjadi volunteer JagaWarga untuk wilayah ${provinceName}.\n\n` +
      `Klik link di bawah ini untuk bergabung:\n${inviteUrl}\n\n` +
      `*Penting:* Link ini hanya berlaku selama 7 hari dan hanya bisa digunakan sekali.`
    );
    
    return `https://wa.me/?text=${message}`;
  }

  // Generate direct invitation link
  generateInvitationLink(token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/invite/${token}`;
  }

  // Check if user can create invitations for province
  async canCreateInvitation(userId: string, province: string): Promise<boolean> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) return false;

      // Only owners can create invitations
      if (user.role !== 'owner') return false;

      // Owners can create invitations for any province
      return true;
    } catch (error) {
      console.error('InvitationService.canCreateInvitation error:', error);
      return false;
    }
  }

  // Clean up expired invitations (utility method)
  async cleanupExpiredInvitations(): Promise<number> {
    try {
      const expiredInvitations = await this.getInvitations({ isExpired: true });
      let cleanedCount = 0;

      for (const invitation of expiredInvitations) {
        if (!invitation.isUsed && !invitation.isRevoked) {
          // Optionally revoke expired invitations
          // await this.repository.revokeInvitation(invitation.token, 'system');
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('InvitationService.cleanupExpiredInvitations error:', error);
      return 0;
    }
  }
}

// Singleton instance
let invitationServiceInstance: InvitationService | null = null;

export function getInvitationService(): InvitationService {
  if (!invitationServiceInstance) {
    invitationServiceInstance = new InvitationService();
  }
  return invitationServiceInstance;
}