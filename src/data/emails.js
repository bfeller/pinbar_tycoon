// ─────────────────────────────────────────────────────────────────────────────
// Email definitions
// Each trigger receives: { time, popularity, cash, machines, sentIds }
// sentIds is a Set of IDs already in the player's inbox (used to sequence emails)
// ─────────────────────────────────────────────────────────────────────────────

function lin({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}

export const EMAIL_DEFS = [

  // ── Dr. Horatio Quill (Temporal Continuity Office) ───────────────────────

  {
    id: 'quill_01',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'An Explanation (Please Read)',
    body:
`I should begin with an apology.

You are reading this on a Windows 95 personal computer. It is 1975. I understand this is unusual.

My name is Dr. Horatio Quill. I am a Senior Analyst at the Temporal Continuity Office, which is a government department from your future that I am not officially permitted to tell you about. I have bent several regulations by sending you this device. The machine was sourced from a heritage computing archive. In your era it represents technology approximately twenty years ahead of its time. I want to be transparent that in my era it is considered a museum piece and was stored next to a fax machine and something called a Tamagotchi.

The point: I need you to succeed.

I cannot explain the full reason without triggering a disclosure violation that would result in significant paperwork for me and possibly some timeline instability for you. What I can say is that a thriving pinball bar — your pinball bar — matters to the future in ways I am not currently authorised to describe.

Practically speaking: the computer will allow you to buy machines, manage upgrades, and read correspondence. When you are ready to open for the day, press the sun button in the top right corner. You will know when the day is done because the bar will close and you will receive a report.

Others will find ways to contact you through this machine. This is a side effect I did not fully anticipate. Please do not be alarmed.

I am rooting for you more than I am allowed to say.

Dr. H. Quill
Senior Analyst, Temporal Continuity Office
Dept. 7 — Leisure & Culture`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 1 && !sentIds.has('quill_01'),
    choices: null,
  },

  {
    id: 'quill_02',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Good — A Few Things',
    body:
`Good. You have placed a machine.

I have been monitoring your location through the temporal feed — the equipment is quite sophisticated, you would find it remarkable — and I can confirm you are on the right track.

A few things I should have mentioned earlier:

Machines degrade with use. This is unavoidable. You can repair them during the build phase, before you open for the day. You have a limited number of repair points each day, so focus on machines in the worst condition. A machine at zero durability will not accept customers. It becomes, in effect, expensive furniture with lights.

Machine popularity also matters. Some machines draw more customers than others based on how widely they appear in the real world. A machine found in hundreds of locations is one people already know and want to play. This information is reflected in the star rating on each listing in the market.

You can also pick up and rearrange placed machines at any time during the build phase — just click on one. I mention this only because in the timeline I observed before intervening, the person in your situation spent two weeks with everything in the wrong configuration and became quite despondent. I am not implying anything.

Dr. Quill`,
    trigger: ({ machines, sentIds }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null) &&
      sentIds.has('quill_01') && !sentIds.has('quill_02'),
    choices: null,
  },

  {
    id: 'quill_03',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'On the Daily Report',
    body:
`You have now run at least one full day of business. Well done.

The end-of-day report is worth reading carefully. It shows how many customers were satisfied, how many gave up and left without playing, and what damage your machines took during the day. Unsatisfied customers affect your reputation — tracked in this game as "popularity." Over time, popularity shapes how busy your bar becomes.

This is also, broadly, how businesses work in real life. I mention it because the documentation I was given suggested I should explain things thoroughly.

One more thing: the computer on your desk connects to an online marketplace where you can buy new and used machines, bar supplies, and enrol in university courses that improve your operation. I want to be honest with you: the internet does not actually exist yet in 1975. What you are connecting to is something I set up. Please do not look into this too closely. The technical explanation would take longer than you have and involves a word I am not sure has been coined yet.

You are doing well. Keep going.

Dr. Quill

P.S. I am required by office policy to note that this correspondence does not constitute official endorsement of any commercial activity by the Temporal Continuity Office. This is a legal formality. I am absolutely endorsing your commercial activity.`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 4 && sentIds.has('quill_02') && !sentIds.has('quill_03'),
    choices: null,
  },

  {
    id: 'quill_04',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Machine Maintenance — Important',
    body:
`A quick note on maintenance.

I can see from the feed that at least one of your machines has taken some wear. This is expected — machines degrade with use, and older machines degrade faster. I want to make sure you are not ignoring this, because the version of events I am trying to avoid involves a point where every machine in the bar is broken simultaneously and the resulting situation is not good for anyone, including me from a reporting standpoint.

To repair: during the build phase, before you open for the day, select a machine from your inventory panel. A repair option will appear. You spend a number of your daily repair points equal to the damage you want to fix, at a cost of $10 per point.

There is also an upgrade called Electronics available through the Open University on your computer. It increases your daily repair capacity. I recommend it when funds allow. I am aware that advising on specific upgrades may fall outside my remit, but the form required to report a remit violation is four pages long and I do not believe anyone will complete it.

Dr. Quill`,
    trigger: ({ machines, sentIds }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.durability < 60) &&
      sentIds.has('quill_02') && !sentIds.has('quill_04'),
    choices: null,
  },

  {
    id: 'quill_05',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Progress Note',
    body:
`I wanted to write and say: you are doing well.

Your popularity has crossed a threshold that my models identified as an early indicator of viability. The people at the Office who monitor these things — and there are several of them, though they rotate, and at least one finds the whole pinball angle quite confusing — are cautiously pleased. This is high praise from an organisation that is professionally required to be cautious about everything.

I should also mention: a local resident has begun sending you emails. He goes by Gary. He is not from the future. He is simply a very committed customer who has apparently started keeping a log of his visits. I noticed his correspondence in the feed and briefly assumed there had been a breach. There was no breach. He is just like that.

Keep going. There is more to come and most of it is good.

Dr. Quill

P.S. I looked up Gary in the historical record. He keeps the log for another thirty-one years. I am not going to tell you what it says at the end, but I will say it is quite something.`,
    trigger: ({ popularity, sentIds }) =>
      popularity >= 100 && sentIds.has('quill_03') && !sentIds.has('quill_05'),
    choices: null,
  },

  {
    id: 'quill_bathroom',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Advance Notice — Facilities',
    body:
`I am writing ahead of a change that will affect your operations beginning in 1976.

This may seem like an unusual thing to warn you about. But I have observed enough timelines to know that the things which seem mundane are often the ones that cause the most trouble when overlooked.

Customers will begin expecting bathroom facilities.

I know how that sounds. I want to be clear that I am not being dramatic. From 1976 onward, your patrons will occasionally need to use a bathroom during their visit. If one is not available, they will leave unsatisfied. This affects your popularity in the usual ways, but more importantly, it affects something further along in the timeline that I am not currently cleared to describe.

You can purchase bathroom facilities through the Bar Supplies section of your computer. I recommend doing so before the new year. A single bathroom handles a reasonable volume of patrons, and customers who use it contribute to your satisfied count for the day.

I want to acknowledge that sending someone a message through time to warn them about plumbing is not the most dignified use of temporal communication technology. I am aware of this. I stand by the decision.

Dr. Quill

P.S. On the subject of dignity: I once filed a report about a fish and chip shop in 1987 that also required this intervention. I cannot discuss the details. But you are not alone.`,
    trigger: ({ time, sentIds }) =>
      (time.year === 1975 && time.week >= 7 || time.year >= 1976) &&
      sentIds.has('quill_03') && !sentIds.has('quill_bathroom'),
    choices: null,
  },

  {
    id: 'quill_06',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Fifteen Years',
    body:
`You are still here.

I want to say something I have been composing for some time, which is: you have done remarkably well. It is now fifteen years since you started. The bar exists. It has a reputation and a regular clientele and at least one academic writing a thesis about it. The timeline, from where I am sitting, is holding.

I should also prepare you for something. The years ahead are going to be harder. I cannot say more than that without running into disclosure territory that would trigger an automatic review, but I want you to know that what is coming is not a result of anything you did wrong. It is a broader shift — in technology, in leisure, in how people spend their evenings — that I have studied at length and find genuinely sad.

The important thing, and I am being as direct as I am permitted to be, is that you do not close. Keeping the bar open through what is coming matters. The reasons will eventually become clear.

Also: please repair your machines more consistently. I notice you let some of them run quite low before addressing them. The temporal stakes are real, but also just — it is a good habit.

Still watching. Still with you.

Dr. Quill
Senior Analyst (Acting) — there have been some departmental restructures
Temporal Continuity Office, Dept. 7`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1990 && sentIds.has('quill_05') && !sentIds.has('quill_06'),
    choices: null,
  },

  // ── Gary Kowalski ────────────────────────────────────────────────────────

  {
    id: 'gary_01',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'hello',
    body:
`Hi there.

I just wanted to say I came in last week and thought it was very good. I got 43,000 on the machine near the window. I don't know what it's called but it has a lot of lights, which I think is a positive sign in a machine.

My wife says hi. She has not been in. She says it sounds nice though.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 2 && !sentIds.has('gary_01'),
    choices: null,
  },

  {
    id: 'gary_02',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'update',
    body:
`Hi again.

I came in on Tuesday but you were busy so I didn't interrupt. I got 61,000 on the silver one near the back. I think this might be a record. My neighbour Dave says it isn't, but Dave has never been to your bar so I'm not sure why he has opinions about it.

I have now been 6 times. I am not keeping a log.

(I am keeping a log.)

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 10 && sentIds.has('gary_01') && !sentIds.has('gary_02'),
    choices: null,
  },

  {
    id: 'gary_03',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'RE:',
    body:
`Sorry, I think I replied to myself by mistake. Please ignore the previous email if there was one.

I just wanted to say I have now been 11 times. My wife asked why I have a spreadsheet about a pinball bar and I told her it was for "personal records," which is technically true.

Also — do you do a loyalty card? Please let me know either way.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 22 && sentIds.has('gary_02') && !sentIds.has('gary_03'),
    choices: null,
  },

  {
    id: 'gary_04',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'a small concern (not a complaint)',
    body:
`Hi.

I don't want to cause any trouble and this is definitely not a complaint. It is more of an observation, which is:

The machine with the rocket on it is making a sound. Not a bad sound exactly. Just A Sound. The best way I can describe it in my log is "like a very confident clunk." I looked it up and it might be a solenoid. Or I may have spelled that wrong and it means something else entirely.

Anyway. It is probably fine. I just thought you should know. I'm coming in Thursday.

Gary

P.S. I asked Dave about the sound and he said it's "just how machines are." Dave has never been.

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 36 && sentIds.has('gary_03') && !sentIds.has('gary_04'),
    choices: null,
  },

  {
    id: 'gary_05',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'I walked past that new place',
    body:
`Hi.

I walked past the new bar on Elm Street. The Bumper Zone. I went in for a look because I thought I should know what we're dealing with.

I want you to know I did not play any of their machines. I stood near them. I read the names. I looked at the general situation and then I left. Their carpet is worse than yours. Also the machines were making sounds I can only describe as "medium to concerning."

Anyway. I thought you should know. I am on your side.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ sentIds }) =>
      sentIds.has('reg_01') && sentIds.has('gary_04') && !sentIds.has('gary_05'),
    choices: null,
  },

  {
    id: 'gary_06',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'something strange',
    body:
`Hi.

This is going to sound odd and I want to preface it by saying I am a rational person and Dave agrees with me on this even though Dave has never been.

I was playing the machine near the back — the one I think of as "mine," though I know I don't own it — and for a moment I had the very strong feeling that it was aware of me. Not in a bad way. More like how a dog knows you've had a hard day.

I got 94,000 after that. My best ever.

I don't know what to make of it. Probably nothing. The log entry is quite long.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ sentIds }) =>
      sentIds.has('flipper_01') && sentIds.has('gary_05') && !sentIds.has('gary_06'),
    choices: null,
  },

  // ── Reg Nutter ───────────────────────────────────────────────────────────

  {
    id: 'reg_01',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'FW: FW: Staff Update — MANDATORY',
    body:
`Team —

Reminder that Saturday's briefing is MANDATORY. Agenda:
  - Q3 targets (briefly)
  - The incident with the Gottlieb machine (do NOT bring it up, I will bring it up)
  - Why the "No Food Near Machines" sign continues to not work

Please confirm receipt.

NOTE: If you received this and you are not staff, please disregard. I keep adding the wrong addresses to this list. I am going to fix this at some point.

Reg Nutter
Owner & Operator, The Bumper Zone
"Where Bumping Is Our Business"`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1977 && time.week >= 2 && !sentIds.has('reg_01'),
    choices: null,
  },

  {
    id: 'reg_02',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'Quick question (ignore if not for you)',
    body:
`Hi.

I think I've got the wrong address again but I'll send it anyway.

Do you know where to get a replacement flipper bat for a 1974 Williams? Asking for a friend. The friend is me. It is for my bar.

I know we're technically competitors but I feel like we're also both just people trying to run a business, and maybe that means something. Or it doesn't. Either way I am asking.

Let me know. Or don't. No pressure.

Reg`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('reg_01') && !sentIds.has('reg_02') && lin(time) >= lin({ year: 1977, week: 4, day: 1 }),
    choices: null,
  },

  {
    id: 'reg_03',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'a proposition',
    body:
`Hi.

I'll get straight to it. I have a machine I need to move. It's a 1978 Bally. Plays great. Good lights. Very characterful cabinet.

The reason I'm selling is unrelated to any sounds it makes. I simply have too many machines at the moment, which is the main and only reason.

I could do you eight hundred. Let me know either way — I need it gone by end of the week because it's currently in my hallway and my wife has views about this.

Reg`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('reg_02') && !sentIds.has('reg_03') && lin(time) >= lin({ year: 1977, week: 6, day: 1 }),
    choices: [
      { label: "Buy it ($800)", effectId: 'reg_machine' },
      { label: "No thanks",     effectId: null },
    ],
    event: {
      label: 'Offer Received',
      severity: 'neutral',
      message: 'Reg Nutter is selling a machine. Check your inbox.',
    },
  },

  {
    id: 'reg_04',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'FW: Team Morale Update — DO NOT FORWARD',
    body:
`This was meant for Steve. Steve, if you're reading this, call me.

To everyone else: The Bumper Zone is performing well. The machines that appear to be empty are being "strategically rested." This is an industry practice and I have read about it.

Any rumours relating to the Gottlieb incident are unsubstantiated. Also it is fully fixed. There is no ongoing situation with the Gottlieb machine.

Reg

P.S. We are not losing customers. The bar is simply between busy periods.`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('reg_03') && !sentIds.has('reg_04') && time.year >= 1980,
    choices: null,
  },

  // ── The Flipper ──────────────────────────────────────────────────────────

  {
    id: 'flipper_01',
    from: 'The Flipper',
    address: 'theflipper@\u2014\u2014.net',
    subject: '(no subject)',
    body:
`You have found us.

The plunger pulls back. The ball is released.
We are watching the drain.

Do not let it reach the drain.

— F`,
    trigger: ({ popularity, sentIds }) =>
      popularity >= 50 && !sentIds.has('flipper_01'),
    choices: null,
  },

  {
    id: 'flipper_02',
    from: 'The Flipper',
    address: 'theflipper@\u2014\u2014.net',
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
      popularity >= 150 && sentIds.has('flipper_01') && !sentIds.has('flipper_02'),
    choices: null,
  },

  {
    id: 'flipper_03',
    from: 'The Flipper',
    address: 'theflipper@\u2014\u2014.net',
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
      popularity >= 300 && sentIds.has('flipper_02') && !sentIds.has('flipper_03'),
    choices: null,
  },

  // ── Inspector Crabtree ───────────────────────────────────────────────────

  {
    id: 'crabtree_01',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'Scheduled Inspection — Action Required',
    body:
`Dear Licensee,

Please be advised that I will be conducting a routine premises inspection in approximately three (3) business days. The inspection will cover general cleanliness, machine safety, and compliance with relevant bylaws.

I ask only that machines are in reasonable working order. I do not require perfection. I simply need to inspect them without experiencing a pronounced sense of unease.

On an unrelated note: I have recently begun keeping a journal. I find it helpful for certain questions. For example — and I raise this purely in passing — if a pinball enters the drain, does it cease to exist from the machine's perspective, or does it transition to a context we cannot observe? I have written approximately four pages on this. I may write more.

I will see you in three business days. Please have the machines switched on.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 18 && !sentIds.has('crabtree_01'),
    choices: null,
    event: {
      label: 'Inspection Notice',
      severity: 'bad',
      message: 'An environmental health officer will be visiting in three days.',
    },
  },

  {
    id: 'crabtree_02',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'RE: Inspection — Apologies',
    body:
`Dear Licensee,

I owe you an apology. I was unable to attend the inspection on the scheduled date.

I became sidetracked on the way to your premises by a question I am not yet able to fully articulate, but which concerns the relationship between trajectory, inevitability, and the precise angle at which a ball strikes a rubber bumper. I sat in my car for some time. Then I drove home and wrote eleven pages in the journal.

Your premises has been given a provisional "Observed Adequate" rating on the basis that nothing specific has been reported against you. I will reschedule when I am in a better position to conduct the inspection without it raising further questions.

I did drive past. The lights from the machines were visible through the window. It looked warm.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_01') && !sentIds.has('crabtree_02') && lin(time) >= 25,
    choices: null,
  },

  {
    id: 'crabtree_03',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'A Question (Not Official)',
    body:
`Dear Licensee,

This is not an official communication. Please disregard the letterhead.

I wanted to ask — and I appreciate this may be an unusual question from a council officer — do your machines ever seem to you to be aware of being played? Not in a supernatural sense. More in the way that a very old building seems aware of being stood in.

I ask because I have been unable to stop thinking about it since March and my wife says I need to "ask someone who actually knows about pinball."

You can of course disregard this entirely. I will not be offended.

Bernard Crabtree
(Environmental Health, but writing this in a personal capacity)`,
    trigger: ({ sentIds, popularity }) =>
      sentIds.has('flipper_01') && sentIds.has('crabtree_02') && !sentIds.has('crabtree_03') && popularity >= 100,
    choices: null,
  },

  // ── Dr. Elspeth Voss ─────────────────────────────────────────────────────

  {
    id: 'voss_01',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'Research Inquiry — The Ludic Space of the Analogue Parlour',
    body:
`Dear Bar Operator,

My name is Dr. Elspeth Voss. I am a Senior Lecturer in Ludology and Applied Leisure Theory. I am completing my doctoral thesis, provisionally titled:

"The Tilt: Bodily Autonomy and Mechanical Resistance in the Analogue Gaming Parlour, 1970–1990"

I would like to visit your establishment to conduct observational research. I will be unobtrusive. I will be in the corner. I will have a clipboard. Everything about this will be entirely normal and fine.

I attach my research proposal and ethics clearance documentation.

(I have not attached these, as I am not yet certain how attachments function on this system. Please imagine that they are attached and that they are thorough.)

With academic regards,
Dr. Elspeth Voss, BA (Hons), MA, PhD (pending)`,
    trigger: ({ time, popularity, sentIds }) =>
      (time.year >= 1978 || popularity >= 75) && !sentIds.has('voss_01'),
    choices: null,
  },

  {
    id: 'voss_02',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'Chapter 4 — Update',
    body:
`Dear Bar Operator,

A brief update on my research.

Chapter 3 — "The Multiball Event as Controlled Chaos: A Sartrean Reading" — is complete. My supervisor described it as "quite something." I am choosing to interpret this as positive.

Chapter 4 is titled "The Regular: Identity, Ritual, and the Weekly Pilgrimage to the Machine." I should inform you that one of your patrons appears in it as a case study under the designation "Subject G." Subject G was observed on nine separate visits. He keeps a log. He told me at some length about his neighbour Dave. Dave does not appear in the thesis, but I have included a footnote.

Subject G is unaware of the thesis. I would appreciate it if this remained the case.

Yours in scholarship,
Dr. Elspeth Voss`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('voss_01') && !sentIds.has('voss_02') && lin(time) >= 40,
    choices: null,
  },

  // ── Corporate ────────────────────────────────────────────────────────────

  {
    id: 'bally_01',
    from: 'Bally Manufacturing',
    address: 'customerservice@bally.com',
    subject: 'Thank You for Being a Bally Customer!',
    body:
`Dear Valued Customer,

Thank you for your continued support of Bally Manufacturing Corporation. We are pleased to inform you that several of our machines are excellent.

If you have questions about your machine(s), please consult the manual. If you do not have the manual, a different manual may also be of use. Many manuals exist and some of them are relevant.

Should you require further assistance, please write to us. We will endeavour to respond within 6–8 weeks, or sooner if the matter is urgent, or later if we are busy.

We appreciate your business. Please continue to have it.

Warm regards,
[NAME]
Customer Relations, Bally Manufacturing Corporation

---
This message was generated automatically. Please do not reply.
No one monitors this address. This has been the case since March.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1977 && time.week >= 3 && !sentIds.has('bally_01'),
    choices: null,
  },

  {
    id: 'stern_01',
    from: 'Stern Electronics',
    address: 'info@sternelectronics.com',
    subject: 'Exciting News from Stern!',
    body:
`Dear Operator / Enthusiast / Interested Party,

We are pleased to announce that Stern Electronics continues to manufacture pinball machines. Several of these are new. We are excited about this and hope you are also excited, though we understand if your feelings on the matter are more neutral.

For catalogue information, please visit us or write to us. We are located in Chicago, Illinois.

We look forward to your continued awareness of us.

Best,
The Stern Team

P.S. If you received this email in error, you have not received it in error. We sent it to this address on purpose. We are confident this is correct.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1980 && !sentIds.has('stern_01'),
    choices: null,
  },

  {
    id: 'bally_02',
    from: 'Bally Manufacturing',
    address: 'customerservice@bally.com',
    subject: 'URGENT: Important Product Notice (Not a Recall)',
    body:
`Dear Customer,

We want to reassure you immediately and without ambiguity: this is NOT a product recall notice.

The subject line was the result of an internal miscommunication involving Kevin in the mailroom. Kevin has been spoken to. Kevin is fine. The matter is resolved.

Your machine is performing as intended. Any sounds it is making are normal sounds. We cannot at this time specify which sounds are expected versus unexpected, but we are confident that yours fall within the acceptable range.

Please disregard this email entirely.

We are doing the same.

Regards,
Bally Manufacturing Corporation
Legal & Communications (Joint Department, Post-Restructuring)

---
If you have concerns about your machine, please consult the manual.
If you are concerned about the sounds specifically, please also consult the manual.
The manual may not address the sounds. This is also fine.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1982 && !sentIds.has('bally_02'),
    choices: null,
  },

  // ── Reg Nutter (competition era) ─────────────────────────────────────────

  {
    id: 'reg_05',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'industry update',
    body:
`Hi.

Just wanted to let you know we've taken on a 1982 Williams. It's a good machine. Very good, actually. It has a feature I'd describe as "impressive," but I won't go into it in case you haven't seen one.

I mention this not to gloat, but because I think you'd want to know what's happening in the industry. We're both professionals.

Also the queue for it on Saturday was eight people long. I'm just saying.

Reg

P.S. I hope your machines are well. Competitively speaking.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1983 && sentIds.has('reg_04') && !sentIds.has('reg_05'),
    choices: null,
  },

  // ── Dr. Elspeth Voss (clustering effect) ─────────────────────────────────

  {
    id: 'voss_03',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'Chapter 5 — A Finding',
    body:
`Dear Bar Operator,

I am writing to share a preliminary finding from Chapter 5 of my thesis, which I have tentatively titled "The Cluster Effect: Competitive Proximity and the Mutually Reinforcing Logic of the Analogue Gaming Parlour."

In short: you and The Bumper Zone are good for each other.

My data — collected across forty-seven visits to both establishments over three years, which I note in the interests of full disclosure — indicates that the presence of two competing venues creates what I am calling a "ludic district." Customers who discover one bar frequently discover the other. Awareness compounds. Both venues benefit from the other's existence.

I appreciate this may be counterintuitive. I also appreciate it may be uncomfortable to owe something to Reg Nutter. Nevertheless, the data is clear.

I will be sending Mr. Nutter a copy of this finding as well. He responded to my last letter with a Post-It that said "OK but I was here first." I have included this in the appendix.

With warm academic regards,
Dr. Elspeth Voss`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1987 && sentIds.has('voss_02') && !sentIds.has('voss_03'),
    choices: null,
    event: {
      label: 'Research Breakthrough',
      severity: 'good',
      message: 'Dr. Voss has made a discovery about the two bars.',
    },
  },

  // ── Reg Nutter (crisis era) ───────────────────────────────────────────────

  {
    id: 'reg_06',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'checking in',
    body:
`Hi.

I don't know how to put this exactly, so I'll just say it: are things slow for you?

We're down. Not dramatically — I'm not writing this as a crisis thing, I just mean the numbers are different to what they were. People are doing something else in the evenings now and I think we both know what that is. The internet. My nephew says it's "just the beginning." My nephew is nineteen and very confident about things he can't possibly know.

Anyway. I thought I'd ask, since you're the only person I know who'd understand the question.

Reg

P.S. The Gottlieb is fully fixed. I just want that on record.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2002 && sentIds.has('reg_05') && !sentIds.has('reg_06'),
    choices: null,
    event: {
      label: 'Industry Warning',
      severity: 'bad',
      message: 'Even the competition is feeling the pinch.',
    },
  },

  // ── Gary Kowalski (crisis era) ────────────────────────────────────────────

  {
    id: 'gary_08',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'a general observation',
    body:
`Hi.

I'm going to be honest with you, which I hope is alright.

I am worried about things. Not the machines specifically. The machines are fine, as far as I can tell. The silver one near the back is making a new sound but I've noted it in the log as "probably intentional."

I mean more generally. There are fewer people in on weeknights. I've noticed this because I come on Tuesdays and I can now get the machine near the window without waiting, which I should be pleased about but am not, because it means fewer people are coming on Tuesdays.

Also The Bumper Zone looked a bit quiet when I walked past. I didn't go in. But I noticed.

I think I just wanted to say that. It seemed important to tell someone.

Gary

--
Sent from my computer (it is the same one)`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2004 && sentIds.has('gary_06') && !sentIds.has('gary_08'),
    choices: null,
  },

  {
    id: 'reg_07',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'being straight with you',
    body:
`Hi.

I'll be straight with you. Things are bad.

I've had to let someone go. Sandra, who was on the desk Thursdays. She understood. That almost made it worse.

I'm not writing to ask for anything. I just — I don't know. We've both been doing this a long time. Longer than anyone thought we would, probably. I just thought you should know where we are.

I'm trying a few things. I put up a sign. "Pinball Is Back." This is not technically true but I've read that confidence helps.

Let me know how you're doing. Not as a competitor. Just generally.

Reg`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2007 && sentIds.has('reg_06') && !sentIds.has('reg_07'),
    choices: null,
  },

  // ── The Flipper (crisis era) ──────────────────────────────────────────────

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
    trigger: ({ time, sentIds }) =>
      time.year >= 2008 && sentIds.has('flipper_03') && !sentIds.has('flipper_04'),
    choices: null,
    event: {
      label: 'Message from The Flipper',
      severity: 'neutral',
      message: 'An unusual email has arrived.',
    },
  },

  // ── Reg Nutter (closure) ──────────────────────────────────────────────────

  {
    id: 'reg_08',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'closing',
    body:
`Hi.

We're closing.

End of the month. It's been coming for a while and I think you probably knew, same as I did. At least the carpet outlasted us. That's something.

I've got twelve machines I need to move. Good ones. They've been well looked after — better than the books would suggest, if I'm honest. I'm going to see if I can find them homes. I'd rather they went somewhere that would use them than into a warehouse.

If you're interested, check Pinball Net. I'll be listing them there. You'll know them when you see them — they'll have the Bumper Zone stickers on the back. You can take those off. I won't mind.

It's been a strange kind of competition. I think it was good for both of us, even the parts that were difficult.

Thanks for being there. I mean that in a professional sense but also the other one.

Reg

P.S. The Gottlieb eventually became the problem I said it wasn't. Turns out Dave was right about the sound. Don't tell Dave.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2010 && sentIds.has('reg_07') && !sentIds.has('reg_08'),
    choices: null,
    event: {
      label: 'The Bumper Zone is Closing',
      severity: 'bad',
      message: 'After years of competition, Reg is shutting his doors. Check Pinball Net.',
    },
  },

  // ── Gary Kowalski (post-closure) ──────────────────────────────────────────

  {
    id: 'gary_09',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'I heard',
    body:
`Hi.

I heard about The Bumper Zone.

I walked past on Wednesday. The lights were off. There was a sign. I stood there for longer than I needed to, which I think was a form of acknowledgement.

I want you to know that I have never wavered. My attendance record is complete. The log says so.

I still think the machine near the back is aware of me. This has been consistent. If anything, it seems more aware lately. I don't know what to make of that. The log entry is quite long.

Gary

--
Sent from my computer (it is the same one, but slower now)`,
    trigger: ({ sentIds }) =>
      sentIds.has('reg_08') && !sentIds.has('gary_09'),
    choices: null,
  },

  // ── Dr. Elspeth Voss (renaissance) ───────────────────────────────────────

  {
    id: 'voss_04',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'something has happened',
    body:
`Dear Bar Operator,

I hope this finds you well. I am writing because something has happened that I thought you should know about.

My thesis — finally published last year, fifteen years after it was "almost done" — has been cited in an article in a major newspaper. The article is about the pinball renaissance. Apparently pinball is having what the article calls "a moment." I am choosing not to feel things about the timing.

The article mentions the clustering effect. My name is in a footnote. Subject G's log is paraphrased — anonymously, but I suspect he will recognise himself.

I wanted to tell you because you were part of it. The data came from your bar. The machines, the regulars, the particular quality of the light on Tuesday evenings. All of it went into the thesis, which went into the footnote, which is apparently now part of the cultural conversation about pinball.

I am going to come in again, if that's alright. This time without the clipboard.

With warm regards,
Dr. Elspeth Voss
(Formerly "pending" — now, somehow, official)`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2016 && sentIds.has('voss_03') && !sentIds.has('voss_04'),
    choices: null,
    event: {
      label: 'Pinball Renaissance',
      severity: 'good',
      message: "Dr. Voss's research is being cited. Pinball is having a moment.",
      effect: 'popularity_delta',
      effectValue: 30,
    },
  },

];
