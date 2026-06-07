import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function renderLeaderboard(containerId = "leaderboard-card") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "<p>Loading leaderboard…</p>";
  const usersQuery = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
  const snapshot = await getDocs(usersQuery);

  const list = document.createElement("div");
  list.className = "leaderboard-list";
  let position = 1;
  snapshot.forEach(userDoc => {
    const user = userDoc.data();
    const item = document.createElement("div");
    item.className = "leaderboard-item";
    item.innerHTML = `<strong>#${position}</strong> ${user.displayName || 'Player'} — ${user.xp || 0} XP`;
    list.appendChild(item);
    position += 1;
  });

  container.innerHTML = "";
  if (list.children.length === 0) {
    container.innerHTML = "<p>No leaderboard data yet.</p>";
  } else {
    container.appendChild(list);
  }
}
