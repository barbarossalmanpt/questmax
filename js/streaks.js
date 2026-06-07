import { db } from "./firebase.js";
import { getCurrentUserId } from "./auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function refreshStreak() {
  const userId = getCurrentUserId();
  if (!userId) return;

  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return;

  const user = snapshot.data();
  const lastClaim = user.lastQuestCompletedAt?.toDate?.();
  const today = new Date();
  if (!lastClaim) return;

  const diffDays = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) {
    await updateDoc(userRef, {
      streak: (user.streak || 0) + 1,
      lastChecked: serverTimestamp()
    });
  }
}
