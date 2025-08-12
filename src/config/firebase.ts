import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9fW-wyvGISBLzwlJwYcW9oS7x7F3DZYQ",
  authDomain: "ajnabicam---random-video-chat.firebaseapp.com",
  projectId: "ajnabicam---random-video-chat",
  storageBucket: "ajnabicam---random-video-chat.firebasestorage.app",
  messagingSenderId: "820384668482",
  appId: "1:820384668482:web:57fb3a2923c0b00807c6db",
  measurementId: "G-GR8E4KWNEY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional - only in production)
let analytics;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;