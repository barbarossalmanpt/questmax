import { auth, db } from "./firebase.js";
import { getCurrentUserId } from "./auth.js";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

function generateGroupCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createGroup(name) {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const groupData = {
    name: name || "Quest Party",
    code: generateGroupCode(),
    adminId: userId,
    members: [userId],
    pendingRequests: [],
    createdAt: serverTimestamp()
  };

  const groupRef = await addDoc(collection(db, "groups"), groupData);
  await updateDoc(doc(db, "users", userId), {
    groupIds: [groupRef.id]
  });
  return { id: groupRef.id, ...groupData };
}

export async function requestJoinGroup(code) {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const groupsQuery = query(collection(db, "groups"), where("code", "==", code));
  const snapshot = await getDocs(groupsQuery);
  if (snapshot.empty) {
    return false;
  }

  const groupDoc = snapshot.docs[0];
  const group = groupDoc.data();
  if (group.members?.includes(userId) || group.pendingRequests?.includes(userId)) {
    return true;
  }

  await updateDoc(groupDoc.ref, {
    pendingRequests: [...(group.pendingRequests || []), userId]
  });
  return true;
}

export async function getGroupById(groupId) {
  const groupRef = doc(db, "groups", groupId);
  const snapshot = await getDoc(groupRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
