# Flavour Emails — Pinball History Milestones

**Date:** 2026-05-21  
**Status:** Approved

## Overview

Eight new flavour emails that mark real pinball history milestones (1975–2021), delivered through four character voices. The emails are mostly narrative flavour, with two selective choice points where a decision feels natural and mechanically grounded.

## New Characters

### Terry Baines — Tri-State Coin-Op
- **File:** `src/data/emails/terry.js`
- **Address:** `t.baines@tristatecoinop.com`
- **Voice:** Relentlessly optimistic 1970s salesman. Lots of exclamation marks. Uses phrases like "the future of the industry" unironically. Slightly nervous you'll push back on the price.
- **Arc:** Appears twice in the 1970s. No later appearances — the modern era is handled by a different character.

### Mick Darrow — M.D. Amusements Repair
- **File:** `src/data/emails/mick.js`
- **Address:** `mick@mdarrow-repairs.co.uk`
- **Voice:** Gruff, practical, bills by the hour. 1980: young and annoyed, invoice-style complaints about the specific indignity of two-level access panels. 1999: same blunt delivery, but 19 years of the industry in his voice — not panicked, which makes the warning worse.
- **Arc:** Starts as the hired repairman, becomes a trusted friend over decades. Emails are gated on `staff.repairman === true`.
- **Dependency:** Requires `staff` to be added to the email trigger context in `App.jsx`.

### Cass Elmore — Pinball Collective
- **File:** `src/data/emails/cass.js`
- **Address:** `cass@pinballcollective.co`
- **Voice:** Barcade-era enthusiast. Uses "authentic" and "the space" without irony. Tech-forward. Genuinely believes pinball is the future, which in 2013 it kind of is. Deliberate contrast with Terry — same evangelical energy, completely different era.
- **Arc:** Two emails spanning the LCD revolution (2013) and Stern's connected era (2021).

### Gary Kowalski (additions to existing arc)
- **File:** `src/data/emails/gary.js` (appended)
- Two new emails slotting into Gary's existing arc at 1979 and 1992.

---

## Email Definitions

### `terry_01` — The Solid-State Pitch (1975)
- **Trigger:** `time.year >= 1975 && time.week >= 3 && !sentIds.has('terry_01')`
- **Subject:** Something like "The Future Has Arrived (And I Have One In The Van)"
- **Content:** Terry pitches the Spirit of '76 — the first solid-state machine. Circuit boards, no relays, no chimes. He promises they break down less. He admits he's not 100% sure how they work but has been told they are "very reliable." The machine is listed cheap because he knows a guy at the warehouse — he doesn't elaborate further and the reader should not ask.
- **Choice:** `{ label: "Buy it ($900)", effectId: 'terry_machine' }` / `{ label: "Not for me", effectId: null }`
- **Effect `terry_machine`:** Deducts $900 from cash. Adds a "Spirit of 76" machine (year 1976, durability 70) to backroom or main floor — same placement logic as `reg_machine`. Spirit of 76 is confirmed present in `pinball_machines.json`.
- **Event:** `{ label: 'Sales Pitch', severity: 'neutral', message: 'A distributor has an interesting offer. Check your inbox.' }`

### `terry_02` — The Ban Is Lifted (1976)
- **Trigger:** `time.year >= 1976 && sentIds.has('terry_01') && !sentIds.has('terry_02')`
- **Subject:** Something like "BIG NEWS from the industry"
- **Content:** Celebratory note. Roger Sharpe played a machine in front of the New York City council and called his shots. The ban is lifted. Terry is practically incoherent with excitement. Time to move the machines out of the back room and into the front window. He is already planning a party. He will not be having a party.
- **Choices:** null

### `gary_gorgar` — The Machine That Speaks (1979)
- **Trigger:** `time.year >= 1979 && sentIds.has('gary_03') && !sentIds.has('gary_gorgar')`
- **Subject:** "a thing about the new machine"
- **Content:** Gary has been observing the Gorgar machine for three visits. Customers are unsettled. The bartender has been spooked during closing. Gary himself is not scared, but he has filled several log pages and acknowledges the log entry is "longer than usual." Dave has a theory. Gary has noted it in the log but does not endorse it. Gary is coming in on Thursday regardless.
- **Choices:** null

### `mick_01` — Two-Level Complaint (1980)
- **Trigger:** `time.year >= 1980 && staff.repairman && !sentIds.has('mick_01')`
- **Subject:** "service note – Black Knight"
- **Content:** Invoice/note-style email. Mick has looked at the Black Knight. The two-level playfield means the rubber rings on the upper level require removing three panels in a specific order that the manual does not adequately explain. He has noted this for future billing purposes. He is not complaining. This is a professional observation. (He is complaining.)
- **Choices:** null

### `gary_addams` — The Addams Family Numbers (1992)
- **Trigger:** `time.year >= 1992 && sentIds.has('gary_gorgar') && !sentIds.has('gary_addams')`
- **Subject:** "a data observation"
- **Content:** Gary has updated the spreadsheet. The Addams Family machine is generating more in quarters on Tuesday nights than the bar makes selling beer. He has graphed this. He is not sure what to do with this information but felt the owner should have it. His wife asked why he has a graph about a pinball machine's beer-to-quarter ratio. He told her it was for "contextual analysis." The log entry is quite long.
- **Choices:** null

### `mick_02` — Williams Is Cooked (1998)
- **Trigger:** `time.year >= 1998 && sentIds.has('mick_01') && !sentIds.has('mick_02')`
- **Subject:** "williams"
- **Content:** Short, direct. Mick has been hearing things. Williams is done — not officially yet, but he knows the supply chain and it's cooked. He tells the owner to order whatever parts they need now. He means this week. He's not being dramatic. He lists three specific parts to prioritise. He signs off without his usual complaints about access panels, which is more alarming than anything he wrote.
- **Choice:** `{ label: "Order spares now ($400)", effectId: 'mick_stockpile' }` / `{ label: "Wait and see", effectId: null }`
- **Effect `mick_stockpile`:** Deducts $400 from cash. Sets a new `hasStockedParts` boolean in game state (new `useState(false)` in `App.jsx`, saved/loaded with the rest of game state). When `hasStockedParts` is true, the next manual repair action costs $0 instead of the normal price, then clears the flag. Implementation requires checking `hasStockedParts` in the repair cost handler and clearing it after use.
- **Event:** `{ label: 'Industry Warning', severity: 'bad', message: 'Mick has heard something. Check your inbox.' }`
- **Timing note:** Fires at year >= 1998, two years before `reg_millennium` fires at year >= 2000. Serves as foreshadowing.

### `cass_01` — The LCD Revolution (2013)
- **Trigger:** `time.year >= 2013 && !sentIds.has('cass_01')`
- **Subject:** "have you SEEN the Jersey Jack machine"
- **Content:** Cass is excited about The Wizard of Oz — 26-inch LCD, full RGB lighting, the works. She uses "authentic experience" twice and "the space" once. She asks if the owner has considered a full venue rebrand now that the barcade moment is here. She attaches a mood board. She has not attached the mood board. She says she'll send it separately. She will not send it separately.
- **Choices:** null

### `cass_02` — Stern Wants Wi-Fi (2021)
- **Trigger:** `time.year >= 2021 && sentIds.has('cass_01') && !sentIds.has('cass_02')`
- **Subject:** "FWD: Stern Insider Connected — Operator Action Required"
- **Content:** Cass has forwarded an official Stern email explaining that machines now need Wi-Fi to download software updates, sync global leaderboards, and support Insider Connected. The Stern email is formal and full of bullet points. Cass adds three lines at the bottom: "honestly worth it / the leaderboard stuff is huge right now / also hi, it's been a while."
- **Choices:** null

---

## Code Changes

### 1. `src/App.jsx` — line 967
Add `staff` to the email trigger context object:
```js
const emailState = { time: newTime, popularity, cash, machines, sentIds, completedCourseIds, staff };
```

### 2. New files
- `src/data/emails/terry.js` — exports `terryEmails`
- `src/data/emails/mick.js` — exports `mickEmails`
- `src/data/emails/cass.js` — exports `cassEmails`

### 3. `src/data/emails/gary.js`
Append `gary_gorgar` and `gary_addams` to the `garyEmails` array. Maintain chronological order within the array.

### 4. `src/data/emails/index.js`
Import and spread `terryEmails`, `mickEmails`, `cassEmails`.

### 5. Choice effects
- `terry_machine`: handled by existing email choice effect system, deducts $900.
- `mick_stockpile`: deducts $400 and sets a `hasStockedParts` flag. Requires wiring into the repair flow to grant one free repair. Implementation detail to be resolved in the plan.

---

## Trigger Index

| ID | Year | Dependencies | Choices |
|----|------|-------------|---------|
| `terry_01` | >= 1975 wk 3 | none | buy machine ($900) |
| `terry_02` | >= 1976 | `terry_01` sent | none |
| `gary_gorgar` | >= 1979 | `gary_03` sent | none |
| `mick_01` | >= 1980 | `staff.repairman === true` | none |
| `gary_addams` | >= 1992 | `gary_gorgar` sent | none |
| `mick_02` | >= 1998 | `mick_01` sent | stockpile parts ($400) |
| `cass_01` | >= 2013 | none | none |
| `cass_02` | >= 2021 | `cass_01` sent | none |

---

## Out of Scope

- No changes to existing email arcs (Reg, Gary's existing emails, Flipper, Voss, Crabtree).
- The `terry_machine` purchase adds a Spirit of 76 (1976) machine to inventory, following the same placement logic as `reg_machine`.
- The 1976 Roger Sharpe historical detail is conveyed through Terry's voice, not as a separate narrator.
