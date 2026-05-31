// ── Reg and Linda — Post-Closure Arc (2010–2026) ─────────────────────────────
// Reg closes in 2010. The arc continues quietly through retirement,
// the pinball renaissance, the player's illness, and an offer Reg
// has been preparing for longer than he admits.
//
// Linda Nutter writes for the first time here. She has been in the background
// of Reg's emails for thirty years. When she finally writes directly, it counts.
//
// Path gates:
//   Strong (organ offer):  sentIds.has('reg_drink')
//                          AND (sentIds.has('reg_spy_resolution') OR decisions.reg_joint_night_confirmed)
//   Moderate (money offer): sentIds.has('reg_drink') AND NOT strong conditions
//   Survival (after accepted):
//     Both reg_joint_night_confirmed AND reg_farewelled_warmly → recovers
//     One of the two → complications, survives
//     Neither → does not survive

export const regMedicalEmails = [

  // ── 2012: Reg in retirement ───────────────────────────────────────────────
  {
    id: 'reg_09',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'still here',
    body:
`Hi.

I keep starting this email and not sending it, so I'm just going to send this one.

We moved. Linda wanted somewhere quieter. We found a house in Dorset, near Weymouth, with a garden. I now spend time in the garden, which is not something I anticipated about myself.

I found a 1979 Gottlieb in someone's garage nearby. The solenoid is making a sound. I told Linda it was normal. It isn't. But it's in the living room now and neither of us has mentioned moving it.

I think about the bar sometimes. More than I say out loud.

I hope things are still going up there.

Reg

P.S. Not a joke this time. Just: I hope they are.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2012 && sentIds.has('reg_08') && !sentIds.has('reg_09'),
    choices: null,
  },

  // ── 2016: Reg sees the renaissance ───────────────────────────────────────
  {
    id: 'reg_renaissance_reply',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'I saw something',
    body:
`Hi.

We were in London last weekend — Linda's sister's birthday — and we went past a bar in Shoreditch that had four machines in the window. A Twilight Zone, I think. Maybe an Addams Family. New carpet, new lighting, a queue outside.

I stood on the pavement for longer than Linda thought was appropriate. She didn't say anything, which for Linda means she understood.

I've read that they're calling these places barcades. I don't know how I feel about the word. I think what's in them is better than the word.

I also looked your bar up online. It's still there. I thought you should know that I looked.

Still in Dorset. The Gottlieb is still making the sound.

Reg

P.S. I'm glad the machines survived us.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2016 && sentIds.has('reg_09') && !sentIds.has('reg_renaissance_reply'),
    choices: null,
  },

  // ── 2019: Reg hears about the illness ────────────────────────────────────
  {
    id: 'reg_hears_illness',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'heard something',
    body:
`Hi.

I'm going to get straight to it because I can't find a way to be indirect about this.

I heard you're ill. Gary mentioned it — in the way Gary mentions things, which is to say with a great deal of data and none of the word "sick" — and I understand it's serious.

I don't know what you need. I'm writing to ask. Whatever it is, I want you to know I'm here. Not as a professional contact. Not as someone who used to operate competing premises.

Just here.

Reg

P.S. Linda says the same thing. She said "tell them properly." I think this is properly, for me.`,
    trigger: ({ sentIds }) =>
      sentIds.has('quill_illness') && sentIds.has('reg_09') && !sentIds.has('reg_hears_illness'),
    choices: null,
  },

  // ── 2020: The offer — strong path (organ donation) ────────────────────────
  {
    id: 'reg_offers_organ',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'a proposal',
    body:
`Hi.

I need to tell you something, and I need you to let me finish before you respond.

I've been doing some reading. I went to a specialist in Bournemouth last month — I told Linda it was a routine check-up, which was partially true — and I asked some questions. I've had some tests done.

I'm a match. I know that's an unusual sentence to receive in an email. I've been trying to find a less direct way to say it for about three weeks and I haven't managed it.

I want to donate a kidney. I've already spoken to the hospital. I'm in reasonable health for my age, which is what the consultant said, which I am choosing to interpret as encouraging. The surgery is not without risk. I've read about the risk. I know what I'm doing.

I've told Linda. That conversation was — it was a conversation.

I want to do this. I am not asking you to feel anything specific about it. I am asking you to say yes.

Reg

P.S. Before you argue: I know what this is. I've had a lot of years to think about what kind of person I want to be. I'd like the answer to be a better one than I was in 1978 with a soldering iron and a radio transmitter.`,
    trigger: ({ time, sentIds, decisions }) =>
      time.year >= 2020 && time.week >= 3 &&
      sentIds.has('reg_hears_illness') &&
      sentIds.has('reg_drink') &&
      (sentIds.has('reg_spy_resolution') || decisions.reg_joint_night_confirmed) &&
      !sentIds.has('reg_offers_organ') && !sentIds.has('reg_offers_money'),
    choices: null,
    event: {
      label: 'A Letter from Reg',
      severity: 'neutral',
      message: 'Reg has written with something important. Check your inbox.',
    },
  },

  // ── 2020: The offer — moderate path (financial help) ─────────────────────
  {
    id: 'reg_offers_money',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'what I have',
    body:
`Hi.

I won't pretend I know exactly how bad it is. But I know it's bad.

When we sold the bar, there was some money. Not a fortune. But it's been sitting in Dorset for over a decade earning next to nothing and it's not going anywhere useful.

I want to give you some of it. I've spoken to Linda. She said yes before I finished the sentence, which means she'd already thought about it.

I know it won't fix everything. I know that. But I'm not in a position to do nothing.

Let me know how to get it to you.

Reg

P.S. Linda says she'll be annoyed if you say no. I would take that seriously.`,
    trigger: ({ time, sentIds, decisions }) =>
      time.year >= 2020 && time.week >= 3 &&
      sentIds.has('reg_hears_illness') &&
      sentIds.has('reg_drink') &&
      !sentIds.has('reg_spy_resolution') && !decisions.reg_joint_night_confirmed &&
      !sentIds.has('reg_offers_organ') && !sentIds.has('reg_offers_money'),
    choices: null,
    event: {
      label: 'Reg Has Made an Offer',
      severity: 'good',
      message: 'Reg has offered his savings. The money has been transferred.',
      effect: 'income_delta',
      effectValue: 25000,
    },
  },

  // ── Linda writes before the surgery ──────────────────────────────────────
  {
    id: 'linda_pre_surgery',
    from: 'Linda Nutter',
    address: 'l.nutter.dorset@gmail.com',
    subject: 'Thursday',
    body:
`Hello.

This is Linda. I don't think we've spoken directly before, so: hello properly.

I wanted to write before Thursday, because Reg won't, because he doesn't think it needs saying. I disagree.

He's not scared. I want you to know that in case it helps. He's been unusually calm for the last two weeks — tidying the garage, fixing the Gottlieb's solenoid (finally), cooking dinner twice, which is not his usual number. That's what calm looks like for Reg.

I'm scared enough for both of us, which is also what this marriage looks like.

He wants to do this. He has wanted to do this since before he told you, I think. There was a point, sometime around 2010, when things were very hard, and he came home one evening and said "I've been thinking about things that matter." He didn't say anything else. But I could tell he was talking about more than the bar.

He's in good hands at the hospital. We've been told the risks. We're going in on Thursday with our eyes open.

I just wanted to say hello. I've been reading his emails over his shoulder for thirty years. I thought I should finally send one of my own.

Linda`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.reg_donation_accepted && sentIds.has('reg_offers_organ') &&
      time.year >= 2020 && time.week >= 6 && !sentIds.has('linda_pre_surgery'),
    choices: null,
  },

  // ── Linda writes after — Reg survives (both joint night + warm farewell) ──
  {
    id: 'linda_outcome_good',
    from: 'Linda Nutter',
    address: 'l.nutter.dorset@gmail.com',
    subject: 'He\'s awake',
    body:
`He's awake.

The surgery went well. The consultant used the word "textbook," which is a word I am going to be very fond of for a long time.

Reg is being difficult about the pain medication. He says he doesn't need it. The nurses have a word for patients like him that I won't write here but that is accurate.

He asked me to pass on three things. I am going to pass on all three, even though one of them is just "the Gottlieb made a sound when I got home from the hospital." I told him that wasn't possible. He said "I know." He said it the way he says things when he's decided the facts aren't the point.

The second thing is thank you. He won't write that himself for another few weeks. But he means it in the way he means things — which is completely, and too late, and slightly sideways.

The third thing is: the bar is still standing. Both bars. He said that matters.

He's right. It does.

Linda`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.reg_donation_accepted && sentIds.has('linda_pre_surgery') &&
      decisions.reg_joint_night_confirmed && decisions.reg_farewelled_warmly &&
      time.year >= 2021 &&
      !sentIds.has('linda_outcome_good') && !sentIds.has('linda_outcome_hard') && !sentIds.has('linda_reg_gone'),
    choices: null,
    event: {
      label: 'News from Linda',
      severity: 'good',
      message: "Linda has written. Check your inbox.",
      effect: 'income_delta',
      effectValue: 40000,
    },
  },

  // ── Linda writes after — complications, survives (one choice made) ────────
  {
    id: 'linda_outcome_hard',
    from: 'Linda Nutter',
    address: 'l.nutter.dorset@gmail.com',
    subject: 'he pulled through',
    body:
`He pulled through.

There were complications. I'm not going to minimise it — it was two days I don't want to repeat for the rest of my life. But he's stable now, and the consultant says he's past the difficult part.

Reg would want me to say he handled it with composure. I'm going to say instead that he was frightened, and that I held his hand for most of Tuesday night, and that I think that is closer to the truth and more worth saying.

He's sleeping a lot. He asked me yesterday if the bar was still open. I said I assumed so. He said good, and went back to sleep.

The treatment is working. You have that. Whatever comes next — and I know there is a lot that comes next — you have that.

Linda

P.S. The Gottlieb in the living room has been completely silent since Thursday. I'm going to choose to find that reassuring.`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.reg_donation_accepted && sentIds.has('linda_pre_surgery') &&
      (decisions.reg_joint_night_confirmed !== decisions.reg_farewelled_warmly) &&
      time.year >= 2021 &&
      !sentIds.has('linda_outcome_good') && !sentIds.has('linda_outcome_hard') && !sentIds.has('linda_reg_gone'),
    choices: null,
    event: {
      label: 'News from Linda',
      severity: 'neutral',
      message: "Linda has written. Check your inbox.",
      effect: 'income_delta',
      effectValue: 40000,
    },
  },

  // ── Linda writes after — Reg doesn't survive (neither choice made) ─────────
  {
    id: 'linda_reg_gone',
    from: 'Linda Nutter',
    address: 'l.nutter.dorset@gmail.com',
    subject: '(no subject)',
    body:
`He didn't make it.

I'm not going to write a long email. I don't have a long email in me right now.

He went into surgery calm and he didn't come back, and I am going to have to learn what the rest of my life looks like without him in it, and that is not something I know how to do yet.

I found a note in his jacket pocket. He'd written it a few days before, I think. I'm not going to type the whole thing. But one line I want you to have:

"The machines are still going. That's what I kept thinking about. That they're still going."

He was proud of you, in the sideways way he was proud of things. I want you to know that.

The Gottlieb is still in the living room. I haven't decided what to do with it yet.

Linda`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.reg_donation_accepted && sentIds.has('linda_pre_surgery') &&
      !decisions.reg_joint_night_confirmed && !decisions.reg_farewelled_warmly &&
      time.year >= 2021 &&
      !sentIds.has('linda_outcome_good') && !sentIds.has('linda_outcome_hard') && !sentIds.has('linda_reg_gone'),
    choices: null,
    event: {
      label: 'A Letter from Linda',
      severity: 'bad',
      message: "Linda has written. Check your inbox.",
      effect: 'income_delta',
      effectValue: 40000,
    },
  },

  // ── Reg writes from recovery (2022, if survived) ──────────────────────────
  {
    id: 'reg_recovery',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'still here',
    body:
`Hi.

The consultant says I did well. He said it in the way consultants say things, which is to say the words were positive but the tone was designed to prevent optimism. I am choosing to ignore the tone.

I'm in the garden a lot now. Linda says the exercise is good. She's probably right.

I bought a machine last month. Linda saw the listing and didn't say anything. I took that as permission. It's a '92 Addams Family. It's in perfect condition. I haven't turned it on yet. I'm still deciding where it goes.

I think we both kept something going. I don't know exactly what. But I think we did.

Reg

P.S. The Gottlieb is still making the sound. I've decided the sound is fine.`,
    trigger: ({ time, sentIds }) =>
      (sentIds.has('linda_outcome_good') || sentIds.has('linda_outcome_hard')) &&
      time.year >= 2022 && !sentIds.has('reg_recovery'),
    choices: null,
  },

  // ── Reg's last letter (2024, if survived) ─────────────────────────────────
  {
    id: 'reg_final_letter',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'a thing I wanted to say',
    body:
`Hi.

I've been composing this for about two years.

You know the thing about pinball — the real thing about it, not the industry thing — is that the ball never goes where you think it's going to go. You learn the machine, you build the muscle memory, you get good at predicting. And then one night it catches the post in a way it never has before and goes somewhere completely unexpected, and you've got a fraction of a second to react, and either you do or you don't.

I was bad at that. For most of my life I was bad at the reacting. I'd already decided what was going to happen. I'd already written the outcome down in the column marked "expected." I wasn't watching the ball.

I think you were different. I didn't understand that for a long time.

Anyway. I wanted to say it, since I nearly didn't get the chance.

Reg

P.S. Linda says hello. The Addams Family is in the front room now. The Gottlieb is in the garden shed. It is still making the sound. I think it always will.`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('reg_recovery') && time.year >= 2024 && !sentIds.has('reg_final_letter'),
    choices: null,
  },

];
