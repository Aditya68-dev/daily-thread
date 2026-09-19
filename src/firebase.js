import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC89-C22XhM3JCnyfk2IEh-wBnxR_-DepE",
  authDomain: "daily-3d199.firebaseapp.com",
  projectId: "daily-3d199",
  storageBucket: "daily-3d199.firebasestorage.app",
  messagingSenderId: "42117614817",
  appId: "1:42117614817:web:e88ee42bfdf14cde18bba0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
