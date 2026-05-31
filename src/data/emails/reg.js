import { lin } from './utils';

// ── Reg Nutter (The Bumper Zone) ──────────────────────────────────────────────
// Arc: petty rival → grudging respect → cluster finding cracks the wall →
//      reluctant friends → genuine allies against the death of pinball →
//      closure. His wife Linda understands him better than he does.
//
// Voice: terse, corporate-speak used wrong, Gottlieb running gag, signs with
//        full name when defensive, just "Reg" as he warms up, P.S.s reveal more
//        than the body, never says an emotion directly.

export const regEmails = [

  // ── First contact (1977) ─────────────────────────────────────────────────

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
    expiresAfterDays: 3,
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

  // ── Rivalry peak (1981–1982) ──────────────────────────────────────────────

  {
    id: 'reg_rival_01',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'a professional concern',
    body:
`Hi.

I'll keep this brief.

I've noticed that your bar has been receiving a number of customers who previously frequented The Bumper Zone. I'm not making accusations. I'm simply noting a pattern. The pattern is that they go to your place now instead of mine, and I am noting this formally, in writing, in case it becomes relevant.

I don't know what you're doing differently. If I did, I wouldn't be writing this. I'm writing this because I don't know what you're doing differently and I find that frustrating.

I remain a professional.

Reg Nutter
Owner & Operator, The Bumper Zone
"Where Bumping Is Our Business"

P.S. The Gottlieb is fully fixed. I want that noted also.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1981 && sentIds.has('reg_04') && !sentIds.has('reg_rival_01'),
    choices: null,
  },

  {
    id: 'reg_rival_02',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'update from our end',
    body:
`Hi.

We have expanded.

The Bumper Zone now has a second room. I'm calling it The Inner Zone. This was Steve's idea and I've decided to credit him with it, though the concept was broadly mine.

The Inner Zone has four machines, a dedicated lighting scheme, and a carpet I am quite pleased with. The machines are performing well. The lighting scheme required three separate conversations with the electrician, but we got there in the end and the result is, I think, striking.

I mention this not to gloat. I mention this because I believe competition keeps us both sharp. That is the professional way to look at it. I am looking at it the professional way.

Reg Nutter
Owner & Operator, The Bumper Zone

P.S. The Gottlieb is still fully fixed. There was a sound last Tuesday but it has been looked at and the looking-at resolved it.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1982 && sentIds.has('reg_rival_01') && !sentIds.has('reg_rival_02'),
    choices: null,
  },

  // ── Rivalry cools (1983–1985) ─────────────────────────────────────────────

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
      time.year >= 1983 && sentIds.has('reg_rival_02') && !sentIds.has('reg_05'),
    choices: null,
  },

  {
    id: 'reg_acknowledge',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'saw the piece in the paper',
    body:
`Hi.

I saw the piece in the local paper. About your bar.

I'm not going to say it was inaccurate. I read it twice, which I don't normally do with things I disagree with. Some of the things they said about the atmosphere were — I will say "fair." Objectively fair. Atmospherically speaking.

I want you to know I don't read that as a competitive threat. I've decided to read it as context. Two bars, different clientele, different strengths. That's a reasonable picture of the industry and I think both of us can operate in it.

The Bumper Zone has its own strengths. I could list them. I'm choosing not to, because this is already a longer email than I intended.

Anyway. Well done, I suppose. Professionally speaking.

Reg

P.S. The Gottlieb is making a different sound now. I'm told this is an improvement.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1986 && sentIds.has('reg_05') && !sentIds.has('reg_acknowledge'),
    choices: null,
  },

  // ── The Voss finding changes things (1988) ────────────────────────────────

  {
    id: 'reg_cluster_reply',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'the academic woman',
    body:
`Hi.

I received a letter from the academic woman. Dr. Voss. You probably got one too.

She's been looking at competition. At how having two bars near each other is — and I'm summarising — apparently good for both of us. Her data is quite thorough. I've read it twice and I think she's right, which I am not thrilled about.

The part that stays with me is the bit about regulars. She says that people who find us find you, and people who find you find us. That our existence supports each other.

That is a sentence I would not have written two years ago.

I don't know what to do with this information. I've decided the answer is to do nothing with it and simply have it.

Reg

P.S. The Gottlieb is fixed. The new sound was also fixed. There is currently no sound.`,
    trigger: ({ sentIds }) =>
      sentIds.has('voss_03') && sentIds.has('reg_acknowledge') && !sentIds.has('reg_cluster_reply'),
    choices: null,
  },

  // ── Franchise arc ─────────────────────────────────────────────────────────

  {
    id: 'reg_franchise_01',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: "heard you've expanded",
    body:
`Hi.

I have heard — through general industry channels, which is to say Dave Morley mentioned it at the trade suppliers — that you've opened a second location.

I don't know how to describe how I feel about this professionally. So I'll say: I note it as a significant strategic development in the local sector. That is my official position on the matter.

I also note that you didn't mention it. Which is fine. We're not required to mention things.

Reg Nutter
Owner & Operator, The Bumper Zone
"Pinball Done Properly"

P.S. The Gottlieb is making a new sound. I am not going to connect these two pieces of information.`,
    trigger: ({ time, sentIds, franchises }) =>
      franchises.length >= 1 && time.year >= 1990 &&
      sentIds.has('reg_acknowledge') && !sentIds.has('reg_franchise_01'),
    choices: null,
  },

  {
    id: 'reg_franchise_02',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'The Bumper Zone Expansion Initiative',
    body:
`Hi.

I wanted to let you know — professionally — that The Bumper Zone is expanding.

I've been planning this for some time. The second location will be called The Outer Zone. I want to be clear that this name was entirely my idea and is in no way a response to decisions made by other operators in the area. It simply reflects a natural geographic extension of our brand identity.

The Outer Zone will have six machines, a modified version of our signature carpet, and a lighting scheme I'm already quite pleased with. Steve said "that's a big step." I told him it was a calculated step. He said those are the same thing. He's not wrong, but I didn't say that.

I'm telling you because I feel we've reached a stage where these things can be mentioned. That's how I'm choosing to read our professional relationship at this point.

Reg Nutter
Owner & Operator, The Bumper Zone (Two Locations)
"Pinball Done Properly — In More Places"

P.S. The Gottlieb has been relocated to The Outer Zone as a "featured machine." This is not why I'm expanding. I just want that noted.`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('reg_franchise_01') && time.year >= 1992 && !sentIds.has('reg_franchise_02'),
    choices: null,
  },

  {
    id: 'reg_franchise_result',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'operational update',
    body:
`Hi.

A brief operational update.

The Outer Zone has been consolidated back into the main Bumper Zone operation. This was a strategic decision following a full review of the financial and logistical picture. It was not — and I want to be clear about this — a failure. It was a reallocation of resources in response to a market that was, I'll acknowledge, more challenging than the original projections suggested.

The machines are back. Most of them.

Linda said "I told you." I said she hadn't told me. She said "I thought it, which is the same thing." We've been married long enough that this is a reasonable position.

The main Bumper Zone is still here. Still the same. Some things don't need two locations to work.

Reg

P.S. The Gottlieb came back too. It is not doing well. But it came back.`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('reg_franchise_02') && time.year >= 1996 && !sentIds.has('reg_franchise_result'),
    choices: null,
  },

  // ── First friendly gesture (1991) ────────────────────────────────────────

  {
    id: 'reg_drink',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'a different kind of proposition',
    body:
`Hi.

I wanted to ask something and I couldn't find a professional context for it, so I'll just ask.

Do you want to get a drink sometime? Not to discuss anything specific. Just as people who run pinball bars, who have been doing this for a while, and who I think both understand something about it that other people don't.

I have questions I can't ask anyone else. Not about machines. More generally. About whether this is something you also just — keep doing. And what that's like.

The pub on Marsden Street does a reasonable bitter.

Let me know. No pressure either way.

Reg

P.S. I mentioned I was reaching out to a professional contact. My wife said "you mean your friend from the other bar." I told her that's not how I'd describe it. She said "I know, Reg."`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1991 && sentIds.has('reg_cluster_reply') && !sentIds.has('reg_drink'),
    choices: null,
  },

  // ── Industry fear sets in (1994) ─────────────────────────────────────────

  {
    id: 'reg_industry_news',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'Williams',
    body:
`Hi.

Have you heard about Williams?

I don't want to spell it out but I've been reading some things and I'm not sure the news is good. If you have contacts in the supply chain, it might be worth asking questions. I'm not speculating. I'm just saying it's worth asking.

Bally's already gone. I still think about that. We had three Ballys. Three. And now they're just — historical.

I know that sounds dramatic. It feels less dramatic when you're looking at a parts catalogue that's been getting shorter every year.

What are you doing about spares? I've been ordering ahead when I can. It felt paranoid six months ago. It feels less paranoid now.

Reg

P.S. The Gottlieb is having a thing. I'm not calling it a problem. It's a thing.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1994 && sentIds.has('reg_drink') && !sentIds.has('reg_industry_news'),
    choices: null,
  },

  // ── Linda visits (1997) ───────────────────────────────────────────────────

  {
    id: 'reg_wife',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'a small update',
    body:
`Hi.

My wife came to your bar last Saturday. I want to be clear I did not suggest this. She went of her own initiative, with her friend Barbara.

She said it was "cosy." She said the machines were well-maintained. She said it had "a nice feeling to it, like the machines were happy to be there."

I told her that machines don't have feelings. She said "I know, Reg."

She also mentioned the carpet. We have the same carpet we've always had. It is a perfectly functional carpet.

I'm not writing this as a complaint. I just thought you should know. And I needed to tell someone who would understand what it's like to hear your wife describe a competitor's bar as cosy.

Reg

P.S. The Gottlieb is fine. Linda didn't mention it, which I'm choosing to read as positive.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1997 && sentIds.has('reg_industry_news') && !sentIds.has('reg_wife'),
    choices: null,
  },

  // ── Williams goes under (2000) ────────────────────────────────────────────

  {
    id: 'reg_millennium',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'Williams',
    body:
`Hi.

Williams filed for bankruptcy.

I know you've seen it. I've been sitting with it for a few days. I keep thinking about the first Williams we had — a '72, bought second-hand. It came with a manual held together with a rubber band. We played it through a whole winter.

I'm not saying it's the end of anything. The machines still exist. But something ended.

I don't know what we do now. I mean that broadly, not just about parts.

Still here, anyway.

Reg

P.S. I'm not going to make a Gottlieb joke this time. It doesn't feel right.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2000 && sentIds.has('reg_wife') && !sentIds.has('reg_millennium'),
    choices: null,
    event: {
      label: 'Industry News',
      severity: 'bad',
      message: "Reg has heard something. Check your inbox.",
    },
  },

  // ── Checking in as things slow (2002) ─────────────────────────────────────

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
      time.year >= 2002 && sentIds.has('reg_millennium') && !sentIds.has('reg_06'),
    choices: null,
    event: {
      label: 'Industry Warning',
      severity: 'bad',
      message: 'Even the competition is feeling the pinch.',
    },
  },

  // ── The plan (2004) ───────────────────────────────────────────────────────

  {
    id: 'reg_plan',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'an idea (hear me out)',
    body:
`Hi.

I've been thinking and I have an idea. Hear me out.

What if we did a joint event. Both bars, one evening. I've seen other places doing things like this — making themselves into an occasion rather than just somewhere to go on a Tuesday. A "Night of Pinball." Both venues, one ticket. People move between them.

We'd split the costs on a flyer. The record shop on Deacon Street might put something in the window. Maybe a piece in the paper.

I know this is unusual. I know we've never done anything like this. But I think we need to do something, and I'd rather do something a bit stupid with someone I trust than do nothing at all.

If you think it's a terrible idea, say so. I can take it.

Reg

P.S. The Gottlieb is still going. Not fully fixed, I'll be honest with you now. But still going.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2004 && sentIds.has('reg_06') && !sentIds.has('reg_plan'),
    choices: [
      { label: "Count me in. Two bars, one night.", effectId: null, decisionsFlag: 'reg_joint_night_confirmed' },
      { label: "Not quite the right timing.", effectId: null, decisionsFlag: 'reg_joint_night_deferred' },
    ],
  },

  // ── Still standing (2006) ─────────────────────────────────────────────────

  {
    id: 'reg_stubbornness',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'renewed the lease',
    body:
`Hi.

I renewed the lease.

My accountant said not to. Linda said I should think carefully. I thought carefully and then I renewed it anyway.

I'm not sure I can explain the reasoning, except to say: not yet.

Still here.

Reg`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2006 && sentIds.has('reg_plan') && !sentIds.has('reg_stubbornness'),
    choices: null,
  },

  // ── Things are bad (2007) ─────────────────────────────────────────────────

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
      time.year >= 2007 && sentIds.has('reg_stubbornness') && !sentIds.has('reg_07'),
    choices: null,
  },

  // ── Closing (2010) ────────────────────────────────────────────────────────

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
    choices: [
      { label: "Come over. Take whatever you want. The Gottlieb too.", effectId: null, decisionsFlag: 'reg_farewelled_warmly' },
      { label: "Take care of yourself, Reg.", effectId: null, decisionsFlag: 'reg_farewelled_briefly' },
    ],
    event: {
      label: 'The Bumper Zone is Closing',
      severity: 'bad',
      message: 'After years of competition, Reg is shutting his doors. Check Pinball Net.',
    },
  },

];
