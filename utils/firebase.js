// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rezzai-b31b2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rezzai-b31b2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rezzai-b31b2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "288075806620",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:288075806620:web:f87594b0d8e15c1c713a59",
  measurementId: "G-8REM1HGPCZ"
};

// Initialize Firebase safely
let app;
let Auth;
let googleProvider;

try {
  if (apiKey) {
    app = initializeApp(firebaseConfig);
    Auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn("Firebase API key is missing. Please set VITE_FIREBASE_API_KEY.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { Auth, googleProvider };
