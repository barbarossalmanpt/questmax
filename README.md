# ⚔️ QuestMax

> *Don't waste your summer. Complete the quest.*

QuestMax is a gamified web app that gives you and your friends side quests to complete over the summer — from small daily challenges to legendary group missions. Built with a retro pixel / classic RPG aesthetic, it turns your summer into an adventure.

---

## 🗺️ What It Does

- **AI-generated quests** personalised to your athletic level, hobbies, location, gear, budget, and whether you're solo or with friends
- **5 difficulty tiers**: Bronze → Silver → Gold → Platinum → Diamond, each with more XP and wilder challenges
- **Group system**: create or join a group with a code, admin approves join requests
- **Photo proof**: upload pics while doing the quest to verify completion — visible to your group + optional public post
- **Leaderboard + XP**: earn XP per quest, compete with your group on a live leaderboard
- **Streaks**: complete at least one quest per week to keep your streak alive
- **Quest chains**: complete smaller quests to unlock legendary ones
- **Daily surprise quest**: a randomly dropped quest for your group — 24h window to complete it
- **Seasonal / limited-time quests**: special quests that expire (summer events, holidays)
- **Boss quests**: group-wide challenges where everyone contributes — fail together, win together
- **Quest timer**: once you claim a quest, you have a deadline to submit proof
- **Community quest submissions**: suggest a quest to your group; admin approves it and sets the XP reward
- **Reporting system**: report a cheater → escalating punishments (XP deduction → temp ban → group removal)
- **Badges & titles**: earn cosmetic titles like *"Pool Shark"*, *"Mountain Goat"*, *"Hike Lord"*
- **Reaction system**: group members can react to proof photos with custom pixel emojis
- **Full stats profile**: quests done, XP, streak, rank, badges — all visible on your profile

---

## 🎨 Design

| Property | Value |
|---|---|
| Style | Retro pixel art / Classic RPG |
| Color palette | Dark background, gold + red accents |
| Icons/badges | Swords, shields, crowns |
| Navigation | Bottom nav bar (mobile-first) |
| Home layout | Quest feed (social scroll) |
| Target device | Mobile-first, fully responsive for desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Firebase Firestore |
| File Storage | Firebase Storage (photo proof uploads) |
| AI Quest Generation | Anthropic Claude API (claude-sonnet-4-20250514) |
| Hosting | GitHub Pages or Firebase Hosting |
| Dev Environment | GitHub Codespaces |

---

## 📁 Project Structure

```
questmax/
├── index.html              # Entry point / landing page
├── app.html                # Main app shell (after login)
├── css/
│   ├── main.css            # Global styles, CSS variables, pixel font
│   ├── components.css      # Reusable UI components (cards, buttons, badges)
│   └── pages.css           # Page-specific styles
├── js/
│   ├── firebase.js         # Firebase init + config
│   ├── auth.js             # Google login/logout
│   ├── quests.js           # Quest logic (fetch, claim, complete)
│   ├── groups.js           # Group creation, join, admin controls
│   ├── ai.js               # Claude API — quest generation
│   ├── leaderboard.js      # XP + leaderboard logic
│   ├── photos.js           # Photo upload + proof verification
│   ├── streaks.js          # Streak tracking logic
│   ├── moderation.js       # Reporting + punishment system
│   └── notifications.js    # In-app notifications (join requests, daily quest)
├── pages/
│   ├── onboarding.html     # Personalisation setup (new users)
│   ├── feed.html           # Main quest feed
│   ├── quest.html          # Individual quest detail page
│   ├── group.html          # Group page (members, leaderboard, group feed)
│   ├── profile.html        # Full stats profile page
│   ├── admin.html          # Admin panel (approve quests, handle reports)
│   └── leaderboard.html    # Global + group leaderboard
├── assets/
│   ├── icons/              # Pixel art icons (swords, shields, crowns, tiers)
│   ├── fonts/              # Pixel/retro font files
│   └── sounds/             # Optional: retro sound effects
├── firebase.json           # Firebase config
├── .env                    # API keys (never commit this)
├── .gitignore
├── AGENT.md                # Instructions for AI coding agents
└── README.md               # This file
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/questmax.git
cd questmax
```

### 2. Set up Firebase
1. Go to [firebase.google.com](https://firebase.google.com) and create a new project called `questmax`
2. Enable **Authentication** → Google Sign-In
3. Enable **Firestore Database** (start in test mode)
4. Enable **Storage**
5. Copy `js/firebaseConfig.example.js` to `js/firebaseConfig.js`, fill in your Firebase config values, and commit it when deploying to GitHub Pages.
6. In Firebase Authentication settings, add these authorized domains:
   - `localhost`
   - `127.0.0.1`
   - `barbarossalmanpt.github.io`

### 3. Set up the Anthropic API
1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. Add it to your `.env` file:
```
ANTHROPIC_API_KEY=your_key_here
```
> ⚠️ Never expose this key in frontend code. Route it through a Firebase Cloud Function or a simple backend proxy.

### 4. Open in GitHub Codespaces
- Push to GitHub, open in Codespaces
- Use the Live Server extension to preview

---

## 🗄️ Firebase Firestore Data Structure

```
users/
  {userId}/
    username, xp, level, streak, badges[], personalisation{}, groupIds[]

groups/
  {groupId}/
    name, code, adminId, members[], pendingRequests[]
    quests/
      {questId}/
        title, description, tier, xpReward, deadline, claimedBy[], completedBy[]
    feed/
      {postId}/
        userId, questId, photoUrl, timestamp, reactions{}, reports[]

quests/  (global AI-generated quest pool)
  {questId}/
    title, description, tier, xpReward, tags[], isLimitedTime, expiresAt

leaderboard/
  {groupId}/
    rankings[] (sorted by XP)
```

---

## 🔐 Demo Mode vs Live Mode

The app is built in **two phases**:

**Phase 1 — Demo Mode** (current)
- Users can sign in with Google
- Groups work fully (create, join with code, admin approval)
- Quests are seeded from a static JSON file (no live AI calls needed)
- Photos upload to Firebase Storage
- XP + leaderboard work in real-time via Firestore
- Perfect for presenting to a class with real participants

**Phase 2 — Live Mode** (after demo)
- AI quest generation via Claude API (proxied through Firebase Cloud Function)
- Seasonal quests automated
- Push notifications
- Public quest feed across all groups

---

## 👥 Roles

| Role | Permissions |
|---|---|
| Member | Complete quests, upload proof, suggest quests, report cheaters, react to photos |
| Admin | All of above + approve join requests, approve suggested quests, set XP rewards, issue punishments |

### Punishment System
1. **Warning** — notification sent
2. **XP Deduction** — amount set by admin
3. **Temp Ban** — blocked from completing quests for N days (admin sets duration)
4. **Group Removal** — permanent removal from the group

---

## ✅ Feature Checklist

- [ ] Google Sign-In via Firebase
- [ ] Onboarding personalisation form (6 categories)
- [ ] AI quest generation (Claude API)
- [ ] Quest feed with tier badges
- [ ] Quest claim + timer system
- [ ] Photo proof upload
- [ ] Group creation + join by code
- [ ] Admin join-request approval
- [ ] Group leaderboard (live XP)
- [ ] Streak tracking
- [ ] Quest chains
- [ ] Daily surprise quest
- [ ] Seasonal / limited-time quests
- [ ] Boss quest mode
- [ ] Community quest submissions + admin approval
- [ ] Reporting system + punishment escalation
- [ ] Reaction system on proof photos
- [ ] Badges + titles
- [ ] Full stats profile page
- [ ] Admin panel
- [ ] Desktop responsive layout

---

## 🤝 Contributing

Built by [Your Name] and [Friend's Name] as part of a coding with AI program.

To contribute: fork the repo, make your changes on a feature branch, and open a pull request.

---

## 📜 License

MIT
