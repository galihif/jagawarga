'use client';

import { useState } from 'react';
import { getDatabase } from '@/src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/types/firebase';
import type { UserDocument } from '@/src/types/firebase';

export default function BootstrapPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOwnerUser = async (email: string, name: string) => {
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
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to create owner user:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createOwnerUser(email.trim(), name.trim() || 'Owner');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create owner user');
    } finally {
      setIsCreating(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Owner Created Successfully!</h1>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-green-800">
                <strong>Email:</strong> {email}<br/>
                <strong>Role:</strong> owner<br/>
                <strong>Name:</strong> {name || 'Owner'}
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p className="font-semibold">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Go back to the main page</li>
                <li>Sign in with Google using <strong>{email}</strong></li>
                <li>Access <strong>/admin</strong> to create invitations</li>
                <li>Create province-specific volunteers</li>
              </ol>
            </div>

            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Main Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bootstrap Owner Account</h1>
          <p className="text-sm text-gray-600">
            Create the first owner account to start using the invitation system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Google Account Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@gmail.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the same email you'll sign in with Google
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Name (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Owner...' : 'Create Owner Account'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> This creates your user record in the database with owner privileges. 
            After creating, you can sign in with Google and access the admin panel.
          </div>
        </div>
      </div>
    </div>
  );
}