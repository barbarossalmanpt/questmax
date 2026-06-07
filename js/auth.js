import { auth, db } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();

export function initAuthPage() {
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");

  if (loginButton) {
    loginButton.addEventListener("click", signInWithGoogle);
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", signOutUser);
  }

  onAuthStateChanged(auth, async user => {
    if (user) {
      await ensureUserDocument(user);
      if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        window.location.href = "pages/feed.html";
      }
    } else {
      if (!window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("/")) {
        window.location.href = "../index.html";
      }
    }
  });
}

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await ensureUserDocument(user);
    window.location.href = "pages/feed.html";
  } catch (error) {
    console.error("Sign in failed", error);
    alert("Unable to sign in. Please try again.");
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Sign out failed", error);
  }
}

async function ensureUserDocument(user) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "Brave Adventurer",
      email: user.email || "",
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      personalisation: {},
      groupIds: [],
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp()
    });
  } else {
    await updateDoc(userRef, {
      lastSeenAt: serverTimestamp()
    });
  }
}

export function getCurrentUserId() {
  return auth.currentUser?.uid;
}

export function getCurrentUser() {
  return auth.currentUser;
}
