/**
 * @fileoverview Firebase SDK Connection & Service Initialization.
 * Exposes singleton instances for Cloud Firestore and Firebase Authentication.
 * Following Clean Code principles, configuration values are isolated in environment variables.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Firebase project credentials loaded from environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

/** Exported Firestore Database Singleton */
export const db = getFirestore(app);

/** Exported Firebase Authentication Singleton */
export const auth = getAuth(app);