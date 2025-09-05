import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';

import { getAuthInstance } from '@/src/lib/firebase';
import { getUserService } from '@/src/services/userService';
import type { User, CreateUserData } from '@/src/types/user';

export interface AuthResult {
  success: boolean;
  user?: User;
  firebaseUser?: FirebaseUser;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export class AuthService {
  private auth = getAuthInstance();
  private userService = getUserService();
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    // Request additional scopes
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from our database
      const user = await this.userService.getUserById(firebaseUser.uid);
      
      if (!user) {
        // User exists in Firebase Auth but not in our database
        // This shouldn't happen in normal flow, but handle gracefully
        await this.signOut();
        return {
          success: false,
          error: 'User account not found. Please contact administrator.',
        };
      }

      // Update last login
      await this.userService.updateLastLogin(firebaseUser.uid);

      return {
        success: true,
        user,
        firebaseUser,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      };
    }
  }

  // Sign up with email and password
  async signUpWithEmail(signUpData: SignUpData): Promise<AuthResult> {
    try {
      // First check if user exists in our database
      const existingUser = await this.userService.getUserByEmail(signUpData.email);
      
      if (!existingUser) {
        return {
          success: false,
          error: 'You need an invitation to register. Please contact administrator.',
        };
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        signUpData.email,
        signUpData.password
      );
      const firebaseUser = userCredential.user;

      // Update display name in Firebase Auth
      if (signUpData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: signUpData.displayName,
        });
      }

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Update user in our database
      const updateData = {
        displayName: signUpData.displayName || existingUser.displayName,
        photoURL: firebaseUser.photoURL || undefined,
      };

      const updateResult = await this.userService.updateUser(firebaseUser.uid, updateData);
      
      if (!updateResult.success) {
        // Rollback Firebase user creation if database update fails
        await firebaseUser.delete();
        return {
          success: false,
          error: 'Failed to create user account. Please try again.',
        };
      }

      return {
        success: true,
        user: updateResult.user!,
        firebaseUser,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      const firebaseUser = userCredential.user;

      // Check if user exists in our database by Firebase UID
      let user = await this.userService.getUserById(firebaseUser.uid);

      if (!user) {
        // Special case: Auto-create owner for id.giftech@gmail.com
        if (firebaseUser.email === 'id.giftech@gmail.com') {
          const createResult = await this.userService.createUser({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Owner',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'owner',
            assignedProvince: undefined,
          }, firebaseUser.uid);

          if (createResult.success) {
            user = createResult.user!;
          } else {
            await this.signOut();
            return {
              success: false,
              error: 'Failed to create owner account. Please contact administrator.',
            };
          }
        } else {
          // Check if user exists by email (bootstrap scenario)
          user = await this.userService.getUserByEmail(firebaseUser.email!);
          
          if (!user) {
            // Sign out if user not found
            await this.signOut();
            return {
              success: false,
              error: 'You need an invitation to register. Please contact administrator.',
            };
          }

          // Update the existing user record with Firebase UID
          const updateResult = await this.userService.updateUser(user.id, {
            displayName: firebaseUser.displayName || user.displayName,
            photoURL: firebaseUser.photoURL || user.photoURL,
          });

          if (updateResult.success) {
            user = updateResult.user!;
          }
        }
      } else {
        // Update user info from Google
        const updateResult = await this.userService.updateUser(firebaseUser.uid, {
          displayName: firebaseUser.displayName || user.displayName,
          photoURL: firebaseUser.photoURL || user.photoURL,
        });

        if (updateResult.success) {
          user = updateResult.user!;
        }
      }

      // Update last login
      await this.userService.updateLastLogin(firebaseUser.uid);

      return {
        success: true,
        user,
        firebaseUser,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      };
    }
  }

  // Verify email
  async sendEmailVerification(firebaseUser: FirebaseUser): Promise<{ success: boolean; error?: string }> {
    try {
      await sendEmailVerification(firebaseUser);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      };
    }
  }

  // Get current Firebase user
  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Get current user from database
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = this.getCurrentFirebaseUser();
    if (!firebaseUser) return null;

    return await this.userService.getUserById(firebaseUser.uid);
  }

  // Check if user email is verified
  isEmailVerified(): boolean {
    const user = this.getCurrentFirebaseUser();
    return user ? user.emailVerified : false;
  }

  // Update user profile
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const firebaseUser = this.getCurrentFirebaseUser();
      if (!firebaseUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, updates);

      // Update database
      const result = await this.userService.updateUser(firebaseUser.uid, updates);
      
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
      };
    }
  }

  // Validate invitation token and prepare for registration
  async validateInvitationForRegistration(token: string): Promise<{
    success: boolean;
    userEmail?: string;
    error?: string;
  }> {
    try {
      // This would typically validate the invitation token
      // For now, we'll implement a basic check
      const existingUser = await this.userService.getUserByEmail(''); // This needs invitation service integration
      
      // TODO: Implement proper invitation validation
      return {
        success: false,
        error: 'Invitation validation not yet implemented',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate invitation',
      };
    }
  }

  // Helper method to get user-friendly error messages
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please sign in again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please enable pop-ups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code.';
      case 'auth/invalid-verification-id':
        return 'Invalid verification ID.';
      default:
        console.error('Unhandled auth error:', errorCode);
        return 'An error occurred during authentication. Please try again.';
    }
  }
}

// Singleton instance
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}