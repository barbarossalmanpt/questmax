import { getCurrentUserId } from "./auth.js";

export async function fetchSeedQuests() {
  const response = await fetch("../data/seed-quests.json");
  return await response.json();
}

export async function generateQuests(profile, tier) {
  if (window.DEMO_MODE === true || new URLSearchParams(window.location.search).get("demo") === "true") {
    const quests = await fetchSeedQuests();
    return quests.filter(q => q.tier === tier).slice(0, 5);
  }

  const userId = getCurrentUserId();
  if (!userId) {
    return fetchSeedQuests();
  }

  try {
    const functionUrl = "/.netlify/functions/generateQuest";
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, profile, tier })
    });
    if (!response.ok) {
      throw new Error("Quest generation service unavailable");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Falling back to seed quests", error);
    const quests = await fetchSeedQuests();
    return quests.filter(q => q.tier === tier).slice(0, 5);
  }
}
