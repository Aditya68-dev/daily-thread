// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC89-C22XhM3JCnyfk2IEh-wBnxR_-DepE",
  authDomain: "daily-3d199.firebaseapp.com",
  projectId: "daily-3d199",
  storageBucket: "daily-3d199.firebasestorage.app",
  messagingSenderId: "42117614817",
  appId: "1:42117614817:web:90228fde2383fcd618bba0",
  measurementId: "G-THGYKQSBFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
