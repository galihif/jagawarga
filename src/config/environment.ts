interface EnvironmentConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not defined`);
  }
  return value;
}

function createEnvironmentConfig(): EnvironmentConfig {
  // Only access environment variables when function is called
  return {
    firebase: {
      apiKey: getRequiredEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: getRequiredEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: getRequiredEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: getRequiredEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getRequiredEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getRequiredEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
    },
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
}

export const getEnv = () => createEnvironmentConfig();

export default getEnv;