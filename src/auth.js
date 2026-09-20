import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';

export { auth, googleProvider, onAuthStateChanged };

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};
