import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

async function loadFirebaseConfig() {
  try {
    return (await import("./firebaseConfig.js")).default;
  } catch (error) {
    console.warn("No local js/firebaseConfig.js found. Falling back to example placeholder config.");
    return (await import("./firebaseConfig.example.js")).default;
  }
}

const firebaseConfig = await loadFirebaseConfig();
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
