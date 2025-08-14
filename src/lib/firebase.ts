// @/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "profe-udp-connect",
  appId: "1:385500074412:web:89271e8fec47225f4b2a09",
  storageBucket: "profe-udp-connect.firebasestorage.app",
  apiKey: "AIzaSyCzSFSmqwZfpo9UprwIv8zBKxJYJDSna98",
  authDomain: "profe-udp-connect.firebaseapp.com",
  messagingSenderId: "385500074412",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
