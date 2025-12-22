// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAiFZo2uhb5z-G7Y2Rp3hEiRP1bMlwW3ic",
  authDomain: "bookiereserve.firebaseapp.com",
  projectId: "bookiereserve",
  storageBucket: "bookiereserve.firebasestorage.app",
  messagingSenderId: "982181516678",
  appId: "1:982181516678:web:0b4ea02bd77ffa34818807"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
export default app;
