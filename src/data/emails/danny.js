// ── The Kid Arc (1976–1979) ───────────────────────────────────────────────────
// Danny Chen, age 14, arrives on a Tuesday. This file contains all emails
// that belong to his arc: Gary's observations, Danny's letters, Mr. Chen's
// concern, Reg's interest, and Mick's invoices.
//
// Arc flags (set via decisions or decisionsFlag on email choices):
//   danny_welcomed / danny_turned_away    — from danny_first_visit decision
//   danny_welcomed_warmly / _formally     — from danny_letter_01 email choice
//   danny_protected_from_reg / _shared    — from reg_danny_01 email choice
//   danny_journalist_featured / _declined — from danny_journalist decision
//   danny_watched_repairs                 — from danny_request_01 email choice
//   chen_invited / chen_reassured_email   — from danny_dad_01 email choice
//   danny_slipped_out / _stayed / crabtree_distracted — from danny_big_night

export const dannyEmails = [

  // ── Beat 1.5 — Gary's recovery note (only if player turned Danny away) ─────
  {
    id: 'danny_gary_note',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'something I saw',
    body:
`Hi.

I'm not sure if this is any of my business but I want to mention something I saw on Tuesday.

There was a boy. He was playing the machine near the window for most of the evening. I noticed because the scores were unusual. I was going to mention it but then he left before I had a chance.

I got 41,000 myself, which is fine, but I want to be clear that the boy's scores were in a different category entirely. I have made a note in the log. The entry is longer than usual.

Anyway. It's probably nothing. I just thought you should know.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ decisions }) =>
      decisions.danny_turned_away && !decisions.danny_welcomed,
    choices: null,
  },

  // ── Beat 2 — Gary's first note on Danny ──────────────────────────────────
  {
    id: 'gary_danny_01',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'an observation (data)',
    body:
`Hi.

I want to share something I have been noting in the log.

There is a boy who has been coming in on Tuesdays. I first noticed him several weeks ago. I have been tracking his scores since the second visit. I am writing to you because the data is, in my assessment, statistically irregular.

Week 1: 87,400. Week 2: 103,800. Week 3: 91,200 (different machine — I noted this). Week 4: 140,000.

I am not sure what to do with this information. I am told that the average score for an experienced player is somewhere between 50,000 and 80,000. I don't know who told me this. It may have been Dave. Dave has never been.

I have made a note in the log under "points of interest." The entry is longer than usual.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds, decisions }) =>
      (decisions.danny_welcomed || sentIds.has('danny_gary_note')) &&
      time.year >= 1976 && time.week >= 7 && !sentIds.has('gary_danny_01'),
    choices: null,
  },

  // ── Beat 3 — Danny's formal letter ───────────────────────────────────────
  {
    id: 'danny_letter_01',
    from: 'Danny Chen',
    address: 'computing.lab@eastfieldsecondary.ac.uk',
    subject: 'Request for Regular Practice Access',
    body:
`Dear Owner,

My name is Daniel Chen. I am a student at Eastfield Secondary School. I have been visiting your establishment on Tuesday evenings and would like to enquire whether I may also attend on Thursday evenings for the purpose of practice.

I am aware that your establishment is a licensed premises. I will purchase a beverage if required. I am told the Ribena is good.

I am writing from the school computing lab as I do not have a computer at home. Please respond at your earliest convenience.

Yours sincerely,
Daniel Chen, age 14 and a half

(If this is not the correct way to write a business letter please let me know and I will revise it.)`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('gary_danny_01') && time.year >= 1976 && time.week >= 10 && !sentIds.has('danny_letter_01'),
    choices: [
      { label: 'Of course — Tuesdays and Thursdays, no problem.', effectId: null, decisionsFlag: 'danny_welcomed_warmly' },
      { label: 'Yes. We close at 11. Be gone by then.', effectId: null, decisionsFlag: 'danny_welcomed_formally' },
    ],
  },

  // ── Beat 3.5 — Mick's invoice noting machine wear ────────────────────────
  {
    id: 'mick_danny_note',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 're: machine three — billing note',
    body:
`Service note — machine three (left flipper mechanism).

Have been tuning the left flipper mechanism on machine three twice monthly since approximately week 6 of this year. Normal interval is once per six to eight weeks. The increased frequency correlates with elevated usage on Tuesday evenings.

Left flipper mechanism takes unusual stress during extended play sessions. I've noticed a pattern in the wear profile. Someone is hitting the flipper very precisely, very consistently, for very long sessions.

Parts required this period: 2x flipper coil sleeves, 1x flipper return spring. See attached invoice.

Kid plays hard.

M. Darrow
M.D. Amusements Repair
"If it needs doing, it needs doing right"`,
    trigger: ({ time, sentIds, staff }) =>
      staff.repairman && sentIds.has('danny_letter_01') &&
      time.year >= 1977 && time.week >= 2 && !sentIds.has('mick_danny_note'),
    choices: null,
  },

  // ── Beat 4.5 — Gary's warning (Bumper Zone car in the car park) ──────────
  {
    id: 'gary_danny_warning',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'something I noticed (car park)',
    body: ({ decisions = {} }) => {
      let body =
`Hi.

I want to mention something I noticed last Tuesday and I am not entirely sure what to do with the information but I think you should have it.

There was a man I didn't recognise asking questions at the bar. I noticed him because he was asking the bartender specifically about "the boy who plays on Tuesdays." He didn't say his name. He didn't order a drink.

When he left I noted his car in the car park. It was a Bumper Zone fleet vehicle. I recognised the livery. I have seen it before when I walked past their premises on Elm Street.

I have not mentioned this to Daniel. I wasn't sure if I should. I have noted the car registration in the log.`;

      if (decisions.danny_journalist_featured) {
        body += `\n\nI also want to mention that three copies of the Evening Standard were left on the bar last week. The article was on page 12. I believe the car may have been connected. I have noted this as a hypothesis in the log.`;
      }

      body += `\n\nI thought you should have this information.\n\nGary\n\n--\nSent from my computer (it is new)`;
      return body;
    },
    trigger: ({ time, sentIds }) =>
      sentIds.has('danny_letter_01') && time.year >= 1977 &&
      time.week >= 5 && !sentIds.has('gary_danny_warning'),
    choices: null,
  },

  // ── Beat 5 — Reg's poaching email ────────────────────────────────────────
  {
    id: 'reg_danny_01',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'Re: industry collaboration — talent development',
    body:
`Hello there.

I hope business is going well. I won't beat around the bush — we've always been straight with each other, professionally speaking.

It's come to my attention that you have a young talent coming through your doors on a regular basis. A boy with some notable ability, from what I understand. I wonder if you'd be open to a conversation about what I'd call a "collaborative industry arrangement" — a mutually beneficial arrangement in which The Bumper Zone's facilities and my own experience could play a role in developing that talent alongside your own operation.

It goes without saying that any such mutually beneficial arrangement would be handled with full discretion and respect for all parties involved. This is purely a professional inquiry.

Let me know your thoughts at your earliest convenience.

Reg Nutter
The Bumper Zone
"Pinball Done Properly"`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('danny_letter_01') && sentIds.has('reg_02') &&
      time.year >= 1977 && time.week >= 6 && !sentIds.has('reg_danny_01'),
    choices: [
      { label: 'Not interested, Reg.', effectId: null, decisionsFlag: 'danny_protected_from_reg' },
      { label: 'We could discuss something.', effectId: null, decisionsFlag: 'danny_shared_with_reg' },
    ],
  },

  // ── Reg's one-line rebuff response ────────────────────────────────────────
  {
    id: 'reg_danny_rebuffed',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'Re: Re: industry collaboration',
    body:
`Noted. Professional.

R.N.`,
    trigger: ({ decisions, sentIds }) =>
      decisions.danny_protected_from_reg && !sentIds.has('reg_danny_rebuffed'),
    choices: null,
  },

  // ── Gary's betrayal email (dark path — Danny shared with Reg) ────────────
  {
    id: 'gary_danny_betrayal',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'an update to the log',
    body:
`Hi.

I wanted to give you a log update. I keep these records as a matter of habit and I think you should have the data.

Daniel's Tuesday visits: weeks 1–14, consistent. Week 15, he arrived late and left early. Week 16, he came in but played for only forty minutes. Week 17, he did not come. I waited until closing. He did not come.

I have seen him once since then. He was coming out of The Bumper Zone on Thursday afternoon. He didn't see me. I noted it in the log under "observations." The entry is very short this time.

I don't have any further comment to make. I just thought the record should be accurate.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.danny_shared_with_reg && time.year >= 1977 &&
      time.week >= 8 && !sentIds.has('gary_danny_betrayal'),
    choices: null,
  },

  // ── Gary's press follow-up (only fires if journalist piece ran) ───────────
  {
    id: 'gary_danny_press',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'RE: article (Evening Standard)',
    body:
`Hi.

The article ran on Thursday. Page 12.

I want to give you some numbers because I think they're relevant. Tuesday attendance last week: 23 people. Of those, 8 were new faces. Of the 8 new faces, 3 asked specifically about Daniel — by name, which means they read the piece.

I kept this count on a piece of paper at my usual table. My wife asked why I had a piece of paper with tally marks at dinner. I said it was for contextual analysis. She said "of course it is, Gary."

Attendance is up. The log is getting full.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.danny_journalist_featured && time.year >= 1977 &&
      time.week >= 14 && !sentIds.has('gary_danny_press'),
    choices: null,
  },

  // ── Beat 7 — Danny's request to watch Mick ───────────────────────────────
  {
    id: 'danny_request_01',
    from: 'Danny Chen',
    address: 'computing.lab@eastfieldsecondary.ac.uk',
    subject: 'Request — Observation of Repair Process',
    body:
`Dear Owner,

I hope this letter finds you well.

I have a request. I have been observing the repair technician (I believe his name is Mr. Darrow) working on the machines on Thursday evenings on several occasions. He appears to be very skilled.

I have been thinking about the left flipper mechanism on machine three. It has been misbehaving in a way I believe I understand — specifically, the return spring is being compressed at a slightly incorrect angle during high-frequency play, which causes the wear pattern I have noticed on the coil sleeve.

I would like to ask if I could observe the repair process on one occasion, if it is not an inconvenience to you or to Mr. Darrow.

I realise this is an unusual request. I will purchase a beverage.

Yours sincerely,
Daniel Chen, age 15`,
    trigger: ({ time, sentIds, staff }) =>
      staff.repairman && sentIds.has('danny_letter_01') &&
      time.year >= 1978 && time.week >= 1 && !sentIds.has('danny_request_01'),
    choices: [
      { label: 'Of course — talk to Mick.', effectId: null, decisionsFlag: 'danny_watched_repairs' },
      { label: 'Better to keep things simple.', effectId: null, decisionsFlag: null },
    ],
  },

  // ── Beat 8 — Mr. Chen's email ─────────────────────────────────────────────
  {
    id: 'danny_dad_01',
    from: 'Mr. L. Chen',
    address: 'lchen.work@btinternet.co.uk',
    subject: 'RE: Daniel (your establishment)',
    body:
`Dear Owner,

I hope you will excuse the intrusion. My name is Lawrence Chen. Daniel is my son.

I am writing because Daniel spends a significant amount of time at your establishment and I want to understand the situation more fully. I am not writing to make a complaint — I want to be clear about that. Daniel speaks highly of the place, and he has mentioned, on more than one occasion, "a man named Gary," who I gather is a regular customer.

Daniel is fifteen. He is a good student and, as far as I can tell, a very serious young man. He does not discuss what he does at the bar in any detail. He simply says it is "important."

I would appreciate either a brief response to let me know the situation is as he describes, or, if you are willing, an invitation to come in and see for myself. I leave the choice to you.

Yours sincerely,
Lawrence Chen`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('danny_letter_01') && time.year >= 1978 &&
      time.week >= 2 && !sentIds.has('danny_dad_01'),
    choices: [
      { label: 'Invite Mr. Chen in — come and see for yourself.', effectId: null, decisionsFlag: 'chen_invited' },
      { label: 'Reassure him by email — everything is fine.', effectId: null, decisionsFlag: 'chen_reassured_email' },
    ],
  },

  // ── Beat 9 — Gary's running account ───────────────────────────────────────
  {
    id: 'gary_danny_02',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'a further observation',
    body:
`Hi.

I want to note something in the external log (this email) because I'm not sure how to classify it in the main log.

Daniel was playing the talking machine last week. I gather its name is Gorgar. I have noted previously that I find it somewhat unsettling, for reasons I won't go into again here. Daniel, however, seemed entirely unaffected by the talking.

What I noticed was this: he played it badly the first five attempts. "Badly" is relative — his lowest score was still 64,000 — but for Daniel, that is bad. Then on the sixth attempt he played it perfectly. I mean perfectly. I don't have a better word.

I don't know what changed between attempt five and attempt six. I watched the whole thing. I have noted it in the log under "adaptation." The log entry is longer than usual.

I think about it sometimes.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('danny_dad_01') && time.year >= 1978 &&
      time.week >= 6 && !sentIds.has('gary_danny_02'),
    choices: null,
  },

  // ── Beat 12a — Gary's account (Danny slipped out) ────────────────────────
  {
    id: 'gary_danny_03',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'score (Friday)',
    body:
`Hi.

I wanted to write down the score before I forgot.

Daniel was on 287,400 when he left on Friday. The existing machine record is 304,100. He had been playing for approximately ninety minutes. Based on his rate of accumulation, I estimate he would have passed the record within twelve to fifteen minutes.

I noted the score in the log. I also noted that it will not count as an official record for obvious reasons.

I've noted it anyway. For completeness.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.danny_slipped_out && time.year >= 1979 &&
      time.week >= 6 && !sentIds.has('gary_danny_03'),
    choices: null,
  },

  // ── Beat 12b — Gary's account (Danny stayed and finished) ─────────────────
  {
    id: 'gary_danny_finale_stayed',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'Friday — full account',
    body:
`Hi.

I want to write this down properly while I still have it clearly.

Daniel arrived at 7:14 PM. Machine three. By 8:30 he had passed his previous best. By 9:00 the bar was full — I counted 31 people, which is more than I have seen on a Friday in two years. Most of them were watching. A few were on other machines but even they were watching.

At 9:47 he passed 300,000. I noted the time. There was a sound from the crowd that I can only describe as involuntary. Like the room surprised itself.

At 10:22 he finished. 347,800. I have never seen that number on that machine.

There is a complication with the official nature of the record, as you are aware. I have noted the score in the log regardless. I have noted the date, the time, the witnesses, the circumstances. The log entry is the longest I have written.

I got 44,000 on the machine next to him while he was playing. I don't think he noticed. That's fine.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.danny_stayed_for_run && time.year >= 1979 &&
      time.week >= 6 && !sentIds.has('gary_danny_finale_stayed'),
    choices: null,
  },

  // ── Beat 12c — Gary's account (Crabtree distracted) ──────────────────────
  {
    id: 'gary_danny_finale_distracted',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'Friday — full account (including the inspector)',
    body:
`Hi.

I want to write a full account of Friday because I think it deserves one.

The inspector — Crabtree, I believe — came in at approximately 9:15. I have seen him before. He usually has his clipboard out by the time he reaches the bar. On Friday he did not get the clipboard out.

I'm not entirely sure what happened at the bar, but approximately ten minutes after he arrived, Crabtree was sitting down with what appeared to be a drink and was engaged in what I can only describe as a philosophical conversation. I heard the words "cause and effect" and "the nature of skill" and "whether machines can have intentions." He seemed genuinely interested. He was there for forty-five minutes.

During this period, Daniel completed his run. 347,800. The bar was packed. People were there who had never been before. Nobody interfered.

Crabtree left at 10:08. He did not use his clipboard. I noted his departure time in the log.

I believe he may have found a loophole in the space-time of bureaucracy. I have written this in the log. I feel it is accurate.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_distracted && time.year >= 1979 &&
      time.week >= 6 && !sentIds.has('gary_danny_finale_distracted'),
    choices: null,
  },

  // ── Beat 13a — Danny's final letter (Path A: stayed with player) ──────────
  {
    id: 'danny_letter_02_stay',
    from: 'Danny Chen',
    address: 'dchen.personal@hotmail.com',
    subject: 'Update',
    body: ({ decisions = {} }) => {
      let body = `Dear Owner,

I am writing from a new email address. I got a computer.

I wanted to update you. I have been asked to help Mr. Darrow with weekend maintenance sessions, starting in the new year. He says I already know more than most people he's worked with. I told him I had been paying attention.`;

      if (decisions.danny_watched_repairs) {
        body += ` He said he knew — apparently he noticed me watching and made a note of it. He didn't say whether the note was in a log. I suspect it was.`;
      }

      body += `\n\nI also wanted to say that I have been coming here for three years. I don't think I've said this directly: I am glad the bar exists. I think it matters that a place like this exists.

Thank you for letting me practise here. And for the Ribena.

Yours sincerely,`;

      if (decisions.danny_welcomed_warmly) {
        body += `\nDanny`;
      } else {
        body += `\nDaniel Chen`;
      }
      return body;
    },
    trigger: ({ time, sentIds, decisions }) =>
      !sentIds.has('danny_letter_02_stay') &&
      !decisions.danny_shared_with_reg &&
      !decisions.danny_slipped_out &&
      (decisions.danny_stayed_for_run || decisions.crabtree_distracted) &&
      time.year >= 1979 && time.week >= 8,
    choices: null,
  },

  // ── Beat 13b — Danny's final letter (Path B: shared with Reg) ────────────
  {
    id: 'danny_letter_02_reg',
    from: 'Danny Chen',
    address: 'dchen@thebumperzone.biz',
    subject: '(no subject)',
    body:
`Hi.

I have a new email address now — the one at the top. I'm mostly over at The Bumper Zone these days.

I just wanted to write. I'm not sure why. I think I wanted to say that I still think about the machine near the window sometimes. The one with the rocket. I was on that machine a lot in the beginning.

Anyway. I hope things are going well.

Daniel`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.danny_shared_with_reg && time.year >= 1977 &&
      time.week >= 10 && !sentIds.has('danny_letter_02_reg'),
    choices: null,
  },

  // ── Beat 13c — Danny's final letter (Path C: score was lost) ─────────────
  {
    id: 'danny_letter_02_gone',
    from: 'Danny Chen',
    address: 'computing.lab@eastfieldsecondary.ac.uk',
    subject: 'Update — regional competitions',
    body: ({ decisions = {} }) => {
      let body = `Dear Owner,

I wanted to let you know that I have entered the Regional Pinball Championships in March. Gary told me about them. He said my scores were "well within the qualifying range," which I believe is Gary for "you should do this."

I have been practising very seriously. I think I am ready.

I wanted to thank you for the use of the machines over the past few years. I have learned a great deal here.

Yours sincerely,`;

      if (decisions.danny_welcomed_warmly) {
        body += `\nDanny (Daniel Chen, age 15 — for official correspondence)`;
      } else {
        body += `\nDaniel Chen, age 15`;
      }
      return body;
    },
    trigger: ({ time, sentIds, decisions }) =>
      decisions.danny_slipped_out && time.year >= 1979 &&
      time.week >= 8 && !sentIds.has('danny_letter_02_gone'),
    choices: null,
  },

];
