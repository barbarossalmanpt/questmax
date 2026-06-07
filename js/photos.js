import { storage, db } from "./firebase.js";
import { getCurrentUserId } from "./auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function uploadProofPhoto(file) {
  const userId = getCurrentUserId();
  if (!userId || !file) return null;
  const storageRef = ref(storage, `proof/${userId}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  const proofRef = doc(db, "users", userId, "proofs", `${Date.now()}`);
  await setDoc(proofRef, {
    photoUrl: url,
    uploadedAt: serverTimestamp(),
    status: "pending"
  });
  return url;
}
