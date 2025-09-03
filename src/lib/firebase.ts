import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore, collection, CollectionReference, DocumentReference } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { COLLECTIONS } from '@/src/types/firebase';
import type { UserDocument, MapElementDocument, InvitationDocument } from '@/src/types/firebase';

let app: FirebaseApp | null = null;
let database: Firestore | null = null;
let authInstance: Auth | null = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function initializeFirebaseApp(): FirebaseApp {
  if (!app) {
    const config = getFirebaseConfig();
    
    // Validate required config
    if (!config.apiKey || !config.projectId) {
      throw new Error('Firebase configuration is missing required environment variables');
    }
    
    app = initializeApp(config);
  }
  return app;
}

export function getDatabase(): Firestore {
  if (!database) {
    const firebaseApp = initializeFirebaseApp();
    database = getFirestore(firebaseApp);
  }
  return database;
}

export function getAuthInstance(): Auth {
  if (!authInstance) {
    const firebaseApp = initializeFirebaseApp();
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}

// Export the getter function - don't call it at module level
export const db = getDatabase;
export const auth = getAuthInstance;

// Collection References with Types
export function getUsersCollection(): CollectionReference<UserDocument> {
  return collection(getDatabase(), COLLECTIONS.USERS) as CollectionReference<UserDocument>;
}

export function getMapElementsCollection(): CollectionReference<MapElementDocument> {
  return collection(getDatabase(), COLLECTIONS.MAP_ELEMENTS) as CollectionReference<MapElementDocument>;
}

export function getInvitationsCollection(): CollectionReference<InvitationDocument> {
  return collection(getDatabase(), COLLECTIONS.INVITATIONS) as CollectionReference<InvitationDocument>;
}

export default initializeFirebaseApp;