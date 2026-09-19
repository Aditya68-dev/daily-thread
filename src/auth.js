import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth as configuredAuth, googleProvider as configuredProvider } from './firebase.js';

export const auth = configuredAuth;
export const googleProvider = configuredProvider;

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logoutUser = () => signOut(auth);

export { onAuthStateChanged } from 'firebase/auth';
