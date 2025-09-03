import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let database: Firestore | null = null;

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

// Export the getter function - don't call it at module level
export const db = getDatabase;

export default initializeFirebaseApp;