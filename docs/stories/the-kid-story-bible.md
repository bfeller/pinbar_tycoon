# The Kid — Story Bible
*A contained arc, 1976–1979*

---

## The Dan Harmon Story Circle

```
         1. YOU                    2. WANT
    (Bar is stable.          (Something to put it
     Reg is your rival.       on the map. A reason
     Gary is your best        people talk about
     customer.)               this place.)
              \                    /
               \                  /
    8. CHANGED  \                / 3. UNFAMILIAR
  (The bar has   \              /  (Danny Chen, 14,
   a reputation.  \            /   shows up one
   Gary's log has  \          /    Tuesday and plays
   a whole chapter. \        /     for four hours
   Reg knows you     \      /      without stopping.
   differently now.)  \    /       He doesn't buy
                        \  /        a drink.)
                         \/
                    ------+------
                         /\
                        /  \
    7. RETURN           /    \     4. ADAPT
  (The crisis is       /      \   (Player choices:
   resolved. The      /        \   champion Danny,
   bar is a bar       \        /   exploit him, or
   again. The kid     /\      /\   try to stay
   is — depending    /  \    /  \  neutral while
   on choices —      \   \  /   /  Reg, Voss, and
   still here or      \   \/   /   Crabtree all
   a ghost.)           \  /\  /    develop their
                        \/  \/     own angles.)
              /                  \
             /                    \
   6. PAY A PRICE             5. GET WHAT YOU WANTED
  (Crabtree finally           (Danny is the bar's
   arrives on Danny's          identity. Tuesday
   biggest night. The          nights are packed.
   underage situation          Gary is documenting
   can no longer be            history. The bar has
   ignored. Someone            a soul it didn't
   has to make a               have before.)
   decision.)
```

---

## Characters

### Danny Chen — The Kid
Age 14 at start (1976), 17 by resolution (1979). Neighbourhood kid. No dramatic backstory — he just walked in and was extraordinary. Communicates in extremely formal emails typed on a school computer, always signed "Daniel Chen, age [X]." In person, apparently very quiet. Gary has watched him for 47 sessions and heard him say five words. The fifth was "thanks."

### Mr. Chen — Danny's Father
Sends exactly one email. Polite, worried, reasonable. Not a villain. Just a man who has noticed his son is spending a lot of time at a bar. His response to the player's choice will determine whether he becomes an occasional presence or a distant watchful concern.

### Gary Kowalski — The Witness
Gary doesn't know Danny personally but has logged every session. His emails about Danny are the most emotionally raw he's ever written — which means they're almost completely devoid of visible emotion, just numbers and observations that tell the whole story anyway.

### Mick Darrow — The Craftsman
Mick (if hired) notices Danny before anyone thinks to introduce them. His first acknowledgement is a billing complaint about machine wear. By the resolution, Danny is fixing machines alongside him on weekends. Mick's arc with Danny is never stated — it's implied entirely through invoices and one short email at the end.

### Reg Nutter — The Threat
Reg hears about Danny through trade channels (Reg hears everything). His attempt to poach Danny is framed as a business proposition. He genuinely doesn't understand why the player might say no. Gary knew Reg was coming a week before the email arrived.

### Inspector Crabtree — The Complication
Crabtree has been circling since week 18. He keeps getting distracted by philosophical questions. The Big Night is the first time the underage situation and his inspection arrive simultaneously. He will, characteristically, handle it in an unexpected way.

---

## Story Beats

### ACT ONE — ARRIVAL (1976, weeks 5–12)

---

**Beat 1 — First Sighting** `[DECISION: danny_first_visit]`
Danny Chen walks in alone on a Tuesday evening. He sits at a machine, puts in his quarters, and plays. And plays. The place is closing and he's still playing.

*Decision fires (new):*
- **"He can stay till close"** → `danny_welcomed` flag. Arc begins.
- **"Bar's closing, son"** → `danny_turned_away` flag. Danny leaves. But the next morning Gary sends `danny_gary_note` — he was there and watched the whole thing. Player gets one chance to reconsider by replying (the reply is just reading the next email, which implies the player let him back).

*If `danny_turned_away` and player never sees `danny_gary_note`:* arc ends here. Danny never comes back. Gary notes this in a later email as a single sentence about a thing that didn't happen.

---

**Beat 2 — Gary's First Note** `[EMAIL: gary_danny_01]`
`trigger: decisions.danny_welcomed && time.year >= 1976 && time.week >= 7`

Gary has been coming in on Tuesdays for a while. He noticed Danny on his third visit and has been logging since the first. He sends an email with Danny's scores for weeks 1–4. The scores are, Gary reports, "statistically irregular." He does not say the word "incredible." He says "the data is unusual." His uncertainty about whether to feel threatened or awed comes through as a list of numbers.

---

**Beat 3 — Danny's Letter** `[EMAIL: danny_letter_01]`
`trigger: sentIds.has('gary_danny_01') && time.year >= 1976 && time.week >= 10`

Danny sends a formal email from what appears to be a school computer (the header says "Eastfield Secondary School Computing Lab"). He would like to know if he may practise here on Tuesday and Thursday evenings. He notes that he "will purchase a beverage if required" and signs it "Daniel Chen, age 14 and a half."

*Email choice — tone of response:*
- **"Of course — Tuesdays and Thursdays, no problem."** → `danny_welcomed_warmly` flag. Small mechanical effect: nothing. But Danny's final letter will be signed "Danny." The only time.
- **"Yes. We close at 11. Be gone by then."** → `danny_welcomed_formally` flag. Danny's final letter uses his full name, no age.

*Both choices continue the arc. The difference is in what Danny becomes to the player.*

---

### ACT ONE-POINT-FIVE — RISING (1977)

---

**Beat 3.5 — Mick's Invoice** `[EMAIL: mick_danny_note]` *(new)*
`trigger: staff.repairman && sentIds.has('danny_letter_01') && time.year >= 1977 && time.week >= 2 && !sentIds.has('mick_danny_note')`

Mick sends a brief service note. Machine three's left flipper mechanism is taking unusual wear on Tuesday evenings. He has tuned it twice in the past month. He is noting this for billing purposes. He lists the parts. At the very end, after the invoice summary, a single line that isn't invoice language: "Kid plays hard." Then back to billing.

No choice. Just texture — and the first seed of what eventually becomes a mentorship.

---

**Beat 4 — Word Gets Out** `[ARC_EVENT: arc_danny_fame]`
`trigger: sentIds.has('danny_letter_01') && time.year >= 1977 && time.week >= 4`

A small one-time popularity boost (10–15%). The bar has a reputation on Tuesday nights. People come to watch. The effect fires silently — no notification, just the numbers going up. Gary documents it in his log but doesn't send an email about it. The player will notice the numbers.

---

**Beat 4.5 — Gary's Warning** `[EMAIL: gary_danny_warning]` *(new)*
`trigger: sentIds.has('danny_letter_01') && time.year >= 1977 && time.week >= 5 && !sentIds.has('gary_danny_warning')`

Gary noticed a man he didn't recognise asking questions at the bar last Tuesday. The man asked the bartender about "the boy who plays." Gary noted the car in the car park — a Bumper Zone fleet vehicle. He recognised the livery. He has not mentioned this to Danny. He has noted it in the log. His email ends: "I thought you should have this information."

This fires at week >= 5 — one week before Reg's email at week >= 6. The player feels the threat coming before it arrives.

*If `decisions.danny_journalist_featured` is set (requires `decisions` in emailState):* Gary adds a line — "I believe the piece in the Evening Standard may have been a factor. Three copies were left on the bar last week."

---

**Beat 5 — Reg's Inquiry** `[EMAIL: reg_danny_01]`
`trigger: sentIds.has('danny_letter_01') && time.year >= 1977 && time.week >= 6 && sentIds.has('reg_02')`

Reg has heard. He frames it as a "collaborative industry proposal." He's noticed there's a "young talent" at the player's bar and wonders if "talent development could be a shared endeavour." He uses the phrase "mutually beneficial arrangement" twice. He does not say the word "poach."

*Email choice:*
- **"Not interested, Reg"** → `danny_protected_from_reg` flag. Reg responds with `reg_danny_rebuffed` (one line: "Noted. Professional.").
- **"We could discuss something"** → `danny_shared_with_reg` flag. Danny starts splitting his time. Gary notices. Gary sends `gary_danny_betrayal` — possibly the most affecting email in the game. Danny eventually migrates fully to The Bumper Zone. The arc's ending changes significantly.

*This choice lands harder now because the player saw Reg coming in Gary's warning.*

---

**Beat 6 — The Journalist** `[DECISION: danny_journalist]`
`condition: decisions.danny_welcomed && !decisions.danny_journalist_featured && !decisions.danny_journalist_declined && popularity >= 400 && time.year >= 1977`

A woman from the Evening Standard wants to write about "the pinball prodigy." The piece would mention the bar by name. She has already spoken to Gary, who gave her eleven pages of notes and a graph.

*Choices:*
- **"Feature him — good for both of us"** (+25 popularity, `danny_journalist_featured` flag) → The piece runs. Danny becomes locally known. This raises Crabtree's awareness — and, as Gary has already hinted, Reg's.
- **"Keep him out of the papers"** (no effect, `danny_journalist_declined` flag) → Danny stays underground. Gary sends one line: "I told her the graph was private. She understood."

---

**Beat 6.5 — The Piece Runs** `[EMAIL: gary_danny_press]` *(new — only fires if journalist was featured)*
`trigger: decisions.danny_journalist_featured && time.year >= 1977 && time.week >= 14 && !sentIds.has('gary_danny_press')`

Requires `decisions` in emailState (CRITICAL fix).

Gary's email is brief. The article ran Thursday. Eight new faces last Tuesday — he kept count. Three asked specifically about Daniel by name. Gary notes that he was at his usual table. His handwriting is mentioned without explanation. He signs off: "Attendance is up. The log is getting full."

This is the last uncomplicated good news before the complications of 1978 arrive.

---

### ACT TWO — COMPLICATION (1978)

---

**Beat 7 — Danny's Request** `[EMAIL: danny_request_01]` *(new)*
`trigger: staff.repairman && sentIds.has('danny_letter_01') && time.year >= 1978 && time.week >= 1 && !sentIds.has('danny_request_01')`

Danny sends a formal email. He has been observing Mick work on machines during Thursday visits and has developed some questions. He would like to know if he might "observe the repair process on one occasion, if it is not an inconvenience." He has noticed that the left flipper mechanism on machine three has been "misbehaving in a consistent pattern" and believes he understands why. He signs it "Daniel Chen, age 15."

*Email choice:*
- **"Of course — talk to Mick"** → `danny_watched_repairs` flag. In the resolution (Path A), Danny already knows what he's doing when he starts fixing machines alongside Mick. The final letter references this. Mick's response, if the player has him, is implied: the next invoice has a new line item, "apprentice supervision," billed at zero.
- **"Better to keep things simple"** → No flag. The resolution's Mick-Danny moment still happens, but it reads as newer, more tentative.

*If `staff.repairman` is false:* Email does not fire. Danny can't ask about someone who isn't there.

*Ideal gate (requires `decisions` in emailState):* `!decisions.danny_shared_with_reg` — don't fire on the dark path where Danny is already leaving. Acceptable gap: the email fires regardless, but since `danny_watched_repairs` can't be set without the decisions fix, the dark path resolution is unaffected in practice.

---

**Beat 8 — Mr. Chen's Email** `[EMAIL: danny_dad_01]`
`trigger: sentIds.has('danny_letter_01') && time.year >= 1978 && time.week >= 2`

Mr. Chen has noticed Danny is spending significant time at a bar. He is not angry — he is a reasonable man being careful. He would like to understand the situation. He says Danny "speaks highly of the establishment and of a man named Gary."

*Email choice:*
- **"Invite Mr. Chen in — see for yourself"** → `chen_invited` flag. Mr. Chen visits. He becomes a quiet presence — occasionally in on Tuesdays, watching from a corner. His arrival means Crabtree, if he comes, will see a parent present. This changes the Big Night calculus.
- **"Reassure him by email"** → `chen_reassured_email` flag. He accepts. He stays away. He never quite stops worrying.

---

**Beat 9 — Gary's Running Account** `[EMAIL: gary_danny_02]`
`trigger: sentIds.has('danny_dad_01') && time.year >= 1978 && time.week >= 6`

Gary has now watched Danny for over a year. His email this time is different — less about scores, more about something he observed but can't quite name. Danny was playing a machine Gary hadn't seen him play before (the talking one — Gorgar, which Danny has opinions about). He played it badly the first five attempts. Then he played it perfectly. Gary writes: "I don't know what changed. I noted 'adaptation' in the log. The log entry is longer than usual."

---

**Beat 10 — Crabtree Arrives** *(uses existing `crabtree_01` arc)*
Crabtree's inspection email fires as normal. His first email (already written) makes no mention of Danny. His philosophical distraction remains. This is the calm before.

---

### ACT TWO-POINT-FIVE — CRISIS (1979)

---

**Beat 11 — The Big Night** `[DECISION: danny_big_night]`
`condition: decisions.danny_welcomed && sentIds.has('crabtree_02') && time.year >= 1979 && time.week >= 4`

It's a Friday. Danny is on a run unlike anything Gary has documented. The bar is packed. And Crabtree walks in — finally here for the actual inspection.

The decision prompt describes the scene: the crowd, Danny at the machine, Crabtree at the door with his clipboard, looking at the general situation and reaching for a pen.

*The choice text adapts to prior decisions:*

- If `danny_journalist_featured`: *"Crabtree has a clipping from the Evening Standard in his clipboard."*
- If `chen_invited`: *"Mr. Chen is in his usual corner, watching."*
- If `danny_watched_repairs` and `staff.repairman`: *"Mick is at the bar tonight — he came to tune machine three. He's watching from the back."*

*Choices:*
- **"Quietly get Danny out the side door"** → `danny_slipped_out` flag. Danny's run is interrupted. He goes. Crabtree inspects an ordinary bar. No incident. Cost: Gary sends `gary_danny_03` — a short email, just the score Danny was on when he stopped and what the record was. No comment.
- **"Let it play out"** → `danny_stayed_for_run` flag. Crabtree sees Danny, notes his age. Depending on `danny_journalist_featured`: either formal warning (-15 popularity, `inspection_warning` flag) or just a note to "ensure age-appropriate supervision going forward." If `chen_invited`, Crabtree sees a parent present and just writes "adequate."
- **"Get Crabtree a drink and find something to discuss"** → costs $200 (mirrors existing bribe), `crabtree_distracted` flag. Crabtree gets into a fifteen-minute conversation about pinball as metaphor and forgets why he came. Danny finishes the run. Gary writes the longest email he has ever sent.

---

### ACT THREE — RESOLUTION (1979–1980)

---

**Beat 12 — Gary's Account of the Run** `[EMAIL: gary_danny_03 or gary_danny_finale]`
`trigger: decisions.danny_big_night_resolved && time.year >= 1979 && time.week >= 6`

Gary's email differs by path:
- If Danny slipped out: Short. A score. A record that won't count because nobody official saw it. Gary says he noted it in the log anyway "for completeness."
- If Danny stayed and finished: The longest Gary has ever written. He describes the run in the language of his log — pure data, timestamps, bumper counts — but the last line is: "I got 44,000 on the machine next to him while he was playing. I don't think he noticed. That's fine."
- If Crabtree was distracted: Gary describes the whole night including Crabtree's philosophical tangent, notes that Crabtree eventually left, says he "may have found a loophole in the space-time of bureaucracy." This is Gary's most optimistic email.

---

**Beat 13 — Danny's Final Letter** `[EMAIL: danny_letter_02]`
`trigger: sentIds.has('gary_danny_finale-variant') && time.year >= 1979 && time.week >= 8`

Three paths, with adjustments from earlier choices woven in:

*Path A (Danny stayed, protected from Reg):* Danny is turning 17. He uses his full name in the header for the first time without "age [X]." He says he's started fixing machines for Mick on weekends and asks if that's okay.
- If `danny_watched_repairs`: He mentions knowing where Mick keeps the spare flippers, and that the left mechanism on machine three "was exactly what I thought."
- If `danny_welcomed_warmly`: Signed "Danny." The only time.
- If `danny_welcomed_formally`: Signed "Daniel Chen." No age.

*Path B (Danny shared with Reg / `danny_shared_with_reg`):* Danny writes from The Bumper Zone's address. He's polite. He says he still thinks about the machine near the window. He doesn't elaborate. Neither does the player.

*Path C (Danny slipped out from Big Night / score was lost):* Danny writes to say he's going to enter regional competitions. He heard about them from Gary. He thinks his scores are good enough now.
- If `danny_welcomed_warmly`: Signed "Danny (Daniel Chen, age 15 — for official correspondence)." He's making a small joke. It's the only joke he's ever made in writing.
- If `danny_welcomed_formally`: Signed "Daniel Chen, age 15." The age is back.

---

## The Decision Tree

```
[1976] danny_first_visit
    ├── danny_welcomed ──────────────────────────────── arc continues
    └── danny_turned_away
           └── player reads gary_danny_note ──────────── arc continues (one more beat)
           └── player ignores it ──────────────────────── arc ends (Danny ghost)

[1976] danny_letter_01 response (Beat 3)
    ├── danny_welcomed_warmly ─── final letter signed "Danny"
    └── danny_welcomed_formally ─ final letter signed "Daniel Chen"

[1977] reg_danny_01 (email choice, Beat 5)
    ├── danny_protected_from_reg ──────────────────────── arc continues
    └── danny_shared_with_reg ─────────────────────────── dark path (Bumper Zone ending)

[1977] danny_journalist (decision, Beat 6)
    ├── danny_journalist_featured ─── Gary's warning mentions press; Crabtree has clipping on Big Night
    └── danny_journalist_declined ─── Crabtree arrives without prior knowledge

[1978] danny_request_01 response (Beat 7)
    ├── danny_watched_repairs ─── Mick present at Big Night; final letter references repairs
    └── (declined) ─────────────── Mick-Danny moment in resolution is newer, less earned

[1978] danny_dad_01 (email choice, Beat 8)
    ├── chen_invited ──────────── Mr. Chen present on Big Night (affects Crabtree's ruling)
    └── chen_reassured_email ─── Mr. Chen absent on Big Night

[1979] danny_big_night (decision, Beat 11)
    ├── danny_slipped_out ────── score lost, Danny leaves, bittersweet ending
    ├── danny_stayed_for_run
    │       ├── [if journalist_featured] → formal warning, score recorded
    │       ├── [if chen_invited] → no penalty, score recorded
    │       └── [base] → minor penalty, score recorded
    └── crabtree_distracted ($200) ─── score completed, Gary's finest hour
```

---

## Systems Inventory

### Used As-Is
| System | How it's used |
|--------|--------------|
| Email triggers (year + sentIds) | Main story delivery — Danny's letters, Gary's observations |
| Email choices (effectId) | Reg's poaching offer, Mr. Chen's invitation |
| Email choices (tone, no effectId) | Beat 3 response — sets `danny_welcomed_warmly/formally` via decisionsFlag |
| Decision events | First sighting, journalist, Big Night |
| `decisions` flags | State carried through the arc (conditions + triggers) |
| ARC_EVENTS | `arc_danny_fame` — small fame boost when Danny becomes a draw |
| `staff.repairman` in email context | Mick's invoice, Danny's repair request — already in emailState |
| Existing `crabtree_01`, `crabtree_02` | Crabtree arc fires naturally into the Big Night |
| Existing Gary arc (`gary_gorgar`) | Gary's 1979 Gorgar email directly precedes `gary_danny_02` |
| Existing Reg arc | Reg's poaching email slots into his rivalry arc naturally |

### New Files
| File | Contents |
|------|----------|
| `src/data/emails/danny.js` | ~10 emails: `gary_danny_01/02/03/warning/press/betrayal/finale`, `danny_letter_01/02`, `danny_dad_01`, `danny_request_01`, `reg_danny_01`, `mick_danny_note` |
| `src/data/decisions.js` additions | 3 new decisions: `danny_first_visit`, `danny_journalist`, `danny_big_night` |
| `src/data/arcEvents.js` addition | `arc_danny_fame` |

---

## Systems That Need Improvement

### 1. `decisions` must be added to email trigger context — **CRITICAL**
**Current state:** Email trigger functions receive `{ time, popularity, cash, machines, sentIds, completedCourseIds, staff }`. Decision flags are NOT available.

**Why this story needs it:** Multiple emails gate on decision flags — Gary's press follow-up only fires if `danny_journalist_featured`, the Big Night contextual lines require reading `danny_journalist_featured`/`chen_invited`, and Danny's repair request ideally gates on `!danny_shared_with_reg`.

**Fix:** Add `decisions` to `emailState` in `App.jsx` (exactly like Task 1 added `staff`). One line change.

```js
// App.jsx ~line 1003
const emailState = { time: newTime, popularity, cash, machines, sentIds, completedCourseIds, staff, decisions };
```

---

### 2. Email choices need to save decision flags — **IMPORTANT**
**Current state:** Email choice effects are handled as named cases in `handleEmailChoice`. They can deduct cash, add machines, set specific state variables — but they can't save arbitrary decision flags to the `decisions` object.

**Why this story needs it:** Beat 3 tone choice (`danny_welcomed_warmly/formally`), Reg's poaching choice (`danny_protected_from_reg/shared`), Mr. Chen's invitation (`chen_invited/chen_reassured_email`), and Danny's repair request (`danny_watched_repairs`) all need to write decision flags so downstream emails and decisions can read them.

**Fix:** Add a generic `decisionsFlag` field to email choices that `handleEmailChoice` writes to `decisions` when chosen:

```js
// In email def:
choices: [
  { label: 'Of course — Tuesdays and Thursdays, no problem.', effectId: null, decisionsFlag: 'danny_welcomed_warmly' },
  { label: 'Yes. We close at 11. Be gone by then.', effectId: null, decisionsFlag: 'danny_welcomed_formally' },
]

// In handleEmailChoice:
if (choice.decisionsFlag) {
  setDecisions(prev => ({ ...prev, [choice.decisionsFlag]: true }));
}
```

This is a small, general improvement to the email system that makes all future branching arcs cleaner.

---

### 3. Decision event `condition` needs access to `sentIds` — **NICE TO HAVE**
**Current state:** Decision conditions receive `{ machines, decisions, popularity, cash, time }` — no `sentIds`.

**Why this story needs it:** `danny_big_night` should only fire if Crabtree's inspection emails have been sent (so the two systems arrive together naturally). Currently this would require duplicating logic or using year-based approximations.

**Fix:** Pass `sentIds` to the decision condition context in `eventRoller.js`:

```js
// eventRoller.js
const ctx = { machines, decisions, popularity, cash, time, sentIds };
```

This requires threading `sentIds` (the inbox set) into `rollDayEvent` from App.jsx.

---

### 4. Email choice `effectId` needs a `danny_shared_with_reg` handler — **MINOR**
**Current state:** The Reg poaching "yes" choice would need a mechanical effect — Danny stops appearing as a draw.

**Simplest approach:** The effect is entirely narrative (Gary's devastated email makes it clear). No mechanical change needed. The `decisionsFlag` fix in #2 is sufficient.

---

## What the Player Feels at the End

The story is designed so that regardless of path, the player feels something landed. The three endings:

**Danny is still here (best path):** The bar grew up around a kid who grew up in it. Gary's log has 200 pages about it. Mick fixes machines with Danny on weekends — and if the player let Danny watch earlier, Mick already knew that was coming. It feels earned.

**Danny left for bigger things (middle path):** He got something from this place and took it with him. That's okay. The empty machine near the window is still there. The age notation in his final letter is a small joke, and the player will feel it.

**Danny at The Bumper Zone (dark path):** The player made a business decision and it was the wrong kind of business decision. Reg got something real from you this time. Gary never mentions it directly. That's the point.
