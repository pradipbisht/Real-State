// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJd2XK8D3Aw3Vgs837972XvRSlg64WsUA",
  authDomain: "real-state-ce828.firebaseapp.com",
  projectId: "real-state-ce828",
  storageBucket: "real-state-ce828.appspot.com",
  messagingSenderId: "371860614742",
  appId: "1:371860614742:web:0829026acc98641481d5f7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
