# AGENT.md — QuestMax

This file tells any AI coding agent (Claude, Copilot, etc.) everything it needs to know to work on this project correctly. Read this entire file before writing or editing any code.

---

## 🧠 Project Summary

QuestMax is a mobile-first gamified web app where users get AI-generated side quests to complete during summer. It uses HTML/CSS/Vanilla JS on the frontend, Firebase (Auth, Firestore, Storage) as the backend, and the Anthropic Claude API for quest generation. It has a retro pixel / classic RPG aesthetic with a dark background and gold + red accents.

---

## ⚠️ Critical Rules — Read Before Every Edit

1. **Mobile-first always.** Every component must work on a ~390px wide screen first. Desktop styles go in `@media (min-width: 768px)` overrides. Never write desktop-first CSS.

2. **No frameworks.** This is plain HTML, CSS, and Vanilla JavaScript only. No React, no Vue, no jQuery, no Tailwind. Do not suggest installing npm packages unless absolutely necessary.

3. **Never expose API keys.** The Anthropic API key must never appear in any frontend JS file. It must always be called through a Firebase Cloud Function (`functions/generateQuest.js`). If asked to add the key to frontend code, refuse and explain why.

4. **Pixel aesthetic must be consistent.** All UI elements must follow the design system defined in `css/main.css`. Use CSS variables only — never hardcode colors or fonts. The pixel font is loaded globally; use it everywhere.

5. **Firebase is the only backend.** All data reads/writes go through Firestore. No localStorage for persistent data (use it only for temporary UI state like "onboarding step"). No external databases.

6. **Always check the data structure** in README.md before reading or writing to Firestore. Field names must match exactly.

7. **Demo mode first.** If a feature requires the Claude API (quest generation), make it work with static seed data from `data/seed-quests.json` first, then wire up the real API call. Never block a feature on the API being live.

8. **Destructive admin actions need confirmation.** Any action that removes a user, deducts XP, or deletes data must show a confirmation modal before executing.

---

## 🎨 Design System

### CSS Variables (defined in `css/main.css`)
```css
:root {
  /* Colors */
  --bg-primary: #0d0d0d;
  --bg-secondary: #1a1a2e;
  --bg-card: #16213e;
  --accent-gold: #ffd700;
  --accent-gold-dim: #b8860b;
  --accent-red: #c0392b;
  --accent-red-bright: #e74c3c;
  --text-primary: #f0e6d3;
  --text-secondary: #a89b8c;
  --text-muted: #5c5244;
  --border-color: #2d2d4e;

  /* Quest tier colors */
  --tier-bronze: #cd7f32;
  --tier-silver: #c0c0c0;
  --tier-gold: #ffd700;
  --tier-platinum: #e5e4e2;
  --tier-diamond: #b9f2ff;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border radius (pixel style = mostly sharp) */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;

  /* Font */
  --font-pixel: 'Press Start 2P', monospace;
  --font-body: 'VT323', monospace;
}
```

### Typography
- **Headings / UI labels**: `font-family: var(--font-pixel)` — small sizes only (8px–14px), it's a display font
- **Body text / descriptions**: `font-family: var(--font-body)` — works at 16px–24px
- Never use system fonts for anything visible to the user

### Component Patterns
- **Cards**: `background: var(--bg-card)`, `border: 2px solid var(--border-color)`, `border-radius: var(--radius-md)`
- **Primary buttons**: `background: var(--accent-gold)`, `color: var(--bg-primary)`, pixel border effect
- **Danger buttons**: `background: var(--accent-red)`
- **Tier badges**: pill shape, colored border matching tier color, icon + text
- **Bottom nav**: fixed, `height: 60px`, 5 icons max, active state in gold

---

## 📁 File Responsibilities

| File | What it does |
|---|---|
| `js/firebase.js` | Firebase init only. Exports `db`, `auth`, `storage`. No logic here. |
| `js/auth.js` | Google sign-in, sign-out, auth state listener, redirect to onboarding if new user |
| `js/quests.js` | Fetch quests from Firestore, claim quest, submit completion, handle quest timer |
| `js/groups.js` | Create group, generate group code, request to join, admin approval/denial, transfer admin |
| `js/ai.js` | Call Firebase Cloud Function to generate quests. Falls back to `data/seed-quests.json` in demo mode |
| `js/leaderboard.js` | Calculate XP totals, sort members, render leaderboard |
| `js/photos.js` | Upload proof photo to Firebase Storage, save URL to Firestore, handle public/group visibility toggle |
| `js/streaks.js` | Check last quest completion date, update streak counter, handle streak loss |
| `js/moderation.js` | Submit report, escalate punishment levels, admin punishment actions |
| `js/notifications.js` | In-app notification bell, Firestore listener for new notifications |

---

## 🗄️ Firestore Rules to Follow

- A user can only read/write their own `users/{userId}` document
- Group data is readable by all group members (`groups/{groupId}`)
- Only the admin (`groups/{groupId}.adminId`) can write to group settings, approve quests, issue punishments
- Photos in the group feed are readable by all group members
- Public posts are readable by all authenticated users

---

## 🤖 AI Quest Generation

The Claude API call lives in `functions/generateQuest.js` (Firebase Cloud Function). Never call it directly from the frontend.

### Prompt structure to use:
```
System: You are a creative quest generator for a summer challenge app. Generate unique, niche, fun side quests. Never suggest dangerous or illegal activities. Quests should feel like real adventures, not homework.

User: Generate 5 side quests for a user with the following profile:
- Athletic level: {level}
- Hobbies: {hobbies}
- Solo or with friends: {soloOrGroup}
- Has access to: {gear}
- Location type: {location}
- Budget: {budget}
- Requested tier: {tier} (Bronze/Silver/Gold/Platinum/Diamond)

Return JSON only. Format:
[
  {
    "title": "Quest name",
    "description": "2-3 sentence description with the twist/challenge",
    "tier": "Gold",
    "xpReward": 300,
    "tags": ["outdoor", "friends", "water"],
    "estimatedTime": "2-3 hours",
    "requirements": ["access to a pool", "2+ people"]
  }
]
```

### Demo mode fallback:
If `window.DEMO_MODE === true`, skip the API call and return 5 random quests from `data/seed-quests.json` that match the requested tier.

---

## 📱 Page Routing

This is a multi-page app (no SPA router). Navigation works by loading separate HTML files.

| URL | Page | Who can access |
|---|---|---|
| `index.html` | Landing / login | Everyone |
| `pages/onboarding.html` | Personalisation setup | New users only (redirect after first login) |
| `pages/feed.html` | Main quest feed | Logged-in users |
| `pages/quest.html?id={questId}` | Quest detail | Logged-in users |
| `pages/group.html?id={groupId}` | Group page | Group members |
| `pages/profile.html?id={userId}` | Profile | Logged-in users (own or others') |
| `pages/admin.html?group={groupId}` | Admin panel | Group admin only |
| `pages/leaderboard.html?group={groupId}` | Leaderboard | Group members |

Pass IDs via URL query params. Read them with `new URLSearchParams(window.location.search)`.

---

## 🏆 XP & Tier System

| Tier | XP Reward Range | Visual |
|---|---|---|
| Bronze | 50–100 XP | Bronze sword icon |
| Silver | 150–250 XP | Silver shield icon |
| Gold | 300–500 XP | Gold crown icon |
| Platinum | 600–900 XP | Platinum crossed swords |
| Diamond | 1000–2000 XP | Diamond + crown |

### XP Penalties (moderation)
- First offence: −50 XP
- Second offence: −150 XP + 3-day ban
- Third offence: −300 XP + 7-day ban
- Fourth offence: group removal

---

## 🔔 Notification Types

All notifications stored in `users/{userId}/notifications/` subcollection.

| Type | Trigger |
|---|---|
| `join_request` | Someone requests to join admin's group |
| `quest_approved` | Admin approves a submitted quest |
| `daily_quest` | New daily surprise quest dropped |
| `quest_expiring` | Claimed quest deadline is in 2 hours |
| `streak_warning` | User hasn't completed a quest in 6 days |
| `report_resolved` | Admin has resolved a report |
| `punishment_issued` | User has been punished |
| `reaction` | Someone reacted to your proof photo |

---

## ✅ Build Order (Recommended)

Build features in this order to always have a working demo at each step:

1. Firebase setup + Google auth + basic HTML shell
2. Onboarding form (save personalisation to Firestore)
3. Quest feed (static seed data, no AI yet)
4. Quest detail page + claim + timer
5. Photo upload + proof submission
6. Group creation + join by code + admin approval
7. XP system + leaderboard
8. Streak tracking
9. Admin panel (punishments, quest approval)
10. Reporting system
11. Reactions on photos
12. Badges + profile stats page
13. Daily surprise quest + seasonal quests
14. Quest chains + Boss quest mode
15. AI quest generation (Claude API via Cloud Function)
16. Desktop responsive polish
17. Notification system

---

## 🐛 Common Mistakes to Avoid

- **Don't use `innerHTML` with user-generated content** — use `textContent` or sanitize first to prevent XSS
- **Don't forget `async/await`** on all Firestore calls — they are all async
- **Don't store sensitive data in Firestore without rules** — always check security rules before adding a new collection
- **Don't forget loading states** — every Firestore read should show a loading skeleton, not a blank screen
- **Don't hardcode group IDs or user IDs** — always read from Firebase auth state or URL params
- **Don't make the pixel font too large** — Press Start 2P is very wide; keep it under 14px for most uses

---

## 🧪 Testing in Demo Mode

To run in demo mode (no real API calls):
1. Add `?demo=true` to any URL, or set `window.DEMO_MODE = true` in the browser console
2. Demo mode uses `data/seed-quests.json` for quests
3. Demo mode still uses real Firebase auth + Firestore (groups, XP, photos all work for real)
4. This is the mode to use when presenting to class

---

*Last updated: project kickoff. Keep this file updated as the project evolves.*
