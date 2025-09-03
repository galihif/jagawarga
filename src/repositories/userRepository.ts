import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
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

import { getUsersCollection } from '@/src/lib/firebase';
import type { User, CreateUserData, UpdateUserData, UserRole } from '@/src/types/user';
import type { UserDocument } from '@/src/types/firebase';

export class UserRepository {
  private collection = getUsersCollection();

  // Convert Firestore document to User object
  private mapDocumentToUser(doc: DocumentSnapshot<UserDocument>): User | null {
    const data = doc.data();
    if (!data) return null;

    return {
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role,
      assignedProvince: data.assignedProvince,
      isActive: data.isActive,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      lastLoginAt: data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate() : data.lastLoginAt,
    };
  }

  // Create new user
  async createUser(userData: CreateUserData, userId?: string): Promise<User | null> {
    try {
      const now = serverTimestamp();
      const docData: Omit<UserDocument, 'id'> = {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        assignedProvince: userData.assignedProvince,
        isActive: true,
        createdAt: now as Timestamp,
        updatedAt: now as Timestamp,
      };

      let docRef;
      if (userId) {
        // Create user with specific ID (for Auth UID)
        docRef = doc(this.collection, userId);
        await updateDoc(docRef, docData as any);
      } else {
        // Create user with auto-generated ID
        docRef = await addDoc(this.collection, docData as any);
      }

      // Return the created user
      const createdDoc = await getDoc(docRef);
      return this.mapDocumentToUser(createdDoc);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(this.collection, userId);
      const docSnap = await getDoc(docRef);
      return this.mapDocumentToUser(docSnap);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(this.collection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return this.mapDocumentToUser(doc);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Update user
  async updateUser(userId: string, updates: UpdateUserData): Promise<User | null> {
    try {
      const docRef = doc(this.collection, userId);
      const updateData: Partial<UserDocument> = {
        ...updates,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await updateDoc(docRef, updateData as any);
      
      // Return updated user
      const updatedDoc = await getDoc(docRef);
      return this.mapDocumentToUser(updatedDoc);
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Update last login time
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const docRef = doc(this.collection, userId);
      await updateDoc(docRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Delete user (soft delete by deactivating)
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      const docRef = doc(this.collection, userId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }

  // Reactivate user
  async activateUser(userId: string): Promise<boolean> {
    try {
      const docRef = doc(this.collection, userId);
      await updateDoc(docRef, {
        isActive: true,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      return false;
    }
  }

  // Get all users with optional filters
  async getUsers(filters?: {
    role?: UserRole;
    province?: string;
    isActive?: boolean;
  }): Promise<User[]> {
    try {
      let q = query(this.collection, orderBy('createdAt', 'desc'));
      
      if (filters?.role) {
        q = query(q, where('role', '==', filters.role));
      }
      
      if (filters?.province) {
        q = query(q, where('assignedProvince', '==', filters.province));
      }
      
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const user = this.mapDocumentToUser(doc);
        if (user) users.push(user);
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Get volunteers by province
  async getVolunteersByProvince(province: string): Promise<User[]> {
    return this.getUsers({
      role: 'volunteer',
      province,
      isActive: true,
    });
  }

  // Real-time subscription to users
  subscribeToUsers(
    callback: (users: User[]) => void,
    filters?: {
      role?: UserRole;
      province?: string;
      isActive?: boolean;
    }
  ): Unsubscribe {
    let q = query(this.collection, orderBy('createdAt', 'desc'));
    
    if (filters?.role) {
      q = query(q, where('role', '==', filters.role));
    }
    
    if (filters?.province) {
      q = query(q, where('assignedProvince', '==', filters.province));
    }
    
    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    return onSnapshot(q, (snapshot: QuerySnapshot<UserDocument>) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        const user = this.mapDocumentToUser(doc);
        if (user) users.push(user);
      });
      callback(users);
    });
  }

  // Real-time subscription to a specific user
  subscribeToUser(userId: string, callback: (user: User | null) => void): Unsubscribe {
    const docRef = doc(this.collection, userId);
    return onSnapshot(docRef, (doc) => {
      const user = this.mapDocumentToUser(doc);
      callback(user);
    });
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      return user !== null;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number;
    owners: number;
    volunteers: number;
    active: number;
    inactive: number;
    byProvince: Record<string, number>;
  }> {
    try {
      const allUsers = await this.getUsers();
      
      const stats = {
        total: allUsers.length,
        owners: allUsers.filter(u => u.role === 'owner').length,
        volunteers: allUsers.filter(u => u.role === 'volunteer').length,
        active: allUsers.filter(u => u.isActive).length,
        inactive: allUsers.filter(u => !u.isActive).length,
        byProvince: {} as Record<string, number>,
      };
      
      // Count by province
      allUsers.forEach(user => {
        if (user.assignedProvince) {
          stats.byProvince[user.assignedProvince] = (stats.byProvince[user.assignedProvince] || 0) + 1;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
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
}