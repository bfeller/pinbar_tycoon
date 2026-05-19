# Liquor Licensing Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-tier "Liquor Licensing" university upgrade that extends the in-game operating day from 15s → 20s → 25s → 30s.

**Architecture:** Add the upgrade definition and completion email to the existing data arrays, wire a `dayLengthSeconds` value through `upgradeValues`, and replace the two hardcoded `DAY_LENGTH_SECONDS` usages in the simulation with the dynamic value. No new files needed.

**Tech Stack:** React 18, Vite, plain JS modules.

---

## Files

| File | Change |
|------|--------|
| `src/data/upgrades.js` | Append new entry to `UPGRADE_DEFS` |
| `src/App.jsx` | `DEFAULT_UPGRADES` constant, `useState` initializer, `upgradeValues` object, import |
| `src/hooks/useGameEngine.js` | Replace `DAY_LENGTH_SECONDS` in macro tick with dynamic value |
| `src/simulation/customerAI.js` | Replace `DAY_LENGTH_SECONDS` in closing-time check with dynamic value |
| `src/data/emails/university.js` | Append completion email entry |

---

### Task 1: Add the upgrade definition

**Files:**
- Modify: `src/data/upgrades.js` — append to `UPGRADE_DEFS`
- Modify: `src/App.jsx:51` — `DEFAULT_UPGRADES` constant
- Modify: `src/App.jsx:80-89` — `useState` initializer

- [ ] **Step 1: Add the upgrade entry to `UPGRADE_DEFS`**

  In `src/data/upgrades.js`, append inside the `UPGRADE_DEFS` array (after the closing `}` of the `charm` entry, before the final `]`):

  ```js
  {
    id: 'liquor_licensing',
    name: 'Liquor Licensing',
    icon: '📋',
    flavor: 'Cut through the red tape. Extend your operating hours with the proper permits.',
    effect: level => `Operating hours: ${15 + level * 5}s per day`,
    maxLevel: 3,
    costs: [800, 2000, 4500],
    duration: 6,
  },
  ```

- [ ] **Step 2: Add `liquor_licensing: 0` to `DEFAULT_UPGRADES`**

  In `src/App.jsx` line 51, the full line becomes:

  ```js
  const DEFAULT_UPGRADES = { electronics: 0, mixology: 0, quantum: 0, marketing: 0, psychology: 0, electrical_eng: 0, social_media: 0, supply_chain: 0, charm: 0, liquor_licensing: 0 };
  ```

- [ ] **Step 3: Add `liquor_licensing: 0` to the `useState` initializer**

  In `src/App.jsx`, the `upgrades` state block (lines 80–89) becomes:

  ```js
  const [upgrades, setUpgrades] = useState({
    electronics: 0,    // +2% repair capacity per level (max 3)
    mixology: 0,       // bartender 40%/100% faster (max 2)
    quantum: 0,        // +1 backroom row per level (max 3)
    marketing: 0,      // more customer spawns per level (max 2)
    psychology: 0,     // longer customer patience per level (max 2)
    electrical_eng: 0, // 10% less machine damage per level (max 3)
    social_media: 0,   // +50% popularity gain per level (max 2)
    supply_chain: 0,   // 10% purchase discount per level (max 2)
    liquor_licensing: 0, // +5s operating day per level (max 3)
  });
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/data/upgrades.js src/App.jsx
  git commit -m "feat: add liquor_licensing upgrade definition and initial state"
  ```

---

### Task 2: Wire the dynamic day length

**Files:**
- Modify: `src/App.jsx:3` — add `DAY_LENGTH_SECONDS` to constants import
- Modify: `src/App.jsx:131-141` — add `dayLengthSeconds` to `upgradeValues`
- Modify: `src/hooks/useGameEngine.js:77` — replace constant with dynamic value
- Modify: `src/simulation/customerAI.js` — replace constant in closing-time check

- [ ] **Step 1: Import `DAY_LENGTH_SECONDS` in `App.jsx`**

  Line 3 of `src/App.jsx` currently reads:

  ```js
  import { GRID_COLS, GRID_ROWS, DOOR_POS, BACKROOM_COLS, BACKROOM_ROWS } from './constants';
  ```

  Change it to:

  ```js
  import { GRID_COLS, GRID_ROWS, DOOR_POS, BACKROOM_COLS, BACKROOM_ROWS, DAY_LENGTH_SECONDS } from './constants';
  ```

- [ ] **Step 2: Add `dayLengthSeconds` to `upgradeValues`**

  In `src/App.jsx`, the `upgradeValues` object (lines 131–141) becomes:

  ```js
  const upgradeValues = {
    patienceTicks: 30 + upgrades.psychology * 15,
    spawnBoost: upgrades.marketing * 0.08,
    damageReduction: upgrades.electrical_eng * 0.10,
    bartenderSpeed: 1 + upgrades.mixology * 0.5,
    charm: upgrades.charm,
    drinkPatienceMult: staff.server > 0 ? 2 : 1,
    drinkRevenue: staff.server > 0 ? 20 : 15,
    repairmanActive: staff.repairman,
    repairmanCoverage: staff.repairman ? 10 : 0,
    dayLengthSeconds: DAY_LENGTH_SECONDS + upgrades.liquor_licensing * 5,
  };
  ```

- [ ] **Step 3: Use dynamic day length in `useGameEngine.js`**

  In `src/hooks/useGameEngine.js`, inside the macro tick callback (the `setInterval` at the 1000ms interval), locate:

  ```js
  if (timer >= DAY_LENGTH_SECONDS) {
  ```

  Replace with:

  ```js
  const dayLen = upgradeValuesRef.current.dayLengthSeconds ?? DAY_LENGTH_SECONDS;
  if (timer >= dayLen) {
  ```

  The existing `import { DOOR_POS, DAY_LENGTH_SECONDS } from '../constants';` at the top of the file stays as-is (it's now the fallback default).

- [ ] **Step 4: Use dynamic day length in `customerAI.js`**

  In `src/simulation/customerAI.js`, inside `tickCustomers`, locate:

  ```js
  } else if (dayTimer >= DAY_LENGTH_SECONDS) {
  ```

  Replace with:

  ```js
  } else if (dayTimer >= (upgradeValues.dayLengthSeconds ?? DAY_LENGTH_SECONDS)) {
  ```

  The existing import `import { DOOR_POS, DAY_LENGTH_SECONDS, GRID_COLS, GRID_ROWS } from '../constants';` at the top stays as-is (fallback).

  `upgradeValues` is already destructured from the context parameter in `tickCustomers`, so no signature change is needed.

- [ ] **Step 5: Commit**

  ```bash
  git add src/App.jsx src/hooks/useGameEngine.js src/simulation/customerAI.js
  git commit -m "feat: wire dynamic dayLengthSeconds through upgradeValues"
  ```

---

### Task 3: Add the completion email

**Files:**
- Modify: `src/data/emails/university.js` — append email entry

- [ ] **Step 1: Append the completion email**

  In `src/data/emails/university.js`, append inside the `universityEmails` array (after the closing `},` of the `uni_charm` entry, before the final `]`):

  ```js
  {
    id: 'uni_liquor_licensing',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Liquor Licensing',
    body:
  `Dear Valued Continuing Education Participant,

  Congratulations. You have completed BUSI 320: Liquor Licensing.

  Your establishment is now, to the best of our knowledge, operating within the parameters described in Module 4. Module 4, you may recall, was the long one. We appreciate your patience with Module 4.

  Your licence is in the mail. Please allow 6 to 8 weeks for delivery. We have been advised not to explain what happens if it doesn't arrive. If it doesn't arrive, please do not reply to this email.

  Based on your completion profile, we recommend the following for continued compliance:

    • LEGL 215: Zoning Law for the Genuinely Confused
      A practical course for business owners who received a letter from the city
      and did not understand it. All modules are titled "What This Means For You."
      What it means for you varies. The course addresses this.

    • LEGL 330: Fire Code Compliance — What's Actually Required
      The instructors of this course want you to know that the full fire code
      is not covered. What is covered is the part that affects you personally.
      Week nine is an exception. Week nine covers things that affect other people.
      Students have called it "clarifying."

    • BUSI 285: Extended Hours Operations — A Practical Overview
      For businesses newly permitted to stay open later. Covers staffing,
      liability, the emotional labour of closing time, and one week on why
      the last customer always arrives at the worst moment. This is not a
      coincidence, the course argues. The data is in week six.

  We wish you extended and compliant operating hours.

  Warmly,
  The Office of Certificates and Continuing Achievement
  Pineview Community College and Technical Institute

  "Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('liquor_licensing') && !sentIds.has('uni_liquor_licensing'),
    choices: null,
  },
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/data/emails/university.js
  git commit -m "feat: add liquor_licensing completion email"
  ```

---

### Task 4: Manual verification

No automated test framework exists in this project. Verify the feature end-to-end in the browser.

- [ ] **Step 1: Start the dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Verify the upgrade card appears**

  Open the game, navigate to the University. Confirm "Liquor Licensing" appears in the course list with icon 📋, cost $800, and effect text "Operating hours: 20s per day" for level 1.

- [ ] **Step 3: Verify the day length changes**

  Enroll in Liquor Licensing. Advance days until the course completes (6 days). Confirm a completion email arrives from `certificates@pcced.edu` with subject "Certificate of Completion: Liquor Licensing".

  Start a new in-game day and observe that the day timer runs for approximately 20 seconds before the bar closes (up from the base 15s).

- [ ] **Step 4: Verify all three tiers**

  Repeat for level 2 ($2000) and level 3 ($4500). Confirm day lengths of ~25s and ~30s respectively. Confirm the upgrade card shows "Operating hours: 25s per day" / "30s per day" at each tier.

- [ ] **Step 5: Verify no regression on base day length**

  Start a new game (or reset upgrades). Confirm the day still runs for ~15s with no Liquor Licensing upgrade active.
