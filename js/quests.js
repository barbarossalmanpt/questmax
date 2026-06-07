import { auth, db } from "./firebase.js";
import { getCurrentUserId } from "./auth.js";
import { fetchSeedQuests } from "./ai.js";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function renderQuestFeed(containerId = "quest-feed") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "<p>Loading quests...</p>";
  const quests = await fetchSeedQuests();

  container.innerHTML = "";
  quests.forEach(quest => {
    const card = document.createElement("article");
    card.className = "card quest-card";
    card.innerHTML = `
      <div class="quest-badge ${quest.tier.toLowerCase()}">${quest.tier}</div>
      <h2>${quest.title}</h2>
      <p>${quest.description}</p>
      <div class="quest-meta">
        <span>${quest.xpReward} XP</span>
        <span>${quest.estimatedTime}</span>
      </div>
      <a class="button primary" href="quest.html?id=${quest.id}">View Quest</a>
    `;
    container.appendChild(card);
  });
}

export async function loadQuestDetail() {
  const params = new URLSearchParams(window.location.search);
  const questId = params.get("id");
  const titleEl = document.getElementById("quest-title");
  const descriptionEl = document.getElementById("quest-description");
  const xpEl = document.getElementById("quest-xp");
  const tierEl = document.getElementById("quest-tier");
  const requirementsEl = document.getElementById("quest-requirements");

  if (!questId || !titleEl) return;
  const quests = await fetchSeedQuests();
  const quest = quests.find(item => item.id === questId);
  if (!quest) {
    titleEl.textContent = "Quest not found";
    return;
  }

  titleEl.textContent = quest.title;
  descriptionEl.textContent = quest.description;
  xpEl.textContent = `${quest.xpReward} XP`;
  tierEl.textContent = quest.tier;
  requirementsEl.textContent = quest.requirements.join(", ");

  const claimButton = document.getElementById("claim-button");
  if (claimButton) {
    claimButton.addEventListener("click", () => claimQuest(quest));
  }
}

export async function claimQuest(quest) {
  const userId = getCurrentUserId();
  if (!userId) {
    alert("Please sign in before claiming a quest.");
    return;
  }

  const claimRef = doc(db, "users", userId, "claims", quest.id);
  await setDoc(claimRef, {
    questId: quest.id,
    title: quest.title,
    claimedAt: serverTimestamp(),
    status: "claimed",
    xpReward: quest.xpReward
  });
  alert("Quest claimed! Check your feed for updates.");
}
