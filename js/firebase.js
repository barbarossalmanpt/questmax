import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnsoo38-Fa9Eol2lZdUZyV5TeYBbZv0gU",
  authDomain: "questmax-93d80.firebaseapp.com",
  projectId: "questmax-93d80",
  storageBucket: "questmax-93d80.firebasestorage.app",
  messagingSenderId: "253391804594",
  appId: "1:253391804594:web:0d4aa6078e18f9fa9611ab"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
