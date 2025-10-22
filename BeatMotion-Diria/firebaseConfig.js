import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOL7CpmGBqMvuWyWGHFYN7e3Wm60_2dzc",
  authDomain: "beatmotion-b1ec6.firebaseapp.com",
  databaseURL: "https://beatmotion-b1ec6-default-rtdb.firebaseio.com",
  projectId: "beatmotion-b1ec6",
  storageBucket: "beatmotion-b1ec6.firebasestorage.app",
  messagingSenderId: "736000845187",
  appId: "1:736000845187:web:658bf261a3165e8b8c42b6",
  measurementId: "G-STX01S6FVQ",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
