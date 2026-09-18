// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "rezzai-b31b2.firebaseapp.com",
  projectId: "rezzai-b31b2",
  storageBucket: "rezzai-b31b2.firebasestorage.app",
  messagingSenderId: "288075806620",
  appId: "1:288075806620:web:f87594b0d8e15c1c713a59",
  measurementId: "G-8REM1HGPCZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const Auth = getAuth(app);
export const googleProvider=new GoogleAuthProvider()
