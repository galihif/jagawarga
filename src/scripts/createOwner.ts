import { getDatabase } from '@/src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/types/firebase';
import type { UserDocument } from '@/src/types/firebase';

/**
 * Bootstrap script to create the first owner user
 * Run this once to create an owner who can then create invitations for others
 */
export async function createOwnerUser(email: string, name: string = 'Owner'): Promise<void> {
  try {
    const db = getDatabase();
    
    // Create a user document with owner role
    const ownerData: Omit<UserDocument, 'id'> = {
      email,
      displayName: name,
      role: 'owner',
      province: null, // Owners can access all provinces
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      photoURL: null,
      emailVerified: false,
    };

    // Use email as document ID (we'll update it when they actually sign in)
    const ownerRef = doc(db, COLLECTIONS.USERS, email.replace(/[.@]/g, '_'));
    
    await setDoc(ownerRef, ownerData);
    
    console.log(`✅ Owner user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Role: owner`);
    console.log(`\nNow you can:`);
    console.log(`1. Sign in with Google using this email`);
    console.log(`2. Access /admin to create invitations`);
    console.log(`3. Create province-specific volunteers`);
    
  } catch (error) {
    console.error('❌ Failed to create owner user:', error);
    throw error;
  }
}

// Export a function that can be called from browser console
export function createBootstrapOwner() {
  // Replace with your Google account email
  const email = prompt('Enter your Google account email:');
  const name = prompt('Enter your display name (optional):') || 'Owner';
  
  if (!email) {
    alert('Email is required');
    return;
  }
  
  return createOwnerUser(email, name);
}

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).createBootstrapOwner = createBootstrapOwner;
}