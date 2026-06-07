import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

const APP = initializeApp(firebaseConfig);
const AUTH = getAuth(APP);
const DB = getFirestore(APP);
const PROVIDER = new GoogleAuthProvider();
const WALLET_KEY = "user_character_profile";
const STATE_KEY = "summer_side_quests_state";
const FIRESTORE_ENABLED = true;

const MASTER_QUESTS = [
  {
    id: "bronze-cannonball",
    title: "Do a cannonball",
    description: "Find a safe pool or lake and launch the biggest cannonball splash you can.",
    tier: "Bronze",
    xp: 10,
    category: "Sports",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "Wild Frontier",
    gear: [],
    prereqs: []
  },
  {
    id: "bronze-art-altar",
    title: "Build a tiny altar",
    description: "Craft a little tabletop shrine from found objects and explain its story.",
    tier: "Bronze",
    xp: 10,
    category: "Creative",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Grand Citadel",
    gear: [],
    prereqs: []
  },
  {
    id: "bronze-bard-solo",
    title: "Street song challenge",
    description: "Perform a short song or chant in public and capture the crowd reaction.",
    tier: "Bronze",
    xp: 10,
    category: "Music",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Grand Citadel",
    gear: ["microphone"],
    prereqs: []
  },
  {
    id: "bronze-scout-scavenger",
    title: "Scavenger sprint",
    description: "Collect five natural items from the park that match hidden clues.",
    tier: "Bronze",
    xp: 10,
    category: "Outdoors",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Wild Frontier",
    gear: [],
    prereqs: []
  },
  {
    id: "bronze-tech-quest",
    title: "Retro game tutorial",
    description: "Teach someone how to play a classic pixel game and capture their first win.",
    tier: "Bronze",
    xp: 10,
    category: "Tech",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Shires",
    gear: ["gaming"],
    prereqs: []
  },
  {
    id: "silver-shoreline-run",
    title: "Shoreline sprint relay",
    description: "Run a quick relay along a waterfront path with a friend and time your best lap.",
    tier: "Silver",
    xp: 25,
    category: "Sports",
    cost: "free",
    intensity: "Medium",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["bronze-cannonball"]
  },
  {
    id: "silver-market-bard",
    title: "Market music duel",
    description: "Write a short song about the marketplace and share it with three strangers.",
    tier: "Silver",
    xp: 25,
    category: "Music",
    cost: "free",
    intensity: "Medium",
    groupRequired: false,
    location: "The Grand Citadel",
    gear: [],
    prereqs: ["bronze-bard-solo"]
  },
  {
    id: "silver-cottage-cookoff",
    title: "Cottage cook-off",
    description: "Prepare a small picnic snack using only local ingredients and a secret twist.",
    tier: "Silver",
    xp: 25,
    category: "Creative",
    cost: "low",
    intensity: "Medium",
    groupRequired: true,
    location: "The Shires",
    gear: [],
    prereqs: ["bronze-art-altar"]
  },
  {
    id: "silver-boulder-climb",
    title: "Boulder climb challenge",
    description: "Complete a short climbing route in under 15 minutes with a friend cheering.",
    tier: "Silver",
    xp: 25,
    category: "Outdoors",
    cost: "free",
    intensity: "Medium",
    groupRequired: false,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["bronze-scout-scavenger"]
  },
  {
    id: "silver-lan-legend",
    title: "LAN party puzzle",
    description: "Host a mini gaming challenge and help a teammate complete a mystery level.",
    tier: "Silver",
    xp: 25,
    category: "Tech",
    cost: "low",
    intensity: "Medium",
    groupRequired: true,
    location: "The Shires",
    gear: ["gaming"],
    prereqs: ["bronze-tech-quest"]
  },
  {
    id: "gold-flamingo-float",
    title: "Unicorn Inflatable Swim Race",
    description: "Organize a playful float race on a pool or lake using inflatable toys.",
    tier: "Gold",
    xp: 50,
    category: "Sports",
    cost: "low",
    intensity: "Medium",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["pool"],
    prereqs: ["silver-shoreline-run"]
  },
  {
    id: "gold-bard-battle",
    title: "Bardic storytelling showdown",
    description: "Create a dramatic tale with a musical twist and perform it for a small crowd.",
    tier: "Gold",
    xp: 50,
    category: "Music",
    cost: "free",
    intensity: "Medium",
    groupRequired: true,
    location: "The Grand Citadel",
    gear: [],
    prereqs: ["silver-market-bard"]
  },
  {
    id: "gold-art-spray",
    title: "Graffiti treasure map",
    description: "Design a small chalk treasure map and lead a friend to the secret reward.",
    tier: "Gold",
    xp: 50,
    category: "Creative",
    cost: "low",
    intensity: "Medium",
    groupRequired: false,
    location: "The Shires",
    gear: [],
    prereqs: ["silver-cottage-cookoff"]
  },
  {
    id: "gold-forest-raid",
    title: "Forest compass raid",
    description: "Complete a short navigation challenge with a map and time yourself under 60 minutes.",
    tier: "Gold",
    xp: 50,
    category: "Outdoors",
    cost: "free",
    intensity: "High",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["silver-boulder-climb"]
  },
  {
    id: "gold-code-quest",
    title: "Retro coding treasure",
    description: "Solve a puzzle or build a tiny script that unlocks a secret reward for your team.",
    tier: "Gold",
    xp: 50,
    category: "Tech",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Shires",
    gear: ["gaming"],
    prereqs: ["silver-lan-legend"]
  },
  {
    id: "platinum-lake-legend",
    title: "Night Sky Campfire",
    description: "Plan a safe evening campfire with story prompts, marshmallows, and a stargazing challenge.",
    tier: "Platinum",
    xp: 100,
    category: "Outdoors",
    cost: "low",
    intensity: "High",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["pool"],
    prereqs: ["gold-forest-raid"]
  },
  {
    id: "platinum-arcade-odyssey",
    title: "Arcade gauntlet",
    description: "Beat five retro mini-games in one session while your team logs every win.",
    tier: "Platinum",
    xp: 100,
    category: "Tech",
    cost: "paid",
    intensity: "Medium",
    groupRequired: true,
    location: "The Grand Citadel",
    gear: ["gaming"],
    prereqs: ["gold-code-quest"]
  },
  {
    id: "platinum-sculpture-quest",
    title: "Epic mural launch",
    description: "Create a bold community mural or tabletop sculpture with friends and reveal it to the group.",
    tier: "Platinum",
    xp: 100,
    category: "Creative",
    cost: "paid",
    intensity: "Medium",
    groupRequired: true,
    location: "The Shires",
    gear: [],
    prereqs: ["gold-art-spray"]
  },
  {
    id: "platinum-royal-run",
    title: "King’s road race",
    description: "Run a long loop or bike route and keep your average pace consistent for the whole distance.",
    tier: "Platinum",
    xp: 100,
    category: "Sports",
    cost: "free",
    intensity: "High",
    groupRequired: false,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["gold-flamingo-float"]
  },
  {
    id: "diamond-1",
    title: "Legendary Challenge Run",
    description: "Build a custom adventure obstacle course and finish it with a group photo at the final trophy spot.",
    tier: "Diamond",
    xp: 250,
    category: "Sports",
    cost: "paid",
    intensity: "Extreme",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["platinum-royal-run", "platinum-lake-legend"]
  },
  {
    id: "diamond-2",
    title: "Dragon’s bardic quest",
    description: "Lead your guild through an epic performance event where every line is improvised live.",
    tier: "Diamond",
    xp: 250,
    category: "Music",
    cost: "low",
    intensity: "High",
    groupRequired: true,
    location: "The Grand Citadel",
    gear: [],
    prereqs: ["platinum-arcade-odyssey"]
  },
  {
    id: "diamond-3",
    title: "Alchemy maker fair",
    description: "Develop a creative system or gadget that solves a summer challenge and document it.",
    tier: "Diamond",
    xp: 250,
    category: "Creative",
    cost: "paid",
    intensity: "High",
    groupRequired: false,
    location: "The Shires",
    gear: ["gaming"],
    prereqs: ["platinum-sculpture-quest"]
  },
  {
    id: "diamond-4",
    title: "Frontier endurance quest",
    description: "Complete a long outdoor endurance challenge and log your progress with snapshots.",
    tier: "Diamond",
    xp: 250,
    category: "Outdoors",
    cost: "free",
    intensity: "Extreme",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["platinum-royal-run"]
  },
  {
    id: "silver-picnic-poem",
    title: "Poem in the park",
    description: "Write a short poem about summer and read it aloud with a friend nearby.",
    tier: "Silver",
    xp: 25,
    category: "Creative",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Shires",
    gear: [],
    prereqs: ["bronze-art-altar"]
  },
  {
    id: "gold-coffee-quest",
    title: "Secret menu creation",
    description: "Invent a themed summer snack or drink and share the recipe with someone new.",
    tier: "Gold",
    xp: 50,
    category: "Creative",
    cost: "low",
    intensity: "Low",
    groupRequired: false,
    location: "The Grand Citadel",
    gear: [],
    prereqs: ["silver-cottage-cookoff"]
  },
  {
    id: "bronze-bike-capade",
    title: "Neighborhood bike caper",
    description: "Map a short bike route and ride it at a fun pace with a friend.",
    tier: "Bronze",
    xp: 10,
    category: "Sports",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Shires",
    gear: ["bike"],
    prereqs: []
  },
  {
    id: "gold-surf-splash",
    title: "Surf and snap",
    description: "Catch or ride your favorite water move and capture the moment with a photo.",
    tier: "Gold",
    xp: 50,
    category: "Outdoors",
    cost: "low",
    intensity: "Medium",
    groupRequired: false,
    location: "The Wild Frontier",
    gear: ["pool"],
    prereqs: ["silver-shoreline-run"]
  },
  {
    id: "platinum-saga-screenplay",
    title: "Guild saga script",
    description: "Write a short comic scene for your team and perform it in character.",
    tier: "Platinum",
    xp: 100,
    category: "Creative",
    cost: "free",
    intensity: "Medium",
    groupRequired: true,
    location: "The Grand Citadel",
    gear: [],
    prereqs: ["gold-bard-battle"]
  },
  {
    id: "diamond-hunter",
    title: "Dragon hunter expedition",
    description: "Complete a multi-day challenge with a checklist of daring summer tasks.",
    tier: "Diamond",
    xp: 250,
    category: "Outdoors",
    cost: "paid",
    intensity: "Extreme",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["bike"],
    prereqs: ["platinum-lake-legend", "platinum-royal-run"]
  }
];

const DUMMY_USERS = [
  { uid: "npc-auri", displayName: "Auri the Scout", xp: 360, streak: 4, maxStreak: 6, role: "member" },
  { uid: "npc-lance", displayName: "Lance the Bard", xp: 220, streak: 2, maxStreak: 3, role: "member" },
  { uid: "npc-mira", displayName: "Mira the Alchemist", xp: 480, streak: 7, maxStreak: 8, role: "member" },
  { uid: "npc-kiv", displayName: "Kiv the Gladiator", xp: 125, streak: 1, maxStreak: 2, role: "member" },
  { uid: "npc-lyn", displayName: "Lyn the Artisan", xp: 310, streak: 3, maxStreak: 5, role: "member" }
];

const state = {
  user: null,
  profile: null,
  xp: 0,
  streak: 0,
  maxStreak: 0,
  completedQuestIds: [],
  activeQuests: [],
  group: null,
  groupFeed: [],
  groupRequests: [],
  suggestedQuests: [],
  reports: [],
  reactions: [],
  dailyQuest: null,
  bossQuest: null,
  isAdmin: false,
  bannedUntil: null,
  firestoreReady: false,
  view: "feed"
};

const elements = {
  loginShell: document.getElementById("login-shell"),
  appShell: document.getElementById("app-shell"),
  loginButton: document.getElementById("login-button"),
  logoutButton: document.getElementById("logout-button"),
  onboardingModal: document.getElementById("onboarding-modal"),
  wizardStep: document.getElementById("wizard-step"),
  backStep: document.getElementById("back-step"),
  nextStep: document.getElementById("next-step"),
  overlay: document.getElementById("overlay"),
  overlayContent: document.getElementById("overlay-content"),
  navButtons: Array.from(document.querySelectorAll(".nav-button")),
  adminNavButton: document.getElementById("admin-nav-button"),
  pageTitle: document.getElementById("page-title"),
  toast: document.getElementById("toast"),
  dailyQuest: document.getElementById("daily-quest"),
  questList: document.getElementById("quest-list"),
  acceptedQuests: document.getElementById("accepted-quests"),
  bossQuest: document.getElementById("boss-quest"),
  groupStatus: document.getElementById("group-status"),
  groupFeed: document.getElementById("group-feed"),
  profileSheet: document.getElementById("profile-sheet"),
  badgeList: document.getElementById("badge-list"),
  adminControls: document.getElementById("admin-controls")
};

const wizardSteps = [
  "party",
  "attribute",
  "hobbies",
  "realm",
  "inventory"
];
let currentStep = 0;
let wizardDraft = {
  partyMode: "Solo",
  attribute: "Beginner",
  hobbies: [],
  realm: "The Grand Citadel",
  budget: "free",
  gear: []
};

const QUEST_TIER_COLORS = {
  Bronze: "rgba(205,127,50,0.15)",
  Silver: "rgba(192,192,192,0.18)",
  Gold: "rgba(255,215,0,0.2)",
  Platinum: "rgba(161,238,255,0.18)",
  Diamond: "rgba(185,242,255,0.25)"
};

const NEXT_LEVEL = xp => Math.floor(Math.sqrt(xp / 100)) + 1;
const LEVEL_EXPERIENCE = level => (level - 1) * (level - 1) * 100;

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 3200);
}

function showLogin() {
  elements.appShell.classList.add("hidden");
  elements.loginShell.classList.remove("hidden");
}

function showApp() {
  elements.loginShell.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
}

function switchView(view) {
  state.view = view;
  elements.navButtons.forEach(btn => {
    btn.classList.toggle("active-nav", btn.dataset.view === view);
  });
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active-screen", screen.id === `${view}-screen`);
  });
  elements.pageTitle.textContent = view === "feed" ? "Feed" : view === "board" ? "Quest Board" : view === "groups" ? "Groups" : view === "profile" ? "Profile" : "Admin";
  renderApp();
}

function loadLocalProfile() {
  try {
    const saved = localStorage.getItem(WALLET_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function loadLocalState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function saveLocalProfile(profile) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(profile));
}

function saveLocalState() {
  localStorage.setItem(STATE_KEY, JSON.stringify({
    profile: state.profile,
    xp: state.xp,
    streak: state.streak,
    maxStreak: state.maxStreak,
    completedQuestIds: state.completedQuestIds,
    activeQuests: state.activeQuests,
    group: state.group,
    groupFeed: state.groupFeed,
    groupRequests: state.groupRequests,
    suggestedQuests: state.suggestedQuests,
    reports: state.reports,
    reactions: state.reactions,
    dailyQuest: state.dailyQuest,
    bossQuest: state.bossQuest,
    bannedUntil: state.bannedUntil,
    isAdmin: state.isAdmin
  }));
}

async function writeFirestoreUser(docData) {
  if (!state.user || !FIRESTORE_ENABLED) return;
  try {
    const userRef = doc(DB, "users", state.user.uid);
    await setDoc(userRef, docData, { merge: true });
    state.firestoreReady = true;
  } catch (error) {
    console.warn("Firestore write failed", error);
    state.firestoreReady = false;
  }
}

async function loadFirestoreUser() {
  if (!state.user || !FIRESTORE_ENABLED) return null;
  try {
    const userRef = doc(DB, "users", state.user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      return null;
    }
    state.firestoreReady = true;
    return snapshot.data();
  } catch (error) {
    console.warn("Firestore read failed", error);
    state.firestoreReady = false;
    return null;
  }
}

function getDailyQuest() {
  const today = new Date();
  const index = (today.getDate() + today.getMonth() * 3) % MASTER_QUESTS.length;
  return MASTER_QUESTS[index];
}

function getBossQuestTemplate() {
  return {
    title: "Guild Biking Champion",
    description: "Collectively log 100 miles of biking this week or suffer a group XP penalty.",
    totalGoal: 100,
    progress: state.group ? state.group.progress || 0 : 0,
    penalty: 50,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
}

function buildProfile(profileData) {
  return {
    partyMode: profileData.partyMode || "Solo",
    attribute: profileData.attribute || "Beginner",
    hobbies: profileData.hobbies || [],
    realm: profileData.realm || "The Grand Citadel",
    budget: profileData.budget || "free",
    gear: profileData.gear || []
  };
}

function mergeState(saved) {
  if (!saved) return;
  state.profile = saved.profile || state.profile;
  state.xp = saved.xp || state.xp;
  state.streak = saved.streak || state.streak;
  state.maxStreak = saved.maxStreak || state.maxStreak;
  state.completedQuestIds = saved.completedQuestIds || state.completedQuestIds;
  state.activeQuests = saved.activeQuests || state.activeQuests;
  state.group = saved.group || state.group;
  state.groupFeed = saved.groupFeed || state.groupFeed;
  state.groupRequests = saved.groupRequests || state.groupRequests;
  state.suggestedQuests = saved.suggestedQuests || state.suggestedQuests;
  state.reports = saved.reports || state.reports;
  state.reactions = saved.reactions || state.reactions;
  state.dailyQuest = saved.dailyQuest || state.dailyQuest;
  state.bossQuest = saved.bossQuest || state.bossQuest;
  state.bannedUntil = saved.bannedUntil || state.bannedUntil;
  state.isAdmin = saved.isAdmin || state.isAdmin;
}

async function loadUser() {
  const localProfile = loadLocalProfile();
  if (localProfile) {
    state.profile = buildProfile(localProfile);
  }
  const localState = loadLocalState();
  mergeState(localState);

  if (state.user) {
    const remote = await loadFirestoreUser();
    if (remote) {
      mergeState(remote);
      if (remote.profile) {
        state.profile = buildProfile(remote.profile);
      }
      state.xp = remote.xp ?? state.xp;
      state.streak = remote.streak ?? state.streak;
      state.maxStreak = remote.maxStreak ?? state.maxStreak;
      state.completedQuestIds = remote.completedQuestIds || state.completedQuestIds;
      state.activeQuests = remote.activeQuests || state.activeQuests;
      state.group = remote.group || state.group;
      state.groupFeed = remote.groupFeed || state.groupFeed;
      state.groupRequests = remote.groupRequests || state.groupRequests;
      state.suggestedQuests = remote.suggestedQuests || state.suggestedQuests;
      state.reports = remote.reports || state.reports;
      state.reactions = remote.reactions || state.reactions;
      state.dailyQuest = remote.dailyQuest || state.dailyQuest;
      state.bossQuest = remote.bossQuest || state.bossQuest;
      state.bannedUntil = remote.bannedUntil || state.bannedUntil;
      state.isAdmin = remote.isAdmin || state.isAdmin;
    }
  }

  if (!state.dailyQuest) {
    state.dailyQuest = getDailyQuest();
  }

  if (!state.bossQuest) {
    state.bossQuest = getBossQuestTemplate();
  }

  saveLocalProfile(state.profile || {});
  saveLocalState();
}

function getEligibleQuests() {
  if (!state.profile) return [];

  return MASTER_QUESTS.map(quest => {
    const locked = quest.prereqs.some(id => !state.completedQuestIds.includes(id));
    return { ...quest, locked };
  }).filter(quest => {
    if (state.profile.budget === "free" && quest.cost === "paid") {
      return false;
    }
    if (state.profile.attribute === "Beginner" && quest.intensity === "Extreme") {
      return false;
    }
    if (state.profile.partyMode === "Solo" && quest.groupRequired) {
      return false;
    }
    if (state.profile.realm === "The Wild Frontier" && quest.location === "The Grand Citadel") {
      return false;
    }
    if (state.profile.realm === "The Grand Citadel" && quest.location === "The Wild Frontier") {
      return true;
    }
    if (quest.gear.includes("pool") && !state.profile.gear.includes("pool")) {
      return false;
    }
    if (quest.gear.includes("bike") && !state.profile.gear.includes("bike")) {
      return false;
    }
    if (quest.gear.includes("gaming") && !state.profile.gear.includes("gaming")) {
      return false;
    }
    return true;
  });
}

function formatCountdown(timestamp) {
  if (!timestamp) return "00:00:00";
  const diff = Math.max(0, timestamp - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${days ? `${days}d ` : ""}${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function getQuestDuration(tier) {
  switch (tier) {
    case "Bronze": return 24 * 60 * 60 * 1000;
    case "Silver": return 48 * 60 * 60 * 1000;
    case "Gold": return 72 * 60 * 60 * 1000;
    case "Platinum": return 120 * 60 * 60 * 1000;
    case "Diamond": return 168 * 60 * 60 * 1000;
    default: return 48 * 60 * 60 * 1000;
  }
}

function getQuestStyle(tier) {
  return QUEST_TIER_COLORS[tier] || "rgba(255,255,255,0.05)";
}

function saveAndSync() {
  saveLocalProfile(state.profile || {});
  saveLocalState();
  if (state.user) {
    writeFirestoreUser({
      profile: state.profile,
      xp: state.xp,
      streak: state.streak,
      maxStreak: state.maxStreak,
      completedQuestIds: state.completedQuestIds,
      activeQuests: state.activeQuests,
      group: state.group,
      groupFeed: state.groupFeed,
      groupRequests: state.groupRequests,
      suggestedQuests: state.suggestedQuests,
      reports: state.reports,
      reactions: state.reactions,
      dailyQuest: state.dailyQuest,
      bossQuest: state.bossQuest,
      bannedUntil: state.bannedUntil,
      isAdmin: state.isAdmin,
      lastUpdated: serverTimestamp()
    });
  }
}

function completeQuest(acceptedQuest, proof) {
  state.completedQuestIds.push(acceptedQuest.id);
  state.activeQuests = state.activeQuests.filter(quest => quest.id !== acceptedQuest.id);
  state.xp += acceptedQuest.xp;
  if (state.xp < 0) state.xp = 0;
  const level = NEXT_LEVEL(state.xp);
  if (level > NEXT_LEVEL(state.xp - acceptedQuest.xp)) {
    showToast(`LEVEL UP! You are now level ${level}`);
  }
  state.groupFeed.unshift({
    id: `proof-${Date.now()}`,
    userId: state.user.uid,
    displayName: state.user.displayName,
    questId: acceptedQuest.id,
    title: acceptedQuest.title,
    image: proof,
    time: Date.now(),
    reports: [],
    reactions: {}
  });
  updateBossProgress(acceptedQuest);
  saveAndSync();
  showToast(`Quest complete! +${acceptedQuest.xp} XP`);
}

function updateBossProgress(acceptedQuest) {
  if (!state.group) return;
  const increment = acceptedQuest.tier === "Diamond" ? 12 : acceptedQuest.tier === "Platinum" ? 8 : acceptedQuest.tier === "Gold" ? 6 : acceptedQuest.tier === "Silver" ? 4 : 2;
  state.group.progress = (state.group.progress || 0) + increment;
  state.bossQuest.progress = state.group.progress;
  if (state.group.progress >= state.bossQuest.totalGoal) {
    state.group.progress = state.bossQuest.totalGoal;
    showToast("Boss quest completed! Guild XP bonus awarded.");
  }
}

function failExpiredQuests() {
  const now = Date.now();
  const expired = state.activeQuests.filter(quest => quest.expiresAt <= now);
  if (expired.length > 0) {
    expired.forEach(quest => {
      showToast(`Quest failed: ${quest.title}`);
    });
    state.activeQuests = state.activeQuests.filter(quest => quest.expiresAt > now);
    saveAndSync();
  }
}

function renderDailyQuest() {
  if (!state.dailyQuest) return;
  const expiration = getEndOfDay(Date.now());
  elements.dailyQuest.innerHTML = "";
  const card = document.createElement("div");
  card.className = "daily-quest-card";
  card.style.borderColor = getQuestStyle(state.dailyQuest.tier);
  card.innerHTML = `
    <h3>${state.dailyQuest.title}</h3>
    <p>${state.dailyQuest.description}</p>
    <div class="stat-row">
      <span>${state.dailyQuest.tier}</span>
      <span>${state.dailyQuest.xp} XP</span>
    </div>
    <p>Expires in ${formatCountdown(expiration)}</p>
  `;
  elements.dailyQuest.appendChild(card);
}

function getEndOfDay(timestamp) {
  const day = new Date(timestamp);
  day.setHours(24, 0, 0, 0);
  return day.getTime();
}

function renderQuestList() {
  elements.questList.innerHTML = "";
  const quests = getEligibleQuests();
  if (quests.length === 0) {
    elements.questList.innerHTML = `<div class="quest-card"><p>No quests match your profile yet.</p></div>`;
    return;
  }
  quests.forEach(quest => {
    const card = document.createElement("div");
    card.className = "quest-card";
    card.style.background = getQuestStyle(quest.tier);
    card.innerHTML = `
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <div class="stat-row">
        <span>${quest.tier}</span>
        <span>${quest.xp} XP</span>
      </div>
      <div class="quest-actions"></div>
    `;
    const actions = card.querySelector(".quest-actions");
    const acceptButton = document.createElement("button");
    acceptButton.textContent = quest.locked ? "Locked" : "Accept Quest";
    acceptButton.className = "action-button primary";
    acceptButton.disabled = quest.locked || state.bannedUntil > Date.now();
    acceptButton.addEventListener("click", () => acceptQuest(quest));
    actions.appendChild(acceptButton);
    if (quest.locked) {
      const hint = document.createElement("p");
      hint.style.color = "var(--text-muted)";
      hint.textContent = "Complete prerequisites first.";
      card.appendChild(hint);
    }
    elements.questList.appendChild(card);
  });
}

function acceptQuest(quest) {
  if (quest.locked) {
    showToast("Quest is locked until prerequisites are complete.");
    return;
  }
  if (state.bannedUntil && state.bannedUntil > Date.now()) {
    showToast("You are temporarily banned from claiming quests.");
    return;
  }
  if (state.activeQuests.some(item => item.id === quest.id)) {
    showToast("Quest already accepted.");
    return;
  }
  const expiresAt = Date.now() + getQuestDuration(quest.tier);
  state.activeQuests.push({ ...quest, expiresAt, acceptedAt: Date.now() });
  saveAndSync();
  showToast(`Quest accepted: ${quest.title}`);
  renderApp();
}

function renderAcceptedQuests() {
  elements.acceptedQuests.innerHTML = "";
  failExpiredQuests();
  if (state.activeQuests.length === 0) {
    elements.acceptedQuests.innerHTML = `<div class="quest-card"><p>No active quests. Accept one from the Quest Board.</p></div>`;
    return;
  }
  state.activeQuests.forEach(quest => {
    const remaining = formatCountdown(quest.expiresAt);
    const card = document.createElement("div");
    card.className = "quest-card";
    card.style.background = getQuestStyle(quest.tier);
    card.innerHTML = `
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <div class="stat-row">
        <span>${quest.tier}</span>
        <span>${quest.xp} XP</span>
      </div>
      <p>Time left: ${remaining}</p>
      <div class="quest-actions"></div>
    `;
    const actions = card.querySelector(".quest-actions");
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.addEventListener("change", e => handleProofUpload(e, quest.id));
    actions.appendChild(uploadInput);
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Abandon";
    cancelButton.className = "action-button secondary";
    cancelButton.addEventListener("click", () => {
      state.activeQuests = state.activeQuests.filter(item => item.id !== quest.id);
      saveAndSync();
      renderApp();
    });
    actions.appendChild(cancelButton);
    elements.acceptedQuests.appendChild(card);
  });
}

function handleProofUpload(event, questId) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const acceptedQuest = state.activeQuests.find(item => item.id === questId);
    if (!acceptedQuest) {
      showToast("Accepted quest not found.");
      return;
    }
    completeQuest(acceptedQuest, reader.result);
    renderApp();
  };
  reader.readAsDataURL(file);
}

function renderBossQuest() {
  const boss = state.bossQuest;
  if (!boss) return;
  elements.bossQuest.innerHTML = "";
  const progress = Math.min(boss.progress, boss.totalGoal);
  const percent = Math.round((progress / boss.totalGoal) * 100);
  const card = document.createElement("div");
  card.className = "boss-card";
  card.innerHTML = `
    <h3>${boss.title}</h3>
    <p>${boss.description}</p>
    <div class="progress-info">
      <span>${progress}/${boss.totalGoal} miles</span>
      <span>${percent}%</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
    <p>Penalty on fail: -${boss.penalty} XP</p>
  `;
  elements.bossQuest.appendChild(card);
}

function renderGroupScreen() {
  elements.groupStatus.innerHTML = "";
  if (!state.group) {
    const card = document.createElement("div");
    card.className = "group-card";
    card.innerHTML = `
      <h3>No Guild Joined</h3>
      <p>Create a guild or join one using a code to unlock group quests.</p>
    `;
    elements.groupStatus.appendChild(card);
    return;
  }
  const members = state.group.members || [];
  const card = document.createElement("div");
  card.className = "group-card";
  card.innerHTML = `
    <h3>${state.group.name}</h3>
    <p>Code: ${state.group.code}</p>
    <p>Members: ${members.length}</p>
  `;
  if (state.isAdmin) {
    const approveButton = document.createElement("button");
    approveButton.className = "action-button primary";
    approveButton.textContent = "Review Join Requests";
    approveButton.addEventListener("click", () => openRequestReview());
    card.appendChild(approveButton);
  }
  elements.groupStatus.appendChild(card);
}

function openRequestReview() {
  const requests = state.groupRequests || [];
  elements.overlay.classList.remove("hidden");
  elements.overlayContent.innerHTML = `
    <h3>Join Requests</h3>
    <div class="button-grid"></div>
    <button id="close-overlay" class="action-button secondary">Close</button>
  `;
  const grid = elements.overlayContent.querySelector(".button-grid");
  if (requests.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No pending requests.";
    elements.overlayContent.insertBefore(empty, grid);
  }
  requests.forEach(request => {
    const row = document.createElement("div");
    row.className = "group-card";
    row.innerHTML = `<p>${request.displayName} wants to join.</p>`;
    const allowButton = document.createElement("button");
    allowButton.className = "action-button primary";
    allowButton.textContent = "Approve";
    allowButton.addEventListener("click", () => {
      state.group.members.push(request);
      state.groupRequests = state.groupRequests.filter(item => item.uid !== request.uid);
      saveAndSync();
      openRequestReview();
    });
    const denyButton = document.createElement("button");
    denyButton.className = "action-button danger";
    denyButton.textContent = "Deny";
    denyButton.addEventListener("click", () => {
      state.groupRequests = state.groupRequests.filter(item => item.uid !== request.uid);
      saveAndSync();
      openRequestReview();
    });
    row.appendChild(allowButton);
    row.appendChild(denyButton);
    grid.appendChild(row);
  });
  document.getElementById("close-overlay").addEventListener("click", () => {
    elements.overlay.classList.add("hidden");
  });
}

function joinExistingGroup(code) {
  const saved = loadLocalState();
  if (!saved || !saved.group || saved.group.code !== code) {
    showToast("Guild code not recognized in demo mode.");
    return;
  }
  if (state.group && state.group.code === code) {
    showToast("You are already in that guild.");
    return;
  }
  state.groupRequests.push({ uid: state.user.uid, displayName: state.user.displayName });
  saveAndSync();
  showToast("Join request sent to the guild admin.");
}

function renderGroupFeed() {
  elements.groupFeed.innerHTML = "";
  if (!state.groupFeed.length) {
    elements.groupFeed.innerHTML = `<div class="feed-card"><p>No proof posted yet.</p></div>`;
    return;
  }
  state.groupFeed.forEach(post => {
    const card = document.createElement("div");
    card.className = "feed-card";
    card.innerHTML = `
      <h3>${post.title}</h3>
      <p>By ${post.displayName}</p>
      <img src="${post.image}" alt="Proof photo" />
      <div class="feed-footer"></div>
    `;
    const footer = card.querySelector(".feed-footer");
    const reactButton = document.createElement("button");
    reactButton.className = "action-button secondary react-button";
    reactButton.textContent = "React";
    reactButton.addEventListener("click", () => openReactionPanel(post.id));
    const reportButton = document.createElement("button");
    reportButton.className = "action-button danger report-button";
    reportButton.textContent = "Report Cheater";
    reportButton.addEventListener("click", () => openReportPanel(post.id));
    footer.appendChild(reactButton);
    footer.appendChild(reportButton);
    elements.groupFeed.appendChild(card);
  });
}

function openReactionPanel(postId) {
  const post = state.groupFeed.find(item => item.id === postId);
  if (!post) return;
  elements.overlay.classList.remove("hidden");
  elements.overlayContent.innerHTML = `
    <h3>React to ${post.title}</h3>
    <div class="button-grid"></div>
    <button id="close-overlay" class="action-button secondary">Close</button>
  `;
  const grid = elements.overlayContent.querySelector(".button-grid");
  ["⚔️","👑","🔥","💯","🎉"].forEach(symbol => {
    const button = document.createElement("button");
    button.className = "action-button primary";
    button.textContent = symbol;
    button.addEventListener("click", () => {
      post.reactions[symbol] = (post.reactions[symbol] || 0) + 1;
      saveAndSync();
      elements.overlay.classList.add("hidden");
      renderGroupFeed();
    });
    grid.appendChild(button);
  });
  document.getElementById("close-overlay").addEventListener("click", () => {
    elements.overlay.classList.add("hidden");
  });
}

function openReportPanel(postId) {
  const post = state.groupFeed.find(item => item.id === postId);
  if (!post) return;
  elements.overlay.classList.remove("hidden");
  elements.overlayContent.innerHTML = `
    <h3>Report ${post.title}</h3>
    <textarea id="report-reason" rows="4" placeholder="Describe why this proof is suspicious."></textarea>
    <div class="button-grid"></div>
    <button id="close-overlay" class="action-button secondary">Cancel</button>
  `;
  const grid = elements.overlayContent.querySelector(".button-grid");
  const reportButton = document.createElement("button");
  reportButton.className = "action-button danger";
  reportButton.textContent = "Submit Report";
  reportButton.addEventListener("click", () => {
    const reason = document.getElementById("report-reason").value.trim();
    if (!reason) {
      showToast("Please provide a reason.");
      return;
    }
    state.reports.push({ id: `report-${Date.now()}`, postId, reason, reporter: state.user.displayName, status: "pending" });
    saveAndSync();
    elements.overlay.classList.add("hidden");
    showToast("Report submitted to the admin.");
  });
  grid.appendChild(reportButton);
  document.getElementById("close-overlay").addEventListener("click", () => {
    elements.overlay.classList.add("hidden");
  });
}

function renderProfile() {
  elements.profileSheet.innerHTML = "";
  const level = NEXT_LEVEL(state.xp);
  const progress = Math.min(100, Math.round(((state.xp - LEVEL_EXPERIENCE(level)) / (LEVEL_EXPERIENCE(level + 1) - LEVEL_EXPERIENCE(level))) * 100));
  const card = document.createElement("div");
  card.className = "stat-card";
  card.innerHTML = `
    <h3>${state.user.displayName}</h3>
    <div class="stat-row"><span>Level</span><span>${level}</span></div>
    <div class="stat-row"><span>Total XP</span><span>${state.xp}</span></div>
    <div class="stat-row"><span>Streak</span><span>${state.streak} days</span></div>
    <div class="stat-row"><span>Max Streak</span><span>${state.maxStreak} days</span></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    <p>${progress}% to level ${level + 1}</p>
  `;
  elements.profileSheet.appendChild(card);
}

function renderBadges() {
  elements.badgeList.innerHTML = "";
  const categories = state.completedQuestIds.reduce((acc, questId) => {
    const quest = MASTER_QUESTS.find(item => item.id === questId);
    if (quest) acc[quest.category] = (acc[quest.category] || 0) + 1;
    return acc;
  }, {});
  const badges = [];
  if (categories.Sports >= 5) badges.push({ title: "Gladiator Lord", subtitle: "5 sports quests completed" });
  if (categories.Outdoors >= 5) badges.push({ title: "Scout Elite", subtitle: "Outdoor explorer" });
  if (categories.Creative >= 4) badges.push({ title: "Artisan Sage", subtitle: "Creative quests mastered" });
  if (categories.Tech >= 4) badges.push({ title: "Tech Alchemist", subtitle: "Digital craft champion" });
  if (categories.Music >= 3) badges.push({ title: "Bard Virtuoso", subtitle: "Songs & performance" });
  if (badges.length === 0) {
    badges.push({ title: "Rookie Adventurer", subtitle: "Complete quests to earn badges" });
  }
  badges.forEach(badge => {
    const card = document.createElement("div");
    card.className = "badge-card";
    card.innerHTML = `
      <h3>${badge.title}</h3>
      <p>${badge.subtitle}</p>
    `;
    elements.badgeList.appendChild(card);
  });
}

function renderLeaderboard() {
  const container = document.createElement("div");
  container.className = "stats-grid";
  const leaderboard = [...DUMMY_USERS, { uid: state.user.uid, displayName: state.user.displayName, xp: state.xp, streak: state.streak, maxStreak: state.maxStreak }];
  leaderboard.sort((a, b) => b.xp - a.xp);
  leaderboard.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `
      <h3>#${index + 1} ${player.displayName}</h3>
      <p>${player.xp} XP • Streak ${player.streak}</p>
    `;
    container.appendChild(card);
  });
  elements.profileSheet.appendChild(container);
}

function renderAdmin() {
  elements.adminControls.innerHTML = "";
  if (!state.isAdmin) {
    elements.adminControls.innerHTML = `<p>You do not have admin access.</p>`;
    return;
  }
  const reportSection = document.createElement("div");
  reportSection.className = "admin-card";
  reportSection.innerHTML = `<h3>Flags</h3>`;
  if (state.reports.length === 0) {
    reportSection.innerHTML += `<p>No reports at the moment.</p>`;
  }
  state.reports.forEach(report => {
    const post = state.groupFeed.find(item => item.id === report.postId);
    const entry = document.createElement("div");
    entry.className = "group-card";
    entry.innerHTML = `
      <p><strong>${post ? post.title : "Unknown post"}</strong></p>
      <p>${report.reason}</p>
      <div class="button-grid"></div>
    `;
    const grid = entry.querySelector(".button-grid");
    [
      { label: "Deduct XP", style: "danger", action: () => punishMember(post?.userId, 50, report.id) },
      { label: "Temp Ban", style: "secondary", action: () => punishMember(post?.userId, 0, report.id, 48) },
      { label: "Kick", style: "danger", action: () => punishMember(post?.userId, 0, report.id, null, true) }
    ].forEach(buttonInfo => {
      const btn = document.createElement("button");
      btn.className = `action-button ${buttonInfo.style}`;
      btn.textContent = buttonInfo.label;
      btn.addEventListener("click", buttonInfo.action);
      grid.appendChild(btn);
    });
    reportSection.appendChild(entry);
  });
  const suggestionSection = document.createElement("div");
  suggestionSection.className = "admin-card";
  suggestionSection.innerHTML = `<h3>Pending Suggestions</h3>`;
  if (state.suggestedQuests.length === 0) {
    suggestionSection.innerHTML += `<p>No suggestions yet.</p>`;
  }
  state.suggestedQuests.forEach((suggestion, index) => {
    const entry = document.createElement("div");
    entry.className = "group-card";
    entry.innerHTML = `
      <p>${suggestion.title}</p>
      <p>${suggestion.description}</p>
      <div class="button-grid"></div>
    `;
    const grid = entry.querySelector(".button-grid");
    const approve = document.createElement("button");
    approve.className = "action-button primary";
    approve.textContent = "Approve";
    approve.addEventListener("click", () => {
      MASTER_QUESTS.push({
        id: `custom-${Date.now()}`,
        title: suggestion.title,
        description: suggestion.description,
        tier: suggestion.tier,
        xp: suggestion.xp,
        category: suggestion.category,
        cost: suggestion.cost,
        intensity: suggestion.intensity,
        groupRequired: suggestion.groupRequired,
        location: suggestion.location,
        gear: suggestion.gear,
        prereqs: suggestion.prereqs || []
      });
      state.suggestedQuests.splice(index, 1);
      saveAndSync();
      renderApp();
    });
    const deny = document.createElement("button");
    deny.className = "action-button danger";
    deny.textContent = "Deny";
    deny.addEventListener("click", () => {
      state.suggestedQuests.splice(index, 1);
      saveAndSync();
      renderApp();
    });
    grid.appendChild(approve);
    grid.appendChild(deny);
    suggestionSection.appendChild(entry);
  });
  elements.adminControls.appendChild(reportSection);
  elements.adminControls.appendChild(suggestionSection);
}

function punishMember(userId, xpPenalty = 0, reportId, banHours = 0, kick = false) {
  if (!state.group) return;
  const member = state.group.members.find(m => m.uid === userId);
  if (!member) return;
  if (xpPenalty) {
    member.xp = Math.max(0, (member.xp || 0) - xpPenalty);
  }
  if (banHours) {
    member.banUntil = Date.now() + banHours * 60 * 60 * 1000;
  }
  if (kick) {
    state.group.members = state.group.members.filter(m => m.uid !== userId);
  }
  state.reports = state.reports.filter(report => report.id !== reportId);
  saveAndSync();
  renderApp();
  showToast("Punishment applied.");
}

function renderApp() {
  renderDailyQuest();
  renderQuestList();
  renderAcceptedQuests();
  renderBossQuest();
  renderGroupScreen();
  renderGroupFeed();
  renderProfile();
  renderBadges();
  renderLeaderboard();
  renderAdmin();
  elements.adminNavButton.classList.toggle("hidden", !state.isAdmin);
}

function openOnboarding() {
  currentStep = 0;
  wizardDraft = {
    partyMode: "Solo",
    attribute: "Beginner",
    hobbies: [],
    realm: "The Grand Citadel",
    budget: "free",
    gear: []
  };
  elements.onboardingModal.classList.remove("hidden");
  renderWizardStep();
}

function closeOnboarding() {
  elements.onboardingModal.classList.add("hidden");
}

function renderWizardStep() {
  const step = wizardSteps[currentStep];
  elements.backStep.classList.toggle("hidden", currentStep === 0);
  elements.nextStep.textContent = currentStep === wizardSteps.length - 1 ? "Finish" : "Next";
  elements.wizardStep.innerHTML = "";

  if (step === "party") {
    const title = document.createElement("h3");
    title.textContent = "How do you want to play?";
    elements.wizardStep.appendChild(title);
    const note = document.createElement("p");
    note.textContent = "Pick the style that best fits your summer questing mood.";
    elements.wizardStep.appendChild(note);
    [
      { label: "Solo Adventurer — I like personal quests", value: "Solo" },
      { label: "Team Player — I want group quests", value: "Group" },
      { label: "Flexible — I can do both", value: "Mixed" }
    ].forEach(option => {
      const button = document.createElement("button");
      button.className = `action-button${wizardDraft.partyMode === option.value ? " active" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        wizardDraft.partyMode = option.value;
        renderWizardStep();
      });
      elements.wizardStep.appendChild(button);
    });
  }

  if (step === "attribute") {
    const title = document.createElement("h3");
    title.textContent = "What challenge level fits you?";
    elements.wizardStep.appendChild(title);
    const note = document.createElement("p");
    note.textContent = "This sets the difficulty and energy of your suggested quests.";
    elements.wizardStep.appendChild(note);
    [
      { label: "Easy & relaxed (Beginner)", value: "Beginner" },
      { label: "Balanced & active (Intermediate)", value: "Intermediate" },
      { label: "High intensity (Athlete)", value: "Athlete" }
    ].forEach(option => {
      const button = document.createElement("button");
      button.className = `action-button${wizardDraft.attribute === option.value ? " active" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        wizardDraft.attribute = option.value;
        renderWizardStep();
      });
      elements.wizardStep.appendChild(button);
    });
  }

  if (step === "hobbies") {
    const title = document.createElement("h3");
    title.textContent = "Which kinds of adventures do you enjoy?";
    elements.wizardStep.appendChild(title);
    const note = document.createElement("p");
    note.textContent = "Choose your favorite quest themes so your recommendations feel right.";
    elements.wizardStep.appendChild(note);
    [
      { label: "Creative projects", value: "Artisan" },
      { label: "Performance & music", value: "Bard" },
      { label: "Strength & challenge", value: "Gladiator" },
      { label: "Exploration & outdoors", value: "Scout" },
      { label: "Tech & puzzles", value: "Tech Alchemist" }
    ].forEach(option => {
      const button = document.createElement("button");
      button.className = `action-button${wizardDraft.hobbies.includes(option.value) ? " active" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        if (wizardDraft.hobbies.includes(option.value)) {
          wizardDraft.hobbies = wizardDraft.hobbies.filter(item => item !== option.value);
        } else {
          wizardDraft.hobbies.push(option.value);
        }
        renderWizardStep();
      });
      elements.wizardStep.appendChild(button);
    });
  }

  if (step === "realm") {
    const title = document.createElement("h3");
    title.textContent = "Where do you want your quests to take place?";
    elements.wizardStep.appendChild(title);
    const note = document.createElement("p");
    note.textContent = "Pick the setting that matches your summer vibe and available locations.";
    elements.wizardStep.appendChild(note);
    [
      { label: "City-style adventures (Grand Citadel)", value: "The Grand Citadel" },
      { label: "Cozy village quests (The Shires)", value: "The Shires" },
      { label: "Wild outdoor missions (Wild Frontier)", value: "The Wild Frontier" }
    ].forEach(option => {
      const button = document.createElement("button");
      button.className = `action-button${wizardDraft.realm === option.value ? " active" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        wizardDraft.realm = option.value;
        renderWizardStep();
      });
      elements.wizardStep.appendChild(button);
    });
  }

  if (step === "inventory") {
    const title = document.createElement("h3");
    title.textContent = "What resources do you have?";
    elements.wizardStep.appendChild(title);
    const note = document.createElement("p");
    note.textContent = "Tell us the gear and budget options you can use for quests.";
    elements.wizardStep.appendChild(note);
    const budgetRow = document.createElement("div");
    budgetRow.className = "button-grid";
    [
      { label: "Only free quests", value: "free" },
      { label: "I can spend a little", value: "paid" }
    ].forEach(option => {
      const button = document.createElement("button");
      button.className = `action-button${wizardDraft.budget === option.value ? " active" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        wizardDraft.budget = option.value;
        renderWizardStep();
      });
      budgetRow.appendChild(button);
    });
    elements.wizardStep.appendChild(budgetRow);
    [
      { label: "I have a bike or skateboard", value: "bike" },
      { label: "I can use a pool or lake", value: "pool" },
      { label: "I have access to gaming gear", value: "gaming" }
    ].forEach(option => {
      const button = document.createElement("button");
      button.className = `action-button${wizardDraft.gear.includes(option.value) ? " active" : ""}`;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        if (wizardDraft.gear.includes(option.value)) {
          wizardDraft.gear = wizardDraft.gear.filter(item => item !== option.value);
        } else {
          wizardDraft.gear.push(option.value);
        }
        renderWizardStep();
      });
      elements.wizardStep.appendChild(button);
    });
  }
}

function completeOnboarding() {
  state.profile = buildProfile(wizardDraft);
  state.xp = state.xp || 0;
  state.streak = state.streak || 0;
  state.maxStreak = state.maxStreak || 0;
  saveAndSync();
  closeOnboarding();
  showApp();
  renderApp();
  showToast("Character profile saved.");
}

function initListeners() {
  elements.loginButton.addEventListener("click", signIn);
  elements.logoutButton.addEventListener("click", async () => {
    await signOut(AUTH);
    state.user = null;
    showLogin();
  });
  elements.backStep.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    renderWizardStep();
  });
  elements.nextStep.addEventListener("click", () => {
    if (currentStep < wizardSteps.length - 1) {
      currentStep += 1;
      renderWizardStep();
    } else {
      completeOnboarding();
    }
  });
  document.getElementById("create-group-button").addEventListener("click", () => {
    if (!state.group) {
      createGroup();
    } else {
      showToast("You already belong to a guild.");
    }
  });
  document.getElementById("join-group-button").addEventListener("click", () => {
    const code = window.prompt("Enter your guild code:");
    if (code) {
      joinExistingGroup(code.trim());
    }
  });
  elements.navButtons.forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  elements.overlay.addEventListener("click", e => {
    if (e.target === elements.overlay) {
      elements.overlay.classList.add("hidden");
    }
  });
}

function createGroup() {
  const groupName = window.prompt("Enter a guild name:");
  if (!groupName) return;
  const code = `GUILD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  state.group = {
    name: groupName,
    code,
    adminUid: state.user.uid,
    members: [{ uid: state.user.uid, displayName: state.user.displayName, xp: state.xp, streak: state.streak }],
    progress: 0
  };
  state.groupRequests = [];
  state.isAdmin = true;
  saveAndSync();
  showToast(`Guild created: ${code}`);
  renderApp();
}

async function signIn() {
  try {
    const result = await signInWithPopup(AUTH, PROVIDER);
    state.user = result.user;
    await loadUser();
    const profileExists = state.profile && state.profile.partyMode;
    if (!profileExists) {
      openOnboarding();
    } else {
      showApp();
      renderApp();
    }
  } catch (error) {
    console.error("Auth error", error);
    showToast(`Unable to sign in. ${error.message}`);
  }
}

function checkAuthState() {
  onAuthStateChanged(AUTH, async user => {
    if (user) {
      state.user = user;
      await loadUser();
      if (!state.profile) {
        openOnboarding();
      } else {
        showApp();
        renderApp();
      }
    } else {
      showLogin();
    }
  });
}

function initializeBossTimer() {
  setInterval(() => {
    if (!state.bossQuest) return;
    if (Date.now() > state.bossQuest.deadline && state.bossQuest.progress < state.bossQuest.totalGoal) {
      state.xp = Math.max(0, state.xp - state.bossQuest.penalty);
      state.bossQuest.deadline = Date.now() + 7 * 24 * 60 * 60 * 1000;
      state.bossQuest.progress = 0;
      saveAndSync();
      showToast("Guild boss failed. XP penalty applied.");
    }
    renderBossQuest();
  }, 1000 * 60);
}

function initializeQuestTimer() {
  setInterval(() => {
    failExpiredQuests();
    renderAcceptedQuests();
  }, 1000 * 15);
}

function init() {
  initListeners();
  checkAuthState();
  initializeBossTimer();
  initializeQuestTimer();
  switchView(state.view);
}

init();
