import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration for the Daily Thread project.
// Prefer environment variables in local dev and deployment, while keeping the
// project ID aligned with the real Firebase project: daily-3d199.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC89-C22hX3JCnyfk2IEh-wBnxR_-DepE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'daily-3d199.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'daily-3d199',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'daily-3d199.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '42117614817',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:42117614817:web:90228fde2383fcd618bba0'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
