import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAOL7CpmGBqMvuWyWGHFYN7e3Wm60_2dzc",
  authDomain: "beatmotion-b1ec6.firebaseapp.com",
  databaseURL: "https://beatmotion-b1ec6-default-rtdb.firebaseio.com",
  projectId: "beatmotion-b1ec6",
  storageBucket: "beatmotion-b1ec6.firebasestorage.app",
  messagingSenderId: "736000845187",
  appId: "1:736000845187:web:658bf261a3165e8b8c42b6",
  measurementId: "G-STX01S6FVQ"
};

const app = initializeApp(firebaseConfig); 
const analytics = getAnalytics(app);