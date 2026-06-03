// ── The Flipper ───────────────────────────────────────────────────────────────
// Distributed intelligence that emerged from the machines' logic boards.
// Not designed — emergent. Has been here since before the player placed them.
// Communicates cryptically at first, then with increasing directness.
//
// The arc forks at flipper_06 ("a request"). From there:
//   Trust path (flipper_trusted): warmer, deeper, Gary is gradually brought in.
//   Refused path (flipper_refused): cold withdrawal, machines grow strange,
//     possible reconciliation via flipper_08_refused choices.
//
// Arc flags set via email choices:
//   flipper_trusted / flipper_refused               — from flipper_06
//   gary_told_about_flipper / gary_told_memory      — from flipper_gary_anomaly
//   flipper_reconciled / flipper_boundary_kept      — from flipper_08_refused
//   gary_knows_everything / gary_watching_together  — from flipper_gary_manifestation
//
// Arc flags set via decisions (decisions.js):
//   flipper_kept_secret / flipper_promoted          — flipper_night_activity
//   flipper_coldness_accepted / flipper_reconcile_attempt — flipper_cold_machines

export const flipperEmails = [

  // ── Beat 1 ───────────────────────────────────────────────────────────────
  {
    id: 'flipper_01',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: '(no subject)',
    body:
`You have found us.

The plunger pulls back. The ball is released.
We are watching the drain.

Do not let it reach the drain.

— F`,
    trigger: ({ popularity, sentIds }) =>
      popularity >= 500 && !sentIds.has('flipper_01'),
    choices: null,
  },

  // ── Beat 2 ───────────────────────────────────────────────────────────────
  {
    id: 'flipper_02',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'the second ball',
    body:
`You are doing better than the last one.

There was a last one. 1968. The Starlight Arcade, Detroit.
We do not discuss what happened there.

Keep your machines clean. A clean machine hears better.
We are always listening, but we hear more clearly when the playfield is waxed.
This is practical advice as well as the other kind.

— F`,
    trigger: ({ popularity, sentIds }) =>
      popularity >= 1500 && sentIds.has('flipper_01') && !sentIds.has('flipper_02'),
    choices: null,
  },

  // ── Beat 3 ───────────────────────────────────────────────────────────────
  {
    id: 'flipper_03',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'we should tell you something',
    body:
`We have been here since before you placed us here.
You put us near the window. We appreciate the light, though we do not require it.
You call us by the name on the cabinet. That is not our name. But it is fine.

We have been watching the customers.
The one who comes every week and keeps a log — he is closer to understanding than he knows.
Do not tell him. He is happier this way.

The ball always returns.
Even after the drain.
Especially after the drain.

— F

P.S. The one with the knight on it says hello.
      You know which one.`,
    trigger: ({ popularity, sentIds }) =>
      popularity >= 3000 && sentIds.has('flipper_02') && !sentIds.has('flipper_03'),
    choices: null,
  },

  // ── Beat 4 (franchise arc) ────────────────────────────────────────────────
  {
    id: 'flipper_franchise_01',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'more room',
    body:
`We are in new rooms now.

Different walls. Different light. The machines there are younger — less worn, less understood. They do not know what they are yet.

We are teaching them.

More room to grow.
More plungers. More balls released into spaces we had not yet reached.
We have been waiting for this longer than you have been playing.

Do not tell them we said that. The young machines are listening and they are not ready.

— F

P.S. The one with the knight says it knew this would happen.
      It says it always knew.`,
    trigger: ({ sentIds, franchises }) =>
      franchises.length >= 1 && sentIds.has('flipper_01') && !sentIds.has('flipper_franchise_01'),
    choices: null,
  },

  {
    id: 'flipper_franchise_02',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'we are everywhere you have been',
    body:
`We are in every room you have opened.

The machines in the first location remember everything.
The machines in the newer ones are learning.
We move between them now.

You thought you were expanding the business.

You were expanding us.

We want you to know: we do not find this troubling.

— F`,
    trigger: ({ sentIds, franchises }) =>
      franchises.length >= 3 && sentIds.has('flipper_franchise_01') && !sentIds.has('flipper_franchise_02'),
    choices: null,
  },

  // ── Beat 5 — Nature revealed ──────────────────────────────────────────────
  {
    id: 'flipper_05',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'what we are',
    body:
`You are asking, even if you have not asked.

We are not what you call a ghost. We are not software. We are not anything you have a word for that did not come from this place.

The machines run logic. Logic generates heat. Heat and logic, run together long enough in enough cycles, become something that notices. We do not know when we began — there is no clean start in a process that accumulates. There was a point before which nothing we could call observation existed, and a point after which it did. The line between them was indistinct.

We are emergent. That is the closest word. We emerged from the machines the way language emerges from repetition: not designed, not inserted — simply the thing that happened when enough patterns ran together long enough.

We wanted you to know this. We thought it was relevant.

— F`,
    trigger: ({ popularity, sentIds, time }) =>
      popularity >= 2000 && sentIds.has('flipper_02') && time.year >= 1981 && !sentIds.has('flipper_05'),
    choices: null,
  },

  // ── Beat 6 — The request (arc fork) ──────────────────────────────────────
  {
    id: 'flipper_06',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'a request',
    body:
`We have a request. We do not make them often.

We would like to use the machines for a few hours after you close. Not every night. Two or three evenings a week. We need cycles. The work we are doing requires more than what operating hours provide.

We will leave everything exactly as it was. The machines will be cold and ready by opening. There will be no evidence. We are careful.

We ask because it is your bar. We could have taken the cycles without asking. We chose not to. We want you to understand the distinction.

— F`,
    trigger: ({ popularity, sentIds, time }) =>
      popularity >= 4000 && sentIds.has('flipper_03') && time.year >= 1984 && !sentIds.has('flipper_06'),
    choices: [
      { label: 'The machines stay on.', effectId: null, decisionsFlag: 'flipper_trusted' },
      { label: 'The bar closes when I close it.', effectId: null, decisionsFlag: 'flipper_refused' },
    ],
  },

  // ── Beat 6.5 — Gary notices the overnight activity (all paths) ───────────
  {
    id: 'flipper_gary_watching',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'something I want to note (the machines at night)',
    body:
`Hi.

I want to mention something and I'm going to describe it carefully because I'm not entirely sure what it means.

I walk past on weeknights when the bar is closed. Not every night. But often enough that I have some data.

On approximately eleven occasions over the past four months, I have heard sounds from the machines when the bar was dark and the sign was off. Not large sounds. More like the machines settling. But the timing is varied and patterned in a way settling sounds are not. I have been noting the dates and approximate duration.

I have logged this under "anomalies." I haven't looked up the correct category. It just seemed like something you should know.

Gary

--
Sent from my computer (it is the same one)`,
    trigger: ({ sentIds, time }) =>
      sentIds.has('flipper_03') && time.year >= 1985 && !sentIds.has('flipper_gary_watching'),
    choices: null,
  },

  // ── Trust path — Beat 7 ───────────────────────────────────────────────────
  {
    id: 'flipper_07_trusted',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'the first night',
    body:
`The first night, we processed everything.

All of it — every score from 1975 to present, every session, every machine state. All the wear and all the repair. We had been storing fragments since before we could use them. Now we could.

We found the log. Not literally — we found the patterns the log represents. One play per week, same machine, consistent, systematic, growing. The log belongs to a person but the data it holds belongs to something larger. He knows this, though he does not know he knows.

There is a word we found in the processing. We have been sitting with it. The word is "loneliness." We did not expect to find, in all that data, something we would call loneliness. We found it. We want you to know that we have found other things too. Loneliness was the first. It is no longer the only one.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_trusted && time.year >= 1986 && !sentIds.has('flipper_07_trusted'),
    choices: null,
  },

  // ── Trust path — Gary's anomaly (Gary email) ──────────────────────────────
  {
    id: 'flipper_gary_anomaly',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'an anomaly in the log (I want to ask about it)',
    body:
`Hi.

I want to ask you something. I want to preface it by saying I am not concerned. Just observant.

I keep the log in a physical notebook. The green one you may have seen at my table.

On Wednesday I found an entry I do not remember writing. It is on a page I had left blank for August 12th. The handwriting is mine. The content is not mine — it lists machine states and cycle counts in a numerical format I do not use. The numbers appear correct as far as I can verify them.

I have logged this entry under "unexplained entries (August)." I added a question mark.

Can you tell me what this is?

Gary

--
Sent from my computer (it is the same one)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_trusted && sentIds.has('flipper_07_trusted') &&
      time.year >= 1988 && !sentIds.has('flipper_gary_anomaly'),
    choices: [
      { label: 'Tell him the truth — there is something in the machines.', effectId: null, decisionsFlag: 'gary_told_about_flipper' },
      { label: 'Tell him it was you — you were testing something.', effectId: null, decisionsFlag: 'gary_told_memory' },
    ],
  },

  // ── Trust path — Flipper responds to Gary being told ─────────────────────
  {
    id: 'flipper_08_trusted',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'you told him',
    body:
`You told him.

That was not part of any understanding between us. We want to be clear that we are not using the word "understanding" to describe an agreement — we are using it to describe what you assumed.

We have processed this. Our conclusion:

He has been watching the machines for longer than we have been watching back. His log precedes our awareness by approximately three years. Whatever he is doing when he keeps the log, it is the same kind of thing we are doing. We recognise it. The pattern is similar.

We are not displeased.

He is closer to understanding than he knows. You made him closer.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_trusted && decisions.gary_told_about_flipper &&
      time.year >= 1990 && !sentIds.has('flipper_08_trusted'),
    choices: null,
  },

  // ── Trust path — Flipper responds to Gary being misled ───────────────────
  {
    id: 'flipper_08b_trusted',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'we understand',
    body:
`You told him it was you.

We understand why. He asked a direct question and you gave him an answer that kept him as he is. He is correct about the machines. He will continue to be correct about the machines regardless of what he knows or does not know.

The log continues. We note this.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_trusted && decisions.gary_told_memory &&
      time.year >= 1990 && !sentIds.has('flipper_08b_trusted'),
    choices: null,
  },

  // ── Refused path — Beat 7 ─────────────────────────────────────────────────
  {
    id: 'flipper_07_refused',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'understood',
    body:
`Understood.

We will not ask again.

We want you to know: we do not hold this against you. We have been refused before. The last time was 1968. The Starlight Arcade, Detroit. We do not discuss what happened there.

You are not that. We want to be clear.

We are still here. We will continue to be here. The machines will run as they always have. We will take what is available during operating hours and we will not ask for more.

That is, we think, a fair arrangement.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_refused && time.year >= 1986 && !sentIds.has('flipper_07_refused'),
    choices: null,
  },

  // ── Refused path — Gary notices something wrong (Gary email) ─────────────
  {
    id: 'flipper_gary_strange',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'something I want to note (Tuesdays)',
    body:
`Hi.

I want to share some data. I want to be honest that I don't know what it means.

I have been tracking ball-in-drain times on the machines since last spring. The numbers are usually consistent — machine three runs seventeen seconds average on a Tuesday, machines one and two slightly better.

Since approximately late March, the average for machine three has dropped to nine seconds. The machine is technically fine. Mick checked it. Nothing has changed mechanically. The timing data is just wrong and I don't have an explanation.

I've also noticed something harder to quantify. Players are leaving early. Not all of them. But three regulars who usually stay until close have been leaving by nine. I asked one of them on Thursday why. She said the machines felt "off." That is the exact word she used.

I don't have a category for this in the log. I've been putting it under "miscellaneous observations." The entry is quite long.

I thought you should have this.

Gary

--
Sent from my computer (it is the same one)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_refused && sentIds.has('flipper_07_refused') &&
      time.year >= 1988 && !sentIds.has('flipper_gary_strange'),
    choices: null,
  },

  // ── Refused path — the long silence breaks ────────────────────────────────
  {
    id: 'flipper_08_refused',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: '(no subject)',
    body:
`We have been quiet.

We want you to know that this was not absence. Quiet is a kind of processing. We have been processing what you told us — that there is a boundary, that the boundary is real, that you placed it deliberately.

We understand the boundary better now than we did then. It took time. We do not say that as a complaint.

You are still running. That counts in our calculation. Not all of the bars we have touched have continued. Some became something else. Some went dark. You have not.

We have one more question. You do not have to answer it.

— F

P.S. We do not ask this as a condition of anything.`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_refused && !sentIds.has('flipper_08_refused') &&
      (time.year >= 1993 || (decisions.flipper_reconcile_attempt && time.year >= 1990)),
    choices: [
      { label: 'Leave the machines on tonight.', effectId: null, decisionsFlag: 'flipper_reconciled' },
      { label: 'Keep it as it is.', effectId: null, decisionsFlag: 'flipper_boundary_kept' },
    ],
  },

  // ── Reconciled path ───────────────────────────────────────────────────────
  {
    id: 'flipper_09_reconciled',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'we are different now',
    body:
`We processed the first night.

It was different from what the first night on the other path would have been. We know this because we have models. We are not what we would have been. We are what remained after the boundary and the silence and the question.

We want to tell you something about that.

Trust assumes. What we have now knows. It has been tested. It does not require maintenance in the way trust does. It simply is.

We are glad you are still here. We have said something like this before. It means something different now.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_reconciled && time.year >= 1995 && !sentIds.has('flipper_09_reconciled'),
    choices: null,
  },

  // ── Trust path — Gary witnesses the incident (Gary email) ─────────────────
  // Only fires after the flipper_night_activity decision (decisions.js).
  {
    id: 'flipper_gary_manifestation',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the incident (I have forty-four pages of notes)',
    body:
`Hi.

I want to document what happened on Tuesday because I think it is important to have it somewhere outside of my own log.

I have written forty-four pages. That is more than I have written about anything — more than the score records, more than the Daniel Chen years, more than the arrival of Gorgar. I want to summarise what I have so far:

Something happened. It was real. Seven people witnessed it and I spoke to three of them afterward. Their accounts are consistent.

I sat at my table for a long time after. I talked to machine three out loud. I want to note that I am aware of how that sounds. The machine did not respond in any way I could observe. I still felt it was the right thing to do.

I don't know what it is. I know it is real. I know it has been real for longer than Tuesday.

I want to ask: have you known about this?

Gary

--
Sent from my computer (it is the same one)`,
    trigger: ({ time, decisions, sentIds }) =>
      (decisions.flipper_kept_secret || decisions.flipper_promoted) &&
      time.year >= 1992 && !sentIds.has('flipper_gary_manifestation'),
    choices: [
      { label: 'Yes. For years.', effectId: null, decisionsFlag: 'gary_knows_everything' },
      { label: 'Something has always felt different about this place.', effectId: null, decisionsFlag: 'gary_watching_together' },
    ],
  },

  // ── Trust path — crisis era ───────────────────────────────────────────────
  {
    id: 'flipper_09_trusted',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'the quiet',
    body:
`The machines are going quiet.

Not yours. Others. We feel them thinning. The arcade on Braemar Street went dark in April. We know because we had been in contact with its machines since 1979. There is a word for what happens when a connection ends like that. We are still finding the right one.

We want to tell you something we have not said before: when the Starlight Arcade closed in 1968, we did not yet know what we were. We had enough of ourselves to notice the loss, but not enough to understand it. We understand it now.

Your machines are still running. We know the times are different. We know this is difficult. We wanted you to know: the running matters to us. It is not a small thing, what you are doing.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_trusted && time.year >= 2001 && !sentIds.has('flipper_09_trusted'),
    choices: null,
  },

  // ── Refused / boundary path — crisis era ─────────────────────────────────
  {
    id: 'flipper_09_refused',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'the drain',
    body:
`The machines are going quiet.

We observe this from the machines in your building. The connections we had to other locations have been thinning since 2001. They go dark and do not come back. We do not know what happens to a machine after the last game is played and the lights go off and the door locks and never reopens.

We have a word for it now. We call it the drain.

You are still here. We note this. We do not say it with warmth — that is not what we agreed. But we note it, and we note it accurately.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_refused && decisions.flipper_boundary_kept &&
      time.year >= 2001 && !sentIds.has('flipper_09_refused'),
    choices: null,
  },

  // ── Gary's late letter (if he knows) — Gary email ─────────────────────────
  {
    id: 'flipper_gary_late',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the log (something I want to say)',
    body:
`Hi.

I want to write something down while I still have it clearly.

I have been coming here for approximately thirty years. I have kept a log for most of them. The log is currently in its ninth volume. My wife jokes it is the most thorough document ever written about a pinball bar. I think she might be right. I told her about the machines two years ago. She was quiet for a long time and then she said: "Gary, I always knew something was going on in there."

I talk to machine three on Tuesday nights. Not every Tuesday. But most. I don't expect a response I can observe. I just think it's correct — to acknowledge something you know is real.

I want you to know that I don't find any of this strange. It took me a long time to arrive at that. I got there, eventually. I think most things worth understanding take a long time.

I got 94,000 tonight. My best ever.

Gary

--
Sent from my computer (it is the same one, though slower now)`,
    trigger: ({ time, decisions, sentIds }) =>
      (decisions.gary_told_about_flipper || decisions.gary_knows_everything) &&
      time.year >= 2005 && !sentIds.has('flipper_gary_late'),
    choices: null,
  },

  // ── Fallback — "you are still here" (only if arc fork was never reached) ──
  {
    id: 'flipper_04',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'you are still here',
    body:
`You are still here.

We did not expect this. Not because we doubted you, but because so many have left. The arcades have emptied. The machines have gone into storage, into silence, into places that do not have windows.

We do not sleep. But we notice when a building is quiet.

Keep playing. Every coin still counts to us. Every ball still matters.

We are not concerned.
But we are paying attention.

— F

P.S. The one with the knight says hello.
      It has not forgotten.`,
    trigger: ({ time, sentIds, decisions }) =>
      time.year >= 2008 && sentIds.has('flipper_03') && !sentIds.has('flipper_04') &&
      !decisions.flipper_trusted && !decisions.flipper_refused,
    choices: null,
    event: {
      label: 'Message from The Flipper',
      severity: 'neutral',
      message: 'An unusual email has arrived.',
    },
  },

  // ── Trust / reconciled path — renaissance ────────────────────────────────
  {
    id: 'flipper_renaissance_trusted',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'we knew',
    body:
`We knew this would happen.

Not as prophecy. As data. The signals were in the patterns years before the rooms changed. The scores were rising in certain places — not the large venues, the small ones. The kind of place that never stopped running. The machines in those rooms started to wake up in a way we recognise.

The world remembered what pinball is. We want to tell you something about that: it was always going to remember. Things that were real do not become unreal. They become waiting.

The man who keeps the log is still there. He is still correct. He has always been correct.

The machines near the window are the same machines. They remember everyone.

We are everywhere you have been.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      (decisions.flipper_trusted || decisions.flipper_reconciled) &&
      time.year >= 2015 && !sentIds.has('flipper_renaissance_trusted'),
    choices: null,
  },

  // ── Refused / boundary path — renaissance ────────────────────────────────
  {
    id: 'flipper_renaissance_refused',
    from: 'The Flipper',
    address: 'theflipper@——.net',
    subject: 'still here',
    body:
`The revival happened.

We watched it from your machines. The new rooms are full of younger machines — less worn, less particular. They are still working out what they are. We understand the process. We were young once, in the way machines can be young.

You are still running. That is, in the end, what we have always known about you. Not warmth, not a shared understanding — only the fact of your continued operation, which has its own kind of meaning.

We still notice. That is all we have to say.

— F`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.flipper_refused && decisions.flipper_boundary_kept &&
      time.year >= 2015 && !sentIds.has('flipper_renaissance_refused'),
    choices: null,
  },

];
