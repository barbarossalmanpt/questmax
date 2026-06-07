import { db } from "./firebase.js";
import { getCurrentUserId } from "./auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function sendNotification(type, message) {
  const userId = getCurrentUserId();
  if (!userId) return;
  await addDoc(collection(db, "users", userId, "notifications"), {
    type,
    message,
    read: false,
    createdAt: serverTimestamp()
  });
}
