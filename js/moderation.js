import { db } from "./firebase.js";
import { getCurrentUserId } from "./auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function submitReport(targetId, reason) {
  const userId = getCurrentUserId();
  if (!userId) return false;
  await addDoc(collection(db, "reports"), {
    reporterId: userId,
    targetId,
    reason,
    status: "pending",
    createdAt: serverTimestamp()
  });
  return true;
}
