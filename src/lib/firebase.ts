// lib/firebase.ts
// Inisialisasi Firebase Client SDK untuk dipakai di browser (baca data Firestore)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const getEnv = (viteKey: string, fallbackKey: string): string => {
  const env = (import.meta as any).env || {};
  return (env[viteKey] || env[fallbackKey] || "").trim();
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// Pastikan tidak inisialisasi Firebase lebih dari sekali
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Ekspor Firestore database instance
export const db = getFirestore(app);
