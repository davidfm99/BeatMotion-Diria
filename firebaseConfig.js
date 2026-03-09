import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra;

const firebaseConfig = {
  apiKey: extra?.firebase?.apiKey,
  authDomain: extra?.firebase?.authDomain,
  databaseURL: "https://beatmotion-b1ec6-default-rtdb.firebaseio.com",
  projectId: extra?.firebase?.projectId,
  storageBucket: extra?.firebase?.storageBucket,
  messagingSenderId: extra?.firebase?.messagingSenderId,
  appId: extra?.firebase?.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
