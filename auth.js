import {
  signInWithPopup,
  signOut
} from "firebase/auth";

import {
  auth,
  googleProvider
} from "./firebase";

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    const user = result.user;

    console.log("Login berhasil:", user.displayName);

    return user;
  } catch (error) {
    console.error("Login gagal:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};