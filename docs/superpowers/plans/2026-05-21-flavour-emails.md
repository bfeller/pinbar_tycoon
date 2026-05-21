# Flavour Emails — Pinball History Milestones

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 8 narrative emails spanning 1975–2021 that mark real pinball history milestones, delivered through 4 character voices with 2 interactive choice points.

**Architecture:** Three new email files (`terry.js`, `mick.js`, `cass.js`) plus two additions to `gary.js`, all wired into the existing `EMAIL_DEFS` barrel. Two new effect handlers in `handleEmailChoice`. One new piece of game state (`hasStockedParts`) for the Williams parts-hoard mechanic. One line change to pass `staff` into email trigger context so Mick's emails can gate on the repairman being hired.

**Tech Stack:** React (useState), vanilla JS email data files, existing email trigger/effect pattern in `App.jsx`.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `src/App.jsx` | Add `staff` to `emailState`; add `hasStockedParts` state + save + load; update `repairMachine`; add `terry_machine` + `mick_stockpile` to `handleEmailChoice` |
| Create | `src/data/emails/terry.js` | Terry Baines emails (`terry_01`, `terry_02`) |
| Create | `src/data/emails/mick.js` | Mick Darrow emails (`mick_01`, `mick_02`) |
| Create | `src/data/emails/cass.js` | Cass Elmore emails (`cass_01`, `cass_02`) |
| Modify | `src/data/emails/gary.js` | Append `gary_gorgar` and `gary_addams` |
| Modify | `src/data/emails/index.js` | Import and spread `terryEmails`, `mickEmails`, `cassEmails` |

---

## Task 1: Add `staff` to email trigger context

**Files:**
- Modify: `src/App.jsx` (line 967)

- [ ] **Step 1: Edit `emailState` in `App.jsx`**

Find this line (around line 967):
```js
const emailState = { time: newTime, popularity, cash, machines, sentIds, completedCourseIds };
```
Replace with:
```js
const emailState = { time: newTime, popularity, cash, machines, sentIds, completedCourseIds, staff };
```

- [ ] **Step 2: Verify build**

```bash
cd /home/brizzlefeller/Code/pinbar_tycoon && npm run build 2>&1 | tail -5
```
Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: pass staff into email trigger context"
```

---

## Task 2: Add `hasStockedParts` state

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add `useState` near the other boolean state declarations (around line 73)**

Find this block (near the other `useState` declarations):
```js
const [repairsRemaining, setRepairsRemaining] = useState(5);
```
Add the new state on the line after it:
```js
const [hasStockedParts, setHasStockedParts] = useState(false);
```

- [ ] **Step 2: Add to auto-save object**

Find the save object (around line 249):
```js
      repairsRemaining, upgrades, enrolledCourses, inbox,
```
Replace with:
```js
      repairsRemaining, hasStockedParts, upgrades, enrolledCourses, inbox,
```

- [ ] **Step 3: Add to `handleContinue` load block**

Find this line in `handleContinue` (around line 306):
```js
    setRepairsRemaining(s.repairsRemaining ?? 5);
```
Add the load call on the line after it:
```js
    setHasStockedParts(s.hasStockedParts ?? false);
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add hasStockedParts game state"
```

---

## Task 3: Wire `hasStockedParts` into `repairMachine`

**Files:**
- Modify: `src/App.jsx` (`repairMachine` function, around line 557)

- [ ] **Step 1: Update `repairMachine` to skip cost when parts are stocked**

Find the full `repairMachine` function:
```js
  const repairMachine = (id) => {
    if (dayState === 'RUNNING') return;
    const m = machines.find(mac => mac.id === id);
    if (!m || m.durability >= 100 || repairsRemaining <= 0) return;

    const damageToFix = Math.min(repairsRemaining, 100 - m.durability);
    if (damageToFix <= 0) return;
    const cost = damageToFix * 10;

    if (cash >= cost) {
      setCash(c => c - cost);
      setRepairsRemaining(r => r - damageToFix);
      setMachines(prev => prev.map(mac => mac.id === id ? { ...mac, durability: mac.durability + damageToFix } : mac));
    }
  };
```
Replace with:
```js
  const repairMachine = (id) => {
    if (dayState === 'RUNNING') return;
    const m = machines.find(mac => mac.id === id);
    if (!m || m.durability >= 100 || repairsRemaining <= 0) return;

    const damageToFix = Math.min(repairsRemaining, 100 - m.durability);
    if (damageToFix <= 0) return;
    const cost = hasStockedParts ? 0 : damageToFix * 10;

    if (cash >= cost) {
      setCash(c => c - cost);
      if (hasStockedParts) setHasStockedParts(false);
      setRepairsRemaining(r => r - damageToFix);
      setMachines(prev => prev.map(mac => mac.id === id ? { ...mac, durability: mac.durability + damageToFix } : mac));
    }
  };
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: free repair when hasStockedParts is set"
```

---

## Task 4: Create `terry.js`

**Files:**
- Create: `src/data/emails/terry.js`

- [ ] **Step 1: Create the file**

```js
// ── Terry Baines — Tri-State Coin-Op ─────────────────────────────────────────
// Relentlessly optimistic distributor. Sells the future of the industry with
// equal enthusiasm every time. Slightly nervous you'll ask about the price.

export const terryEmails = [

  {
    id: 'terry_01',
    from: 'Terry Baines',
    address: 't.baines@tristatecoinop.com',
    subject: 'The Future Has Arrived (And I Have One In The Van)',
    body:
`Hello there.

Terry Baines here, Tri-State Coin-Op. I don't know if we've spoken before but I've got something I think you should see.

It's called the Spirit of '76. Brand new from Micro Games. Solid-state electronics — no relays, no chimes, no mechanical switching gear. Just circuit boards. I don't fully understand the circuit boards but I've been told by someone who does that they are Very Reliable.

Now here's the thing: I can do you one at nine hundred dollars. Yes, nine hundred. A machine like this should be three times that. I know a fellow at the warehouse — I won't say more than that, and honestly you shouldn't ask. Point is the number is nine hundred and the machine is real.

It is the future of this industry. You have my word on that.

Let me know either way. I'll keep it in the van until Friday.

Terry Baines
Tri-State Coin-Op
"We Move Machines"`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1975 && time.week >= 3 && !sentIds.has('terry_01'),
    choices: [
      { label: 'Buy it ($900)', effectId: 'terry_machine' },
      { label: 'Not for me',    effectId: null },
    ],
    expiresAfterDays: 3,
    event: {
      label: 'Sales Pitch',
      severity: 'neutral',
      message: 'A distributor has an interesting offer. Check your inbox.',
    },
  },

  {
    id: 'terry_02',
    from: 'Terry Baines',
    address: 't.baines@tristatecoinop.com',
    subject: 'BIG NEWS — INDUSTRY UPDATE',
    body:
`Hello —

I don't normally write in capitals but I feel the situation warrants it.

PINBALL IS LEGAL IN NEW YORK.

A young fellow called Roger Sharpe went in front of the city council with a machine and called his shots. Stood right there and said "watch this" and then DID it. They had to agree it was skill. Thirty years of bans — thirty years! — and one man with steady hands changed everything.

They're going to have to let the machines out of the back rooms now. Into the windows. Into the light. I told my wife and she said "that's nice, Terry." It is not "nice." It is HISTORIC.

I'm going to do something to celebrate. I'm not sure what yet. Probably a cake.

Anyway. Happy days.

Terry Baines
Tri-State Coin-Op
"We Move Machines"`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1976 && sentIds.has('terry_01') && !sentIds.has('terry_02'),
    choices: null,
  },

];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds (file is not yet imported, so no runtime effect yet — that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/data/emails/terry.js
git commit -m "feat: add Terry Baines email arc (1975-1976)"
```

---

## Task 5: Create `mick.js`

**Files:**
- Create: `src/data/emails/mick.js`

- [ ] **Step 1: Create the file**

```js
// ── Mick Darrow — M.D. Amusements Repair ─────────────────────────────────────
// The bar's repairman. Gruff, practical, bills by the hour.
// Arc: young and annoyed (1980) → veteran and grim (1999).
// Emails only fire after the repairman has been hired (staff.repairman === true).

export const mickEmails = [

  {
    id: 'mick_01',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'service note – Black Knight',
    body:
`Hi.

Just flagging something from last night.

The Black Knight. Two levels. I know it's impressive. It's also a nightmare to work on.

The upper playfield rubber rings require removing panel C, then panel A, in that order, before you can get to panel B. The manual says nothing about this. I found out the hard way. Panel B has a sharp edge on the left side that I have also now found the hard way.

I'm noting it for billing purposes. If that machine needs regular rubber work — and it will — factor in an extra thirty minutes per service. That's just how it is.

No complaints. Just information.

Mick`,
    trigger: ({ time, sentIds, staff }) =>
      time.year >= 1980 && staff.repairman && !sentIds.has('mick_01'),
    choices: null,
  },

  {
    id: 'mick_02',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'williams',
    body:
`Hi.

I'm going to keep this short.

Williams is done. Not officially yet, but I've got contacts in the supply chain and I know what a parts drought looks like before it happens. It's happening now.

Order whatever you need this week. Not next week. This week. I'd start with flipper mechs, solenoid coils, and playfield plastics — those go first and they go fast.

I know this sounds dramatic. I've been doing this for twenty years. I'm not being dramatic.

Mick`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1998 && sentIds.has('mick_01') && !sentIds.has('mick_02'),
    choices: [
      { label: 'Order spares now ($400)', effectId: 'mick_stockpile' },
      { label: 'Wait and see',            effectId: null },
    ],
    expiresAfterDays: 5,
    event: {
      label: 'Industry Warning',
      severity: 'bad',
      message: 'Mick has heard something. Check your inbox.',
    },
  },

];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/data/emails/mick.js
git commit -m "feat: add Mick Darrow email arc (1980, 1998)"
```

---

## Task 6: Add Gary emails to `gary.js`

**Files:**
- Modify: `src/data/emails/gary.js`

Append both new emails to the `garyEmails` array before the closing `];`. Insert them in chronological order: `gary_gorgar` after `gary_04` (1980s Gary), `gary_addams` after `gary_gorgar`.

- [ ] **Step 1: Add `gary_gorgar` and `gary_addams`**

Find the closing of the `garyEmails` array:
```js
];
```
(The last entry before it is `gary_09`.) Add the two new entries before the `];`:

```js
  {
    id: 'gary_gorgar',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the machine that speaks',
    body:
`Hi.

I wanted to mention something about the new machine. The one that talks.

I have now played it three times and I want to be clear that I am not unsettled by it. I am simply observant. The observation is: it says things. Mid-game. Unprompted. I was not expecting this and I have noted my reaction to it in the log under "notable moments," which is a new section.

Two other customers left while I was there. One of them said something to the bartender that I couldn't hear but his expression was not positive. The bartender looked, I would say, conflicted.

Dave has a theory about why a machine would be built to speak. I have noted the theory in the log but I want to be clear that I do not endorse it.

I will be in on Thursday as usual.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1979 && sentIds.has('gary_03') && !sentIds.has('gary_gorgar'),
    choices: null,
  },

  {
    id: 'gary_addams',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'a data observation (re: The Addams Family)',
    body:
`Hi.

I have updated the spreadsheet.

I have been tracking Tuesday-night revenue for some time now, as you may be aware. I want to share a finding.

The Addams Family machine is generating more in quarters on Tuesday nights than the bar makes selling beer on Tuesday nights. I have the figures. I have also made a graph. It is a bar chart, which I appreciate is slightly ironic in this context.

I showed my wife. She asked why I have a graph about a pinball machine's beer-to-quarter ratio. I told her it was for "contextual analysis." She said "of course it is, Gary."

I am not sure what you should do with this information. I just felt you should have it.

The log entry is quite long.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1992 && sentIds.has('gary_gorgar') && !sentIds.has('gary_addams'),
    choices: null,
  },

```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/data/emails/gary.js
git commit -m "feat: add Gary emails for Gorgar (1979) and Addams Family (1992)"
```

---

## Task 7: Create `cass.js`

**Files:**
- Create: `src/data/emails/cass.js`

- [ ] **Step 1: Create the file**

```js
// ── Cass Elmore — Pinball Collective ─────────────────────────────────────────
// Barcade-era enthusiast. Arrives in 2013 convinced pinball is the future.
// Correct about this, which she doesn't hide.

export const cassEmails = [

  {
    id: 'cass_01',
    from: 'Cass Elmore',
    address: 'cass@pinballcollective.co',
    subject: 'have you SEEN the Jersey Jack machine',
    body:
`Hi —

Cass here, Pinball Collective. I think we met at the operator meetup? Either way.

Have you seen The Wizard of Oz? Jersey Jack. Twenty-six inch LCD screen, full RGB lighting, completely programmable. It is a completely different category of machine. Not better or worse than your classics, just — different. The authentic experience is still the authentic experience, but this is what the new generation is coming in for.

The barcade thing is real. I know people have been saying it for two years but now it's actually real. Chicago, Austin, Brooklyn — full bars built around games. Not arcade bars. Barcades. Different vibe, different spend, different crowd.

I'd love to talk about the venue rebrand conversation if you're open to it. I've put together a mood board. I'll send it over separately.

Cass
Pinball Collective`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2013 && !sentIds.has('cass_01'),
    choices: null,
  },

  {
    id: 'cass_02',
    from: 'Cass Elmore',
    address: 'cass@pinballcollective.co',
    subject: 'FWD: Stern Insider Connected — Operator Action Required',
    body:
`---------- Forwarded message ----------
From: Stern Pinball Operator Relations <operators@sternpinball.com>
Subject: Insider Connected — Network Requirement Notice

Dear Operator,

As part of the Insider Connected rollout with GODZILLA and future titles, all participating machines require a stable Wi-Fi connection to:

  • Receive software and rule-set updates
  • Sync player profiles and achievements
  • Support global and local leaderboard functionality

Please ensure network access is available at machine locations. A minimum of 10 Mbps is recommended. Full setup documentation is available at the Insider Connected operator portal.

Thank you for your continued partnership.

Stern Pinball Operator Relations
---------- End of forwarded message ----------

honestly worth it
the leaderboard stuff is huge right now, players are actually coming back specifically for their scores
also hi, it's been a while

Cass`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2021 && sentIds.has('cass_01') && !sentIds.has('cass_02'),
    choices: null,
  },

];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/data/emails/cass.js
git commit -m "feat: add Cass Elmore email arc (2013, 2021)"
```

---

## Task 8: Add choice effect handlers to `handleEmailChoice`

**Files:**
- Modify: `src/App.jsx` (`handleEmailChoice`, around line 573)

- [ ] **Step 1: Add `terry_machine` and `mick_stockpile` handlers**

Find the end of the `reg_machine` block and the closing of `handleEmailChoice`:
```js
      }
    }
    setInbox(prev => prev.map(e => e.id === emailId ? { ...e, read: true, choiceMade: true } : e));
  };
```
Replace with:
```js
      }
    } else if (effectId === 'terry_machine') {
      // Terry's Spirit of '76: costs $900, solid-state machine at 70% durability
      if (cash >= 900) {
        setCash(c => c - 900);
        const backroomMachines = machines.filter(m => m.room === 'backroom');
        let placeCoords = findFreeSpace('pinball', 'N', backroomMachines, BACKROOM_COLS, backroomRows);
        let assignedRoom = 'backroom';
        if (!placeCoords) {
          const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
          placeCoords = findFreeSpace('pinball', 'N', mainMachines, GRID_COLS, GRID_ROWS, DOOR_POS);
          assignedRoom = 'main';
        }
        if (placeCoords) {
          setMachines(prev => [...prev, {
            id: 'terry_spirit76-' + Date.now(),
            type: 'pinball',
            name: 'Spirit of 76',
            year: 1976,
            durability: 70,
            locationCount: 0,
            x: placeCoords.x, y: placeCoords.y,
            room: assignedRoom,
            orientation: 'N',
          }]);
        }
      }
    } else if (effectId === 'mick_stockpile') {
      // Mick's parts run: costs $400, next manual repair is free
      if (cash >= 400) {
        setCash(c => c - 400);
        setHasStockedParts(true);
      }
    }
    setInbox(prev => prev.map(e => e.id === emailId ? { ...e, read: true, choiceMade: true } : e));
  };
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add terry_machine and mick_stockpile email choice handlers"
```

---

## Task 9: Wire everything into `index.js`

**Files:**
- Modify: `src/data/emails/index.js`

- [ ] **Step 1: Add imports and spreads**

Find the current imports at the top of `index.js`:
```js
import { quillEmails }     from './quill';
import { garyEmails }      from './gary';
import { regEmails }       from './reg';
import { regSpyEmails }    from './reg_spy';
import { flipperEmails }   from './flipper';
import { crabtreeEmails }  from './crabtree';
import { vossEmails }      from './voss';
import { corporateEmails }  from './corporate';
import { universityEmails } from './university';
```
Replace with:
```js
import { quillEmails }     from './quill';
import { garyEmails }      from './gary';
import { regEmails }       from './reg';
import { regSpyEmails }    from './reg_spy';
import { flipperEmails }   from './flipper';
import { crabtreeEmails }  from './crabtree';
import { vossEmails }      from './voss';
import { corporateEmails }  from './corporate';
import { universityEmails } from './university';
import { terryEmails }     from './terry';
import { mickEmails }      from './mick';
import { cassEmails }      from './cass';
```

Find the `EMAIL_DEFS` array:
```js
export const EMAIL_DEFS = [
  ...quillEmails,
  ...garyEmails,
  ...regEmails,
  ...regSpyEmails,
  ...flipperEmails,
  ...crabtreeEmails,
  ...vossEmails,
  ...corporateEmails,
  ...universityEmails,
];
```
Replace with:
```js
export const EMAIL_DEFS = [
  ...quillEmails,
  ...garyEmails,
  ...regEmails,
  ...regSpyEmails,
  ...flipperEmails,
  ...crabtreeEmails,
  ...vossEmails,
  ...corporateEmails,
  ...universityEmails,
  ...terryEmails,
  ...mickEmails,
  ...cassEmails,
];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: build succeeds.

- [ ] **Step 3: Smoke test — start the dev server and verify emails fire**

```bash
npm run dev
```

Open the game in a browser. Use the browser console to inspect or fast-forward. Check:
- In year 1975 week 3+, Terry's pitch arrives in the inbox with a "Buy it / Not for me" choice
- Accepting Terry's offer deducts $900 and adds Spirit of 76 to the floor/backroom
- After hiring a repairman, in year 1980+, Mick's service note arrives
- In year 1998+, Mick's Williams warning arrives with the stockpile choice
- Accepting Mick's choice deducts $400 and sets the free-repair flag (next repair costs $0)
- In year 1979+, Gary's Gorgar email arrives (after `gary_03` is in inbox)
- In year 1992+, Gary's Addams Family email arrives (after `gary_gorgar`)
- In year 2013+, Cass's LCD email arrives
- In year 2021+, Cass's Stern Wi-Fi forward arrives

- [ ] **Step 4: Commit**

```bash
git add src/data/emails/index.js
git commit -m "feat: register terry, mick, and cass emails in EMAIL_DEFS"
```
