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
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

const APP = initializeApp(firebaseConfig);
const AUTH = getAuth(APP);
const DB = getFirestore(APP);
const PROVIDER = new GoogleAuthProvider();
const FIRESTORE_ENABLED = false;
const RESET_DEMO = new URLSearchParams(window.location.search).get("reset") === "1";

const STORAGE_PROFILE = "user_character_profile";
const STORAGE_STATE = "summer_side_quests_state";

const QUEST_TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const TIER_XP = { Bronze: 10, Silver: 25, Gold: 50, Platinum: 100, Diamond: 250 };
const ARENAS = [
  { name: "Backyard Beginner", xp: 0 },
  { name: "Neighborhood Ranger", xp: 150 },
  { name: "Shire Explorer", xp: 350 },
  { name: "Wild Frontier", xp: 700 },
  { name: "Champion Coliseum", xp: 1200 }
];

const MASTER_QUESTS = [
  {
    id: "bronze-cannonball",
    title: "Cannonball Splash",
    description: "Make the biggest splash from a safe pool, lake or river.",
    tier: "Bronze",
    xp: 10,
    category: "Sports",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Wild Frontier",
    gear: ["pool"],
    duration: 30
  },
  {
    id: "bronze-scout-sprint",
    title: "Scavenger Sprint",
    description: "Collect five natural items along a neighborhood trail.",
    tier: "Bronze",
    xp: 10,
    category: "Outdoors",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Shires",
    gear: ["camera"],
    duration: 25
  },
  {
    id: "bronze-bard-street",
    title: "Street Song",
    description: "Perform a quick song or chant and share the moment with a friend.",
    tier: "Bronze",
    xp: 10,
    category: "Music",
    cost: "free",
    intensity: "Low",
    groupRequired: false,
    location: "The Grand Citadel",
    gear: ["microphone"],
    duration: 20
  },
  {
    id: "silver-market-duel",
    title: "Market Music Duel",
    description: "Write a short song and perform it while exploring the local market.",
    tier: "Silver",
    xp: 25,
    category: "Music",
    cost: "free",
    intensity: "Medium",
    groupRequired: true,
    location: "The Grand Citadel",
    gear: ["microphone"],
    duration: 40
  },
  {
    id: "silver-cottage-cookoff",
    title: "Cottage Cook-Off",
    description: "Create a snack using only local ingredients with your team.",
    tier: "Silver",
    xp: 25,
    category: "Creative",
    cost: "low",
    intensity: "Medium",
    groupRequired: true,
    location: "The Shires",
    gear: [],
    duration: 60
  },
  {
    id: "silver-forest-raid",
    title: "Forest Raid",
    description: "Navigate a short trail using a map and complete the hidden checkpoint.",
    tier: "Silver",
    xp: 25,
    category: "Outdoors",
    cost: "free",
    intensity: "Medium",
    groupRequired: false,
    location: "The Wild Frontier",
    gear: ["bike"],
    duration: 45
  },
  {
    id: "gold-flamingo-float",
    title: "Inflatable Swim Race",
    description: "Compete in a playful floating race on a pool or lake.",
    tier: "Gold",
    xp: 50,
    category: "Sports",
    cost: "low",
    intensity: "Medium",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["pool"],
    duration: 50
  },
  {
    id: "gold-art-quest",
    title: "Legendary Mural",
    description: "Design a chalk mural that leads a friend on a hidden path.",
    tier: "Gold",
    xp: 50,
    category: "Creative",
    cost: "low",
    intensity: "Medium",
    groupRequired: false,
    location: "The Shires",
    gear: [],
    duration: 55
  },
  {
    id: "gold-forest-raid",
    title: "Compass Raid",
    description: "Use a compass and solve the trail puzzle before the timer expires.",
    tier: "Gold",
    xp: 50,
    category: "Outdoors",
    cost: "free",
    intensity: "High",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["bike"],
    duration: 70
  },
  {
    id: "platinum-campfire-legend",
    title: "Night Sky Campfire",
    description: "Create a story-based campfire challenge with your guild.",
    tier: "Platinum",
    xp: 100,
    category: "Outdoors",
    cost: "low",
    intensity: "High",
    groupRequired: true,
    location: "The Wild Frontier",
    gear: ["pool"],
    duration: 90
  },
  {
    id: "diamond-puzzle-odyssey",
    title: "Retro Puzzle Odyssey",
    description: "Solve a series of creative quests with your squad to unlock a secret badge.",
    tier: "Diamond",
    xp: 250,
    category: "Tech",
    cost: "low",
    intensity: "High",
    groupRequired: true,
    location: "The Shires",
    gear: ["gaming"],
    duration: 120
  }
];

const SAMPLE_USERS = [
  {
    id: "user_guest",
    name: "Guest Knight",
    displayName: "Aria",
    xp: 95,
    streak: 2,
    maxStreak: 5,
    completedQuests: 7,
    groupId: "group_fireforge",
    isAdmin: true,
    profile: null,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: "user_ravi",
    name: "Ravi the Ranger",
    displayName: "Ravi",
    xp: 420,
    streak: 4,
    maxStreak: 7,
    completedQuests: 17,
    groupId: "group_fireforge",
    isAdmin: false,
    profile: null,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 14
  },
  {
    id: "user_zen",
    name: "Zen the Alchemist",
    displayName: "Zen",
    xp: 280,
    streak: 3,
    maxStreak: 5,
    completedQuests: 12,
    groupId: "group_fireforge",
    isAdmin: false,
    profile: null,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 10
  }
];

const DEFAULT_STATE = {
  currentView: "battle",
  currentUserId: "user_guest",
  profile: null,
  screenIndex: 1,
  questModal: "closed",
  groupModal: false,
  reportTarget: null,
  selectedQuestId: null,
  quickQuizStep: 1,
  quickQuizAnswers: {
    tier: ["Bronze"],
    party: "Solo",
    gear: [],
    categories: []
  },
  boardFilters: {
    tiers: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
    categories: [],
    costs: ["free", "low", "any"],
    gear: [],
    location: "any"
  },
  generatedDuels: [],
  activeSlots: [],
  feedPosts: [
    {
      id: "proof-1",
      authorId: "user_ravi",
      type: "proof",
      title: "Market Music Duel Complete",
      description: "Ravi and Aria posted proof of their winning street song.",
      image: "",
      timestamp: Date.now() - 1000 * 60 * 45,
      reactions: { "🔥": 3, "👑": 1 },
      reported: false
    },
    {
      id: "system-1",
      authorId: "system",
      type: "system",
      title: "New member joined",
      description: "Zen the Alchemist joined the guild.",
      timestamp: Date.now() - 1000 * 60 * 80,
      reactions: {},
      reported: false
    }
  ],
  reports: [],
  group: {
    id: "group_fireforge",
    name: "Fireforge League",
    code: "FF42",
    adminId: "user_guest",
    chestProgress: 38,
    chestGoal: 100,
    chestTimerEnd: Date.now() + 1000 * 60 * 60 * 2,
    suggestions: [],
    requests: [
      { id: "req-1", userId: "user_aurora", note: "I want to join the next chest rush!", timestamp: Date.now() - 1000 * 60 * 25 }
    ]
  },
  users: SAMPLE_USERS,
  groups: [],
  quests: MASTER_QUESTS
};

const EMOTES = ["🔥", "⚔️", "👑", "🛡️", "✨"];

const elements = {
  appShell: document.getElementById("app-shell"),
  loginShell: document.getElementById("login-shell"),
  loginButton: document.getElementById("login-button"),
  guestButton: document.getElementById("guest-button"),
  resetButton: document.getElementById("reset-button"),
  authButton: document.getElementById("auth-button"),
  logoutButton: document.getElementById("logout-button"),
  pageTags: Array.from(document.querySelectorAll(".page-tag")),
  screenStrip: document.getElementById("screen-strip"),
  navButtons: Array.from(document.querySelectorAll(".nav-button")),
  topLevel: document.getElementById("top-level"),
  topXp: document.getElementById("top-xp"),
  profileName: document.getElementById("profile-name"),
  profileTagline: document.getElementById("profile-tagline"),
  profileCompletion: document.getElementById("profile-completion"),
  statLevel: document.getElementById("stat-level"),
  statXp: document.getElementById("stat-xp"),
  statStreak: document.getElementById("stat-streak"),
  statMaxStreak: document.getElementById("stat-max-streak"),
  statQuests: document.getElementById("stat-quests-completed"),
  arenaTitle: document.getElementById("arena-title"),
  arenaFill: document.getElementById("arena-fill"),
  arenaMilestones: document.getElementById("arena-milestones"),
  badgeList: document.getElementById("badge-list"),
  historyLog: document.getElementById("history-log"),
  slotCount: document.getElementById("slot-count"),
  activeQuests: document.getElementById("active-quests"),
  questHint: document.getElementById("quest-hint"),
  openQuestModal: document.getElementById("open-quest-modal"),
  openBoardButton: document.getElementById("open-board-button"),
  openQuickQuiz: document.getElementById("open-quick-quiz"),
  openGroupModal: document.getElementById("open-group-modal"),
  clanName: document.getElementById("clan-name"),
  clanStatus: document.getElementById("clan-status"),
  chestProgress: document.getElementById("chest-progress"),
  chestProgressText: document.getElementById("chest-progress-text"),
  chestTimer: document.getElementById("chest-timer"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  chatImage: document.getElementById("chat-image"),
  clanFeed: document.getElementById("clan-feed"),
  onboardingModal: document.getElementById("onboarding-modal"),
  onboardingContent: document.getElementById("onboarding-content"),
  wizardBack: document.getElementById("wizard-back"),
  wizardNext: document.getElementById("wizard-next"),
  questModal: document.getElementById("quest-modal"),
  questModalContent: document.getElementById("quest-modal-content"),
  questClose: document.getElementById("quest-close"),
  groupModal: document.getElementById("group-modal"),
  groupModalContent: document.getElementById("group-modal-content"),
  groupClose: document.getElementById("group-close"),
  reportModal: document.getElementById("report-modal"),
  reportModalContent: document.getElementById("report-modal-content"),
  reportClose: document.getElementById("report-close"),
  toast: document.getElementById("toast")
};

let state = {};
let countdownInterval = null;

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function getGroup() {
  return state.group;
}

function getUserById(id) {
  return state.users.find((user) => user.id === id) || { displayName: "Unknown" };
}

function computeLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function computeArena(xp) {
  const arena = ARENAS.slice().reverse().find((entry) => xp >= entry.xp);
  return arena || ARENAS[0];
}

function computeArenaProgress(xp) {
  const current = computeArena(xp);
  const nextIndex = ARENAS.findIndex((entry) => entry.name === current.name) + 1;
  const next = ARENAS[nextIndex] || { xp: current.xp + 400 };
  return Math.min(100, Math.floor(((xp - current.xp) / (next.xp - current.xp)) * 100));
}

function buildProfileFromWizard(profile) {
  return {
    partyMode: profile.partyMode,
    attribute: profile.attribute,
    hobbies: profile.hobbies,
    realm: profile.realm,
    budget: profile.budget,
    gear: profile.gear,
    createdAt: Date.now()
  };
}

function clearSavedDemoState() {
  localStorage.removeItem(STORAGE_STATE);
  localStorage.removeItem(STORAGE_PROFILE);
}

function saveState() {
  localStorage.setItem(STORAGE_STATE, JSON.stringify(state));
  if (state.profile) {
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(state.profile));
  }
}

async function loadState() {
  if (RESET_DEMO) {
    clearSavedDemoState();
  }
  const rawState = localStorage.getItem(STORAGE_STATE);
  const rawProfile = localStorage.getItem(STORAGE_PROFILE);

  if (rawState) {
    try {
      state = JSON.parse(rawState);
    } catch (error) {
      state = { ...DEFAULT_STATE };
    }
  } else {
    state = { ...DEFAULT_STATE };
  }

  if (rawProfile) {
    try {
      state.profile = JSON.parse(rawProfile);
    } catch (error) {
      state.profile = null;
    }
  }

  if (!state.currentUserId) {
    state.currentUserId = DEFAULT_STATE.currentUserId;
  }

  if (!state.questModal) {
    state.questModal = "closed";
  }

  saveState();
}

function showToast(message, warning = false) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  elements.toast.style.borderColor = warning ? "rgba(255,77,77,0.6)" : "rgba(117,213,169,0.6)";
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2800);
}

function openApp() {
  elements.loginShell.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
  elements.authButton.classList.toggle("hidden", FIRESTORE_ENABLED === false);
  elements.logoutButton.classList.toggle("hidden", FIRESTORE_ENABLED === false);
  switchView(state.currentView);
  if (!state.profile) {
    openOnboarding();
  }
  renderApp();
}

function closeApp() {
  elements.appShell.classList.add("hidden");
  elements.loginShell.classList.remove("hidden");
}

function toggleModal(modal, open) {
  modal.classList.toggle("hidden", !open);
}

function switchView(view) {
  state.currentView = view;
  state.screenIndex = view === "profile" ? 0 : view === "battle" ? 1 : 2;
  elements.screenStrip.style.transform = `translateX(-${state.screenIndex * 100}%)`;
  elements.pageTags.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  elements.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  saveState();
}

function buildQuestSlots() {
  const slots = state.activeSlots.slice(0, 4);
  while (slots.length < 4) {
    slots.push(null);
  }
  return slots;
}

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
}

function getQuestById(id) {
  return state.quests.find((quest) => quest.id === id);
}

function canAcceptNewQuest() {
  return state.activeSlots.length < 4;
}

function filterQuestByProfile(quest) {
  if (!state.profile) return true;
  if (state.profile.realm && quest.location !== state.profile.realm) {
    return false;
  }
  if (state.profile.budget === "free" && quest.cost !== "free") {
    return false;
  }
  if (state.profile.gear.length && !state.profile.gear.some((gear) => quest.gear.includes(gear))) {
    return false;
  }
  if (state.profile.hobbies.length && !state.profile.hobbies.some((hobby) => quest.category.toLowerCase().includes(hobby.toLowerCase()))) {
    return false;
  }
  return true;
}

function filterBoardQuests(quest) {
  const filters = state.boardFilters;
  if (!filters.tiers.includes(quest.tier)) return false;
  if (filters.location !== "any" && quest.location !== filters.location) return false;
  if (filters.gear.length && !filters.gear.every((gear) => quest.gear.includes(gear))) return false;
  if (filters.categories.length && !filters.categories.includes(quest.category)) return false;
  if (filters.costs[0] !== "any" && !filters.costs.includes(quest.cost)) return false;
  return filterQuestByProfile(quest);
}

function renderTopStatus() {
  const user = getCurrentUser();
  const xp = user.xp;
  elements.topLevel.textContent = computeLevel(xp);
  elements.topXp.textContent = `${xp} XP`;
}

function renderProfileScreen() {
  const user = getCurrentUser();
  const profile = state.profile || { partyMode: "Solo", attribute: "Beginner", hobbies: [], realm: "The Grand Citadel", budget: "free", gear: [] };
  const level = computeLevel(user.xp);
  const arena = computeArena(user.xp);
  const progress = computeArenaProgress(user.xp);
  const completion = Math.min(100, Math.floor(((user.completedQuests || 0) / 20) * 100));

  elements.profileName.textContent = user.displayName || user.name;
  elements.profileTagline.textContent = `${profile.partyMode} • ${profile.attribute} • ${profile.realm}`;
  elements.profileCompletion.textContent = `${completion}%`;
  elements.statLevel.textContent = level;
  elements.statXp.textContent = user.xp;
  elements.statStreak.textContent = user.streak;
  elements.statMaxStreak.textContent = user.maxStreak;
  elements.statQuests.textContent = user.completedQuests;
  elements.arenaTitle.textContent = arena.name;
  elements.arenaFill.style.width = `${progress}%`;

  const milestonesHtml = ARENAS.map((entry) => `<span>${entry.name}</span>`).join("");
  elements.arenaMilestones.innerHTML = milestonesHtml;

  const badges = [
    { label: "Gladiator Lord", earned: user.completedQuests >= 5 },
    { label: "Ranger Scout", earned: user.streak >= 3 },
    { label: "Gold Seeker", earned: user.xp >= 250 },
    { label: "Arena Traveler", earned: user.xp >= 700 }
  ];

  elements.badgeList.innerHTML = badges
    .map(
      (badge) => `<div class="badge-card"><strong>${badge.earned ? "🏅" : "🔒"} ${badge.label}</strong><p>${badge.earned ? "Unlocked" : "Locked"}</p></div>`
    )
    .join("");

  const history = state.feedPosts
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((post) => post.type === "proof" && post.authorId === user.id)
    .map(
      (post) => `<div class="history-item"><span>${new Date(post.timestamp).toLocaleString()}</span><strong>${post.title}</strong></div>`
    )
    .join("");

  elements.historyLog.innerHTML = history || `<div class="history-item"><span>—</span><strong>No quest history yet.</strong></div>`;
}

function renderBattleScreen() {
  const slots = buildQuestSlots();
  elements.slotCount.textContent = `${state.activeSlots.length}/4`;
  elements.activeQuests.innerHTML = slots
    .map((slot, index) => {
      if (!slot) {
        return `<div class="slot-card"><strong>Empty Slot</strong><p>Add a quest to begin.</p></div>`;
      }
      const remaining = slot.deadline - Date.now();
      const countdown = formatDuration(remaining);
      const quest = getQuestById(slot.questId);
      return `<div class="slot-card"><strong>${quest.title}</strong><p>${quest.tier} • ${quest.category}</p><div class="slot-meta">${countdown} left</div><div class="quest-action-row"><button class="action-button secondary" data-action="proof" data-id="${slot.slotId}">Submit Proof</button><button class="action-button danger" data-action="abandon" data-id="${slot.slotId}">Abandon</button></div></div>`;
    })
    .join("");
}

function renderClanScreen() {
  const group = getGroup();
  elements.clanName.textContent = group.name;
  elements.clanStatus.textContent = `Code: ${group.code} • Admin: ${getUserById(group.adminId).displayName}`;
  const progressWidth = Math.min(100, Math.floor((group.chestProgress / group.chestGoal) * 100));
  elements.chestProgress.style.width = `${progressWidth}%`;
  elements.chestProgressText.textContent = `${group.chestProgress} / ${group.chestGoal}`;

  const remaining = Math.max(0, group.chestTimerEnd - Date.now());
  elements.chestTimer.textContent = formatDuration(remaining);

  elements.clanFeed.innerHTML = state.feedPosts
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((post) => {
      const author = post.authorId === "system" ? "System" : getUserById(post.authorId).displayName;
      const imageHtml = post.image ? `<img src="${post.image}" alt="Proof image" />` : "";
      const reactionButtons = Object.entries(post.reactions || {})
        .map(([emoji, count]) => `<span class="filter-pill">${emoji} ${count}</span>`)
        .join("");
      return `<div class="feed-card"><div class="feed-row"><strong>${author}</strong><span class="chat-meta">${new Date(post.timestamp).toLocaleTimeString()}</span></div><p><strong>${post.title}</strong></p><p>${post.description}</p>${imageHtml}<div class="feed-actions"><button class="action-button secondary" data-action="react" data-id="${post.id}">React</button><button class="action-button danger" data-action="report" data-id="${post.id}">Report Cheater</button></div><div class="chat-meta">${reactionButtons}</div></div>`;
    })
    .join("");
}

function renderApp() {
  renderTopStatus();
  renderProfileScreen();
  renderBattleScreen();
  renderClanScreen();
  saveState();
}

function getAvailableQuests() {
  return state.quests.filter(filterBoardQuests);
}

function openOnboarding() {
  state.quickQuizStep = 1;
  state.quickQuizAnswers = {
    partyMode: "Solo",
    attribute: "Beginner",
    hobbies: [],
    realm: "The Grand Citadel",
    budget: "free",
    gear: []
  };
  toggleModal(elements.onboardingModal, true);
  renderOnboarding();
}

function closeOnboarding() {
  toggleModal(elements.onboardingModal, false);
}

function renderOnboarding() {
  const step = state.quickQuizStep;
  const content = [];
  const answer = state.quickQuizAnswers;

  function optionCard(label, value, selected, actionName) {
    return `<div class="option-card ${selected ? "active" : ""}" data-action="wizard" data-field="${actionName}" data-value="${value}">${label}</div>`;
  }

  if (step === 1) {
    content.push(`<div class="mini-title">Party Mode</div>`);
    content.push(`<div class="option-grid">${optionCard("Solo (Lone Wolf)", "Solo", answer.partyMode === "Solo", "partyMode")} ${optionCard("Group (Guild Member)", "Group", answer.partyMode === "Group", "partyMode")} ${optionCard("Both", "Both", answer.partyMode === "Both", "partyMode")}</div>`);
  }

  if (step === 2) {
    content.push(`<div class="mini-title">Attributes</div>`);
    content.push(`<div class="option-grid">${optionCard("Beginner (Mage)", "Beginner", answer.attribute === "Beginner", "attribute")} ${optionCard("Intermediate (Ranger)", "Intermediate", answer.attribute === "Intermediate", "attribute")} ${optionCard("Athlete (Barbarian)", "Athlete", answer.attribute === "Athlete", "attribute")}</div>`);
  }

  if (step === 3) {
    content.push(`<div class="mini-title">Guilds & Hobbies</div>`);
    const hobbyCards = [
      { label: "Artisan (Creative)", value: "Artisan" },
      { label: "Bard (Music)", value: "Bard" },
      { label: "Gladiator (Sports)", value: "Gladiator" },
      { label: "Scout (Outdoors)", value: "Scout" },
      { label: "Tech Alchemist (Gaming)", value: "Tech Alchemist" }
    ]
      .map((item) => optionCard(item.label, item.value, answer.hobbies.includes(item.value), "hobbies"))
      .join("");
    content.push(`<div class="wizard-choice-list">${hobbyCards}</div>`);
  }

  if (step === 4) {
    content.push(`<div class="mini-title">Realm</div>`);
    content.push(`<div class="option-grid">${optionCard("The Grand Citadel", "The Grand Citadel", answer.realm === "The Grand Citadel", "realm")} ${optionCard("The Shires", "The Shires", answer.realm === "The Shires", "realm")} ${optionCard("The Wild Frontier", "The Wild Frontier", answer.realm === "The Wild Frontier", "realm")}</div>`);
  }

  if (step === 5) {
    content.push(`<div class="mini-title">Inventory & Loot Bag</div>`);
    content.push(`<div class="option-grid">${optionCard("Free quests only", "free", answer.budget === "free", "budget")} ${optionCard("Minor cash allowed", "paid", answer.budget === "paid", "budget")}</div>`);
    content.push(`<div class="mini-title">Gear Available</div>`);
    content.push(`<div class="option-grid">${optionCard("Bike / Skateboard / Scooter", "bike", answer.gear.includes("bike"), "gear")} ${optionCard("Pool / Beach / Lake", "pool", answer.gear.includes("pool"), "gear")} ${optionCard("Gaming Setup", "gaming", answer.gear.includes("gaming"), "gear")}</div>`);
  }

  elements.onboardingContent.innerHTML = `${content.join("")}`;
  elements.wizardBack.classList.toggle("hidden", step === 1);
  elements.wizardNext.textContent = step === 5 ? "Finish" : "Next";
}

function handleOnboardingChoice(field, value) {
  const answer = state.quickQuizAnswers;
  if (field === "hobbies" || field === "gear") {
    const list = answer[field];
    if (list.includes(value)) {
      answer[field] = list.filter((item) => item !== value);
    } else {
      answer[field] = [...list, value];
    }
  } else {
    answer[field] = value;
  }
  renderOnboarding();
}

function completeOnboarding() {
  state.profile = buildProfileFromWizard(state.quickQuizAnswers);
  const currentUser = getCurrentUser();
  currentUser.profile = state.profile;
  saveState();
  closeOnboarding();
  renderApp();
  showToast("Character profile created. Your quest pool is personalized.");
}

function openQuestModal() {
  state.questModal = "choice";
  toggleModal(elements.questModal, true);
  renderQuestModal();
}

function closeQuestModal() {
  state.questModal = "closed";
  toggleModal(elements.questModal, false);
}

function renderQuestModal() {
  if (state.questModal === "choice") {
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Choose your path</div>
      <div class="option-grid">
        <div class="option-card" data-action="quest-path" data-value="browse"><strong>Browse and Choose</strong><p>Open the full quest board and select a mission.</p></div>
        <div class="option-card" data-action="quest-path" data-value="quick"><strong>Find a Quest</strong><p>Answer a quick quiz and discover personalized options.</p></div>
      </div>
    `;
  }

  if (state.questModal === "board") {
    const available = getAvailableQuests();
    const cards = available
      .map((quest) => {
        const gearLabel = quest.gear.length ? quest.gear.join(", ") : "No gear needed";
        const blocked = !canAcceptNewQuest();
        return `<div class="quest-card"><strong>${quest.title}</strong><p>${quest.description}</p><div class="quest-meta">${quest.tier} • ${quest.intensity} • ${quest.cost.toUpperCase()}</div><div class="quest-meta">${gearLabel} • ${quest.location}</div><div class="quest-action-row"><button class="action-button primary" data-action="accept-quest" data-id="${quest.id}" ${blocked ? "disabled" : ""}>Accept</button></div></div>`;
      })
      .join("");
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Quest Board</div>
      <div class="filter-grid">${QUEST_TIERS.map((tier) => `<button class="filter-pill ${state.boardFilters.tiers.includes(tier) ? "active" : ""}" data-action="toggle-filter" data-field="tier" data-value="${tier}">${tier}</button>`).join("")}</div>
      <div class="filter-grid">${["The Grand Citadel","The Shires","The Wild Frontier","any"].map((location) => `<button class="filter-pill ${state.boardFilters.location === location ? "active" : ""}" data-action="toggle-filter" data-field="location" data-value="${location}">${location}</button>`).join("")}</div>
      <div class="quest-grid">${cards || `<div class="feed-card"><p>No quests match your profile yet.</p></div>`}</div>
    `;
  }

  if (state.questModal === "quick") {
    renderQuickQuizStep();
    return;
  }

  if (state.questModal === "results") {
    const results = state.generatedDuels;
    const cards = results
      .map((quest) => `<div class="quest-card"><strong>${quest.title}</strong><p>${quest.description}</p><div class="quest-meta">${quest.tier} • ${quest.intensity} • ${quest.cost.toUpperCase()}</div><div class="quest-action-row"><button class="action-button primary" data-action="accept-quest" data-id="${quest.id}">Accept</button></div></div>`) 
      .join("");
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Quest Cache</div>
      <p>Generating personalized quests...</p>
      <div class="quest-grid">${cards}</div>
    `;
  }
}

function renderQuickQuizStep() {
  const step = state.quickQuizStep;
  const answer = state.quickQuizAnswers;
  const selected = (field, value) => (answer[field] === value || (Array.isArray(answer[field]) && answer[field].includes(value)) ? "active" : "");
  const listSelected = (field, value) => (answer[field]?.includes(value) ? "active" : "");

  if (step === 1) {
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Difficulty Choice</div>
      <div class="option-grid">
        ${QUEST_TIERS.map((tier) => `<div class="option-card ${selected("tier", tier)}" data-action="quiz-answer" data-field="tier" data-value="${tier}">${tier}</div>`).join("")}
      </div>
    `;
  }
  if (step === 2) {
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Party Dynamics</div>
      <div class="option-grid">
        <div class="option-card ${selected("party", "Solo")}" data-action="quiz-answer" data-field="party" data-value="Solo">Solo</div>
        <div class="option-card ${selected("party", "Group")}" data-action="quiz-answer" data-field="party" data-value="Group">Group</div>
        <div class="option-card ${selected("party", "Both")}" data-action="quiz-answer" data-field="party" data-value="Both">Both</div>
      </div>
    `;
  }
  if (step === 3) {
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Asset Availability</div>
      <div class="option-grid">
        <div class="option-card ${listSelected("gear", "bike")}" data-action="quiz-answer" data-field="gear" data-value="bike">Bike / Skateboard / Scooter</div>
        <div class="option-card ${listSelected("gear", "pool")}" data-action="quiz-answer" data-field="gear" data-value="pool">Pool / Beach / Lake</div>
        <div class="option-card ${listSelected("gear", "gaming")}" data-action="quiz-answer" data-field="gear" data-value="gaming">Gaming Setup</div>
      </div>
    `;
  }
  if (step === 4) {
    elements.questModalContent.innerHTML = `
      <div class="mini-title">Quest Types</div>
      <div class="option-grid">
        ${["Artisan", "Bard", "Gladiator", "Scout", "Tech Alchemist"].map((category) => `<div class="option-card ${listSelected("categories", category)}" data-action="quiz-answer" data-field="categories" data-value="${category}">${category}</div>`).join("")}
      </div>
      <button id="quiz-generate" class="action-button primary">Generate Quests</button>
    `;
  }
}

function openGroupModal() {
  state.groupModal = true;
  toggleModal(elements.groupModal, true);
  renderGroupModal();
}

function closeGroupModal() {
  state.groupModal = false;
  toggleModal(elements.groupModal, false);
}

function renderGroupModal() {
  const group = getGroup();
  const members = state.users.filter((user) => user.groupId === group.id);
  const sorted = members.slice().sort((a, b) => b.xp - a.xp);
  const suggestions = group.suggestions;
  const requests = group.requests;
  elements.groupModalContent.innerHTML = `
    <div class="mini-title">Active Roster</div>
    <div class="badge-grid">${sorted
      .map((member) => `<div class="badge-card"><strong>${member.displayName}</strong><p>${member.id === group.adminId ? "Guild Admin" : "Member"}</p><p>XP ${member.xp}</p></div>`)
      .join("")}</div>
    <div class="mini-title">Pending Requests</div>
    <div class="request-list">${requests.length ? requests
      .map((request) => `<div class="report-card"><strong>${request.userId}</strong><p>${request.note}</p><div class="report-actions"><button class="action-button primary" data-action="approve-request" data-id="${request.id}">Approve</button> <button class="action-button danger" data-action="deny-request" data-id="${request.id}">Deny</button></div></div>`) 
      .join("") : `<div class="feed-card"><p>No pending requests.</p></div>`}</div>
    <div class="mini-title">Quest Suggestions</div>
    <div class="request-list">${suggestions.length ? suggestions
      .map((suggestion) => `<div class="report-card"><strong>${suggestion.title}</strong><p>${suggestion.description}</p><div class="report-actions"><button class="action-button primary" data-action="approve-suggestion" data-id="${suggestion.id}">Approve</button></div></div>`) 
      .join("") : `<div class="feed-card"><p>No suggestions yet.</p></div>`}</div>
  `;
}

function renderReportModal(postId) {
  const post = state.feedPosts.find((item) => item.id === postId);
  if (!post) return;
  elements.reportModalContent.innerHTML = `
    <p>You are reporting the submission: <strong>${post.title}</strong></p>
    <p>Reason:</p>
    <button class="action-button danger" data-action="submit-report" data-id="${post.id}" data-reason="cheating">Cheating</button>
    <button class="action-button danger" data-action="submit-report" data-id="${post.id}" data-reason="inappropriate">Inappropriate</button>
  `;
  toggleModal(elements.reportModal, true);
}

function handleQuestAccept(questId) {
  if (!canAcceptNewQuest()) {
    showToast("Your quest slots are full. Complete or abandon one first.", true);
    return;
  }
  const quest = getQuestById(questId);
  if (!quest) return;
  state.activeSlots.push({
    slotId: `slot-${Date.now()}`,
    questId: quest.id,
    acceptedAt: Date.now(),
    deadline: Date.now() + quest.duration * 60 * 1000
  });
  closeQuestModal();
  renderApp();
  showToast(`${quest.title} added to slots. Submit proof when complete.`);
}

function handleQuestAction(action, slotId) {
  const slotIndex = state.activeSlots.findIndex((slot) => slot.slotId === slotId);
  if (slotIndex === -1) return;
  if (action === "abandon") {
    state.activeSlots.splice(slotIndex, 1);
    renderApp();
    showToast("Quest abandoned.");
  }
  if (action === "proof") {
    const slot = state.activeSlots[slotIndex];
    promptQuestProof(slot);
  }
}

function promptQuestProof(slot) {
  const quest = getQuestById(slot.questId);
  const title = encodeURIComponent(quest.title);
  const message = `Submit proof for ${quest.title}. Select an image from your device.`;
  showToast(message);
  elements.chatImage.click();
  elements.chatImage.dataset.proofSlot = slot.slotId;
}

function completeQuest(slotId, imageData) {
  const slotIndex = state.activeSlots.findIndex((slot) => slot.slotId === slotId);
  if (slotIndex === -1) return;
  const slot = state.activeSlots[slotIndex];
  const quest = getQuestById(slot.questId);
  const user = getCurrentUser();
  user.xp += TIER_XP[quest.tier] || quest.xp;
  user.completedQuests += 1;
  user.streak += 1;
  user.maxStreak = Math.max(user.maxStreak, user.streak);
  state.feedPosts.unshift({
    id: `proof-${Date.now()}`,
    authorId: user.id,
    type: "proof",
    title: `${quest.title} Complete`,
    description: `Proof uploaded for ${quest.title}.`,
    image: imageData,
    timestamp: Date.now(),
    reactions: {},
    reported: false
  });
  state.activeSlots.splice(slotIndex, 1);
  state.group.chestProgress += 12;
  if (state.group.chestProgress >= state.group.chestGoal) {
    handleChestCompletion();
  }
  renderApp();
  showToast(`${quest.title} completed! ${TIER_XP[quest.tier] || quest.xp} XP earned.`);
}

function handleChestCompletion() {
  state.group.chestProgress = state.group.chestGoal;
  state.feedPosts.unshift({
    id: `system-chest-${Date.now()}`,
    authorId: "system",
    type: "system",
    title: "Guild Chest Complete",
    description: "The group chest is filled! All members receive bonus XP.",
    timestamp: Date.now(),
    reactions: {
      "👑": 4
    },
    reported: false
  });
  state.users.forEach((user) => {
    if (user.groupId === state.group.id) {
      user.xp += 50;
    }
  });
  state.group.chestTimerEnd = Date.now() + 1000 * 60 * 60 * 4;
}

function checkChestTimer() {
  if (Date.now() > state.group.chestTimerEnd && state.group.chestProgress < state.group.chestGoal) {
    state.feedPosts.unshift({
      id: `system-chest-fail-${Date.now()}`,
      authorId: "system",
      type: "system",
      title: "Guild Chest Failed",
      description: "The co-op timer ended before the chest filled. XP penalty applied.",
      timestamp: Date.now(),
      reactions: {},
      reported: false
    });
    state.users.forEach((user) => {
      if (user.groupId === state.group.id) {
        user.xp = Math.max(0, user.xp - 50);
      }
    });
    state.group.chestProgress = 0;
    state.group.chestTimerEnd = Date.now() + 1000 * 60 * 60 * 2;
  }
}

function handleBoardFilter(field, value) {
  if (field === "tier") {
    const tiers = state.boardFilters.tiers;
    if (tiers.includes(value)) {
      state.boardFilters.tiers = tiers.filter((item) => item !== value);
    } else {
      state.boardFilters.tiers.push(value);
    }
  }
  if (field === "location") {
    state.boardFilters.location = value;
  }
  renderQuestModal();
}

function toggleQuickQuizSelection(field, value) {
  if (field === "tier" || field === "party") {
    state.quickQuizAnswers[field] = value;
  } else {
    const current = state.quickQuizAnswers[field];
    if (current.includes(value)) {
      state.quickQuizAnswers[field] = current.filter((item) => item !== value);
    } else {
      state.quickQuizAnswers[field] = [...current, value];
    }
  }
  renderQuickQuizStep();
}

function generateQuickQuests() {
  const answer = state.quickQuizAnswers;
  const results = state.quests.filter((quest) => {
    if (!answer.tier.includes(quest.tier) && answer.tier !== quest.tier) return false;
    if (answer.party === "Solo" && quest.groupRequired) return false;
    if (answer.party === "Group" && !quest.groupRequired) return false;
    if (answer.gear.length && !answer.gear.every((gear) => quest.gear.includes(gear))) return false;
    if (answer.categories.length && !answer.categories.some((category) => quest.category.toLowerCase().includes(category.toLowerCase()))) return false;
    return filterQuestByProfile(quest);
  });
  state.generatedDuels = results.slice(0, 5);
  if (state.generatedDuels.length === 0) {
    state.generatedDuels = state.quests.filter(filterQuestByProfile).slice(0, 5);
  }
  state.questModal = "results";
  renderQuestModal();
}

function handleChatPost(event) {
  event.preventDefault();
  const text = elements.chatInput.value.trim();
  const file = elements.chatImage.files[0];
  if (!text && !file) {
    showToast("Add a message or upload proof to post.", true);
    return;
  }
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      postFeedMessage(text || "Proof submitted.", reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    postFeedMessage(text, "");
  }
  elements.chatInput.value = "";
  elements.chatImage.value = "";
}

function postFeedMessage(text, imageData) {
  const user = getCurrentUser();
  state.feedPosts.unshift({
    id: `chat-${Date.now()}`,
    authorId: user.id,
    type: imageData ? "proof" : "chat",
    title: imageData ? "Proof Uploaded" : "Guild Chat",
    description: text,
    image: imageData,
    timestamp: Date.now(),
    reactions: {},
    reported: false
  });
  renderClanScreen();
  saveState();
}

function handleFeedAction(action, postId) {
  const post = state.feedPosts.find((item) => item.id === postId);
  if (!post) return;
  if (action === "react") {
    const emoji = EMOTES[Math.floor(Math.random() * EMOTES.length)];
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    renderClanScreen();
  }
  if (action === "report") {
    renderReportModal(postId);
  }
}

function submitReport(postId, reason) {
  state.reports.push({
    id: `report-${Date.now()}`,
    postId,
    reporterId: state.currentUserId,
    reason,
    timestamp: Date.now()
  });
  toggleModal(elements.reportModal, false);
  showToast("Report submitted to the admin panel.");
}

function handleGroupAction(action, id) {
  if (action === "approve-request") {
    const requestIndex = state.group.requests.findIndex((request) => request.id === id);
    if (requestIndex === -1) return;
    state.group.requests.splice(requestIndex, 1);
    state.users.push({
      id: id,
      name: id,
      displayName: id,
      xp: 20,
      streak: 0,
      maxStreak: 0,
      completedQuests: 0,
      groupId: state.group.id,
      isAdmin: false,
      profile: null,
      joinedAt: Date.now()
    });
    renderGroupModal();
    showToast("Request approved. Member joined the guild.");
  }
  if (action === "deny-request") {
    state.group.requests = state.group.requests.filter((request) => request.id !== id);
    renderGroupModal();
  }
  if (action === "approve-suggestion") {
    const suggestionIndex = state.group.suggestions.findIndex((suggestion) => suggestion.id === id);
    if (suggestionIndex === -1) return;
    const suggestion = state.group.suggestions[suggestionIndex];
    state.quests.unshift({
      id: `suggestion-${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      tier: suggestion.tier || "Bronze",
      xp: suggestion.xp || 15,
      category: suggestion.category || "Creative",
      cost: suggestion.cost || "free",
      intensity: suggestion.intensity || "Medium",
      groupRequired: suggestion.groupRequired || false,
      location: suggestion.location || "The Shires",
      gear: suggestion.gear || [],
      duration: suggestion.duration || 30
    });
    state.group.suggestions.splice(suggestionIndex, 1);
    renderGroupModal();
    showToast("Suggestion approved and published to the board.");
  }
}

function attachEventListeners() {
  elements.loginButton.addEventListener("click", signInWithGoogle);
  elements.guestButton.addEventListener("click", () => {
    openApp();
    showToast("Guest mode enabled. Local progress is saved.");
  });
  elements.resetButton.addEventListener("click", () => {
    clearSavedDemoState();
    showToast("Demo state reset. Reloading fresh user experience.");
    window.location.href = window.location.pathname;
  });
  elements.authButton.addEventListener("click", signInWithGoogle);
  elements.logoutButton.addEventListener("click", async () => {
    await signOut(AUTH);
    closeApp();
    showToast("Logged out.");
  });

  elements.pageTags.forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  elements.openQuestModal.addEventListener("click", openQuestModal);
  elements.openBoardButton.addEventListener("click", () => {
    state.questModal = "board";
    toggleModal(elements.questModal, true);
    renderQuestModal();
  });
  elements.openQuickQuiz.addEventListener("click", () => {
    state.questModal = "quick";
    toggleModal(elements.questModal, true);
    renderQuickQuizStep();
  });
  elements.questClose.addEventListener("click", closeQuestModal);

  elements.openGroupModal.addEventListener("click", openGroupModal);
  elements.groupClose.addEventListener("click", closeGroupModal);

  elements.wizardBack.addEventListener("click", () => {
    state.quickQuizStep = Math.max(1, state.quickQuizStep - 1);
    renderOnboarding();
  });
  elements.wizardNext.addEventListener("click", () => {
    if (state.quickQuizStep === 5) {
      completeOnboarding();
      return;
    }
    state.quickQuizStep += 1;
    renderOnboarding();
  });

  elements.onboardingContent.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action='wizard']");
    if (!target) return;
    const field = target.dataset.field;
    const value = target.dataset.value;
    handleOnboardingChoice(field, value);
  });

  elements.questModalContent.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const value = target.dataset.value;
    const id = target.dataset.id;
    if (action === "quest-path") {
      state.questModal = value === "browse" ? "board" : "quick";
      renderQuestModal();
    }
    if (action === "accept-quest") {
      handleQuestAccept(id);
    }
    if (action === "toggle-filter") {
      handleBoardFilter(target.dataset.field, value);
    }
    if (action === "quiz-answer") {
      if (target.id === "quiz-generate") return;
      toggleQuickQuizSelection(target.dataset.field, value);
    }
  });

  elements.questModalContent.addEventListener("click", (event) => {
    if (event.target.id === "quiz-generate") {
      generateQuickQuests();
    }
  });

  elements.chatForm.addEventListener("submit", handleChatPost);
  elements.clanFeed.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    handleFeedAction(action, id);
  });

  elements.reportModalContent.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action='submit-report']");
    if (!target) return;
    const id = target.dataset.id;
    const reason = target.dataset.reason;
    submitReport(id, reason);
  });

  elements.groupModalContent.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    handleGroupAction(action, id);
  });

  elements.reportClose.addEventListener("click", () => toggleModal(elements.reportModal, false));
  elements.chatImage.addEventListener("change", (event) => {
    const slotId = event.target.dataset.proofSlot;
    if (!slotId || !event.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      completeQuest(slotId, reader.result);
      delete event.target.dataset.proofSlot;
    };
    reader.readAsDataURL(event.target.files[0]);
  });

  const screenWindow = document.getElementById("screen-window");
  let startX = 0;
  screenWindow.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  });
  screenWindow.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0].clientX;
    if (Math.abs(endX - startX) < 40) return;
    if (endX < startX) {
      const next = state.screenIndex + 1;
      if (next < 3) switchView(next === 0 ? "profile" : next === 1 ? "battle" : "clan");
    } else {
      const prev = state.screenIndex - 1;
      if (prev >= 0) switchView(prev === 0 ? "profile" : prev === 1 ? "battle" : "clan");
    }
  });
}

async function signInWithGoogle() {
  if (!FIRESTORE_ENABLED) {
    showToast("Firebase disabled in demo mode. Continue as guest or enable backend.");
    return;
  }
  try {
    await signInWithPopup(AUTH, PROVIDER);
  } catch (error) {
    showToast("Google sign-in failed.", true);
  }
}

function initFirebaseAuth() {
  if (!FIRESTORE_ENABLED) return;
  onAuthStateChanged(AUTH, async (user) => {
    if (user) {
      state.currentUserId = user.uid;
      openApp();
      await syncUserState();
    } else {
      closeApp();
    }
  });
}

async function syncUserState() {
  if (!FIRESTORE_ENABLED) return;
  try {
    const userRef = doc(DB, "users", state.currentUserId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const remote = snap.data();
      if (remote.profile) state.profile = remote.profile;
    } else {
      await setDoc(userRef, { createdAt: serverTimestamp() });
    }
  } catch (error) {
    console.warn(error);
  }
}

function init() {
  attachEventListeners();
  loadState().then(() => {
    openApp();
    renderApp();
    if (!FIRESTORE_ENABLED) {
      showToast("Local demo mode active.");
    }
    countdownInterval = setInterval(() => {
      checkChestTimer();
      renderClanScreen();
      renderBattleScreen();
    }, 1000);
  });
  if (FIRESTORE_ENABLED) {
    initFirebaseAuth();
  }
}

init();
