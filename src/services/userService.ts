import { UserRepository } from '@/src/repositories/userRepository';
import type { User, CreateUserData, UpdateUserData, UserRole } from '@/src/types/user';
import { getProvinceByCode } from '@/src/config/provinces';

export interface CreateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
}

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  // Validate user data
  validateUserData(userData: CreateUserData | UpdateUserData): UserValidationResult {
    const errors: string[] = [];

    // Email validation
    if ('email' in userData && userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    // Role validation
    if ('role' in userData && userData.role) {
      if (!['owner', 'volunteer'].includes(userData.role)) {
        errors.push('Invalid user role');
      }
    }

    // Province validation for volunteers
    if ('assignedProvince' in userData && userData.assignedProvince) {
      const province = getProvinceByCode(userData.assignedProvince);
      if (!province) {
        errors.push('Invalid province code');
      }
    }

    // Volunteer must have assigned province
    if ('role' in userData && userData.role === 'volunteer' && 
        'assignedProvince' in userData && !userData.assignedProvince) {
      errors.push('Volunteers must be assigned to a province');
    }

    // Owner should not have assigned province
    if ('role' in userData && userData.role === 'owner' && 
        'assignedProvince' in userData && userData.assignedProvince) {
      errors.push('Owners should not be assigned to a specific province');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create new user with validation
  async createUser(userData: CreateUserData, userId?: string): Promise<CreateUserResponse> {
    try {
      // Validate input data
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if email already exists
      const existingUser = await this.repository.getUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create user
      const user = await this.repository.createUser(userData, userId);
      if (!user) {
        return {
          success: false,
          error: 'Failed to create user in database'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('UserService.createUser error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.repository.getUserById(userId);
    } catch (error) {
      console.error('UserService.getUserById error:', error);
      return null;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.getUserByEmail(email);
    } catch (error) {
      console.error('UserService.getUserByEmail error:', error);
      return null;
    }
  }

  // Update user with validation
  async updateUser(userId: string, updates: UpdateUserData): Promise<UpdateUserResponse> {
    try {
      // Validate input data
      const validation = this.validateUserData(updates);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if user exists
      const existingUser = await this.repository.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Check if email is being changed and if new email already exists
      if (updates.email && updates.email !== existingUser.email) {
        const emailExists = await this.repository.emailExists(updates.email);
        if (emailExists) {
          return {
            success: false,
            error: 'Email already exists'
          };
        }
      }

      // Update user
      const user = await this.repository.updateUser(userId, updates);
      if (!user) {
        return {
          success: false,
          error: 'Failed to update user'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('UserService.updateUser error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.repository.updateLastLogin(userId);
    } catch (error) {
      console.error('UserService.updateLastLogin error:', error);
    }
  }

  // Deactivate user
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      return await this.repository.deactivateUser(userId);
    } catch (error) {
      console.error('UserService.deactivateUser error:', error);
      return false;
    }
  }

  // Activate user
  async activateUser(userId: string): Promise<boolean> {
    try {
      return await this.repository.activateUser(userId);
    } catch (error) {
      console.error('UserService.activateUser error:', error);
      return false;
    }
  }

  // Get users with filters
  async getUsers(filters?: {
    role?: UserRole;
    province?: string;
    isActive?: boolean;
  }): Promise<User[]> {
    try {
      return await this.repository.getUsers(filters);
    } catch (error) {
      console.error('UserService.getUsers error:', error);
      return [];
    }
  }

  // Get all volunteers
  async getVolunteers(): Promise<User[]> {
    return this.getUsers({ role: 'volunteer', isActive: true });
  }

  // Get all owners
  async getOwners(): Promise<User[]> {
    return this.getUsers({ role: 'owner', isActive: true });
  }

  // Get volunteers by province
  async getVolunteersByProvince(province: string): Promise<User[]> {
    try {
      return await this.repository.getVolunteersByProvince(province);
    } catch (error) {
      console.error('UserService.getVolunteersByProvince error:', error);
      return [];
    }
  }

  // Check if user has permission for province
  canAccessProvince(user: User, province: string): boolean {
    // Owners can access all provinces
    if (user.role === 'owner') {
      return true;
    }
    
    // Volunteers can only access their assigned province
    if (user.role === 'volunteer') {
      return user.assignedProvince === province;
    }
    
    return false;
  }

  // Check if user can create/edit elements in province
  canModifyInProvince(user: User, province: string): boolean {
    // Must be active user
    if (!user.isActive) {
      return false;
    }
    
    return this.canAccessProvince(user, province);
  }

  // Get user statistics
  async getUserStats() {
    try {
      return await this.repository.getUserStats();
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      return {
        total: 0,
        owners: 0,
        volunteers: 0,
        active: 0,
        inactive: 0,
        byProvince: {},
      };
    }
  }

  // Subscribe to users with filters
  subscribeToUsers(
    callback: (users: User[]) => void,
    filters?: {
      role?: UserRole;
      province?: string;
      isActive?: boolean;
    }
  ) {
    return this.repository.subscribeToUsers(callback, filters);
  }

  // Subscribe to specific user
  subscribeToUser(userId: string, callback: (user: User | null) => void) {
    return this.repository.subscribeToUser(userId, callback);
  }

  // Get formatted user display name
  getDisplayName(user: User): string {
    if (user.displayName) {
      return user.displayName;
    }
    
    // Fallback to email username
    return user.email.split('@')[0];
  }

  // Get user role display text
  getRoleDisplayText(role: UserRole): string {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'volunteer':
        return 'Volunteer';
      default:
        return 'Unknown';
    }
  }

  // Get province display name for user
  getProvinceDisplayName(user: User): string {
    if (!user.assignedProvince) {
      return 'All Provinces';
    }
    
    const province = getProvinceByCode(user.assignedProvince);
    return province ? province.name : user.assignedProvince;
  }
}

// Singleton instance
let userServiceInstance: UserService | null = null;

export function getUserService(): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService();
  }
  return userServiceInstance;
}