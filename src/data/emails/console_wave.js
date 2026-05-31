// ── The Console Wave Arc (1983–1989) ─────────────────────────────────────────
// The rise of home computers and console gaming threatens arcade culture in the UK.
// Begins with the ripples of the 1983 North American video game crash, builds through
// the ZX Spectrum/C64 era, and peaks when the NES arrives in UK shops in late 1987.
//
// Key dates:
//   1983 — North American video game crash; Famicom launches in Japan
//   1985 — NES test launch in New York and Los Angeles
//   1986 — NES available nationwide in the US; UK home computer market booming
//   1987 — NES arrives in UK shops (October 1987)
//   1989 — Outcomes diverge depending on player decisions
//
// Characters:
//   Terry Baines (existing) — distributor watching the industry shift with forced optimism
//   Gary Kowalski (existing) — notes attendance changes with characteristic data
//   Marcus Webb (new) — young consultant who saw the US crash firsthand
//   Darren Holt (new) — teenage regular slowly pulled away by home gaming
//
// Arc flags (set via decisions):
//   doubled_down_pinball   — decision 1: invested in pinball identity
//   added_video_cabinet    — decision 1: diversified into video cabinets
//   console_wave_ignored   — decision 1: waited and saw
//   hosted_pinball_league  — decision 2: weekly league nights
//   ran_nostalgia_campaign — decision 2: "Real Machines" press campaign
//   cut_opening_hours      — decision 2: cut costs
//   ran_championship       — decision 3: city-wide championship
//   accepted_decline       — decision 3: pivoted to adult regulars
//   leaned_into_nostalgia  — decision 3: vintage/decor push

export const consoleWaveEmails = [

  // ── Beat 1 — Terry hears about the North American crash (1983) ───────────
  {
    id: 'terry_console_01',
    from: 'Terry Baines',
    address: 't.baines@tristatecoinop.com',
    subject: 'Industry Update — North American Situation',
    body:
`Hello —

Terry Baines here. I don't normally write about bad news because in this business, if you sit around thinking about bad news you'd never get out of bed. However.

I've been hearing from my contacts in the States that the coin-op market over there has had what I'm choosing to describe as "a significant readjustment." The short version: Atari shipped a lot of units and a lot of software. Not all of it was very good. Some of it was quite bad. The public, as a collective entity, noticed.

The upshot is that several North American operators are pulling machines and going back to just serving drinks. A few of the bigger distributors have gone under entirely. I mention this not to alarm you but because you should know.

Here's the thing — and I want you to hear this clearly — this is an American problem. Their market got flooded with cheap home computers and a lot of substandard games, and people stopped going out. Our market is different. Our pubs are different. British people will always go to a pub. It's constitutional.

I'll be in touch.

Terry Baines
Tri-State Coin-Op
"We Move Machines"`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1983 && time.week >= 3 && sentIds.has('terry_02') && !sentIds.has('terry_console_01'),
    choices: null,
  },

  // ── Beat 2 — Gary notices the numbers shifting (1984) ────────────────────
  {
    id: 'gary_console_01',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'an observation (numbers)',
    body:
`Hi.

I want to share something from the log because I've been sitting on it for a few weeks and I think you should have the data.

Since the start of this year, Tuesday attendance is down. I've been counting for long enough that I'm confident the numbers are real. Over the last five Tuesdays: 14, 11, 13, 9, 12. My baseline for the previous three years was approximately 18 to 22. That's a drop of roughly thirty percent.

I want to be clear: I don't know what this means. Dave has a theory involving "the recession" and I've noted it in the log as a hypothesis. My own feeling is that it's more specific than that, but I can't say exactly what.

The machines are fine. I played the silver one near the back on Tuesday. Got 87,000. The place is good. The numbers are just down.

I thought you should know. I have a spreadsheet if that would be helpful.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('terry_console_01') && time.year >= 1984 && time.week >= 2 && !sentIds.has('gary_console_01'),
    choices: null,
  },

  // ── Beat 3 — Marcus Webb arrives (1984) ──────────────────────────────────
  {
    id: 'marcus_01',
    from: 'Marcus Webb',
    address: 'm.webb@coinopfutures.co.uk',
    subject: 'Independent Operator Consultation — Without Obligation',
    body:
`Dear Owner,

My name is Marcus Webb. I'm a consultant working with independent coin-op and amusement operators across the UK.

I spent eighteen months working for a mid-size distributor in New Jersey before the crash — which I mention only to establish context, not to alarm you. I came back to the UK in 1983 with a fairly detailed understanding of how home computing affects arcade footfall. I have seen what happens when operators adapt early and when they don't.

I won't pitch you on this email. I just want to say that the picture I'm seeing in the UK market has some structural similarities to what I observed in the States in late 1981 and early 1982. The home computer market here is maturing faster than most people in the industry are acknowledging.

I'd welcome a thirty-minute conversation if you're open to it. No obligation. I'll buy the coffee.

Best regards,
Marcus Webb
CoinOp Futures Ltd`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('gary_console_01') && time.year >= 1984 && time.week >= 6 && !sentIds.has('marcus_01'),
    choices: null,
  },

  // ── Beat 4 — Darren Holt's first email (1985) ────────────────────────────
  {
    id: 'darren_01',
    from: 'Darren Holt',
    address: 'dholt84@compunet.co.uk',
    subject: 'probably nothing',
    body:
`Hi, this is Darren — I come in on Fridays, usually on the machine with the astronaut on it.

I just wanted to write and say I probably won't be in as much for a while. My dad got me a Commodore 64 for Christmas and I've been at it most evenings. I know that probably sounds like a rubbish excuse.

It's not as good as the real thing, obviously. The games on it are all a bit flat. But it's just sort of always there.

I'll probably come back in. I just wanted to say so you didn't wonder.

Darren`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('marcus_01') && time.year >= 1985 && time.week >= 4 && !sentIds.has('darren_01'),
    choices: null,
  },

  // ── Beat 5 — Terry, less optimistic now (1986) ───────────────────────────
  {
    id: 'terry_console_02',
    from: 'Terry Baines',
    address: 't.baines@tristatecoinop.com',
    subject: 'RE: Industry Update — Revised Assessment',
    body:
`Hello —

Terry again. I want to walk back something I said in a previous letter.

I said this was an American problem. I may have been premature. I've been speaking to some of the bigger operators up and down the country and there's a general feeling that footfall is down across the board. Not catastrophically. But consistently.

More to the point: Nintendo has launched something in the States called the NES — Nintendo Entertainment System. It's a home console but the thing is — and this is the part that kept me up — the games are actually good. They're proper games. Not the cheap stuff that caused the crash. This is something different. My contact in Chicago says the queues outside toy shops went around the block at Christmas.

It's not here yet. But it will be. Word travels fast enough.

I'm not panicking. I want to be clear about that. But I am writing down my thoughts, which for me is the early warning sign of a mild panic.

I'll be in touch.

Terry Baines
Tri-State Coin-Op
"We Move Machines (Slightly More Carefully Now)"`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('darren_01') && time.year >= 1986 && time.week >= 1 && !sentIds.has('terry_console_02'),
    choices: null,
  },

  // ── Beat 6 — Gary's full data breakdown (1986) ───────────────────────────
  // Checked by the nes_response decision condition.
  {
    id: 'gary_console_02',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the numbers (full breakdown)',
    body:
`Hi.

I've been meaning to send this for a while and I've decided to just send it.

I have been tracking Tuesday attendance for six years. Here is the summary:

1980: average 21 per Tuesday
1981: average 20 per Tuesday
1982: average 19 per Tuesday
1983: average 16 per Tuesday
1984: average 14 per Tuesday
1985: average 12 per Tuesday

This is a consistent decline over five years. I want to note that I do not think the bar has done anything wrong. The machines are good. The bar is good. I am here every week. But the numbers are what they are.

I don't know what to do with this. I wanted to give you the data because you should have the data. What happens next is not really a spreadsheet question.

I have made a graph if that would help. My wife looked at it and said "it looks like a slope." I told her it was a trend line. She said "yes, that's what I said."

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('terry_console_02') && time.year >= 1986 && time.week >= 3 && !sentIds.has('gary_console_02'),
    choices: null,
  },

  // ── Beat 7 — Darren's second email (1987) ────────────────────────────────
  // Checked by the console_peak_response decision condition.
  {
    id: 'darren_console_02',
    from: 'Darren Holt',
    address: 'dholt84@compunet.co.uk',
    subject: 're: probably nothing (update)',
    body:
`Hi again.

I know I said I'd probably come back in. I meant it at the time. But it's been a while and I thought I should be honest.

My mate Chris got a Nintendo. Like the actual Nintendo, the NES. It's in shops now. We've been at his on Friday nights — there are four of us and we all take turns and it's just very easy to stay there and not go out.

The thing is, I know the real machine is better. I know that. When I think about the astronaut machine, and the particular way it bounces when you nudge it right, I know that's not something you can get on the telly. But the Nintendo is just there. You don't have to go anywhere.

I'm not saying I'm not coming back. I'm just being honest.

Darren

P.S. If you do any events or anything, let me know. I'd probably come for that.`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('gary_console_02') && time.year >= 1987 && time.week >= 2 && !sentIds.has('darren_console_02'),
    choices: null,
  },

  // ── Beat 8 — Marcus Webb's mid-term assessment (1988) ────────────────────
  {
    id: 'marcus_console_02',
    from: 'Marcus Webb',
    address: 'm.webb@coinopfutures.co.uk',
    subject: 'Mid-Term Assessment — UK Coin-Op Market',
    body: ({ decisions = {} }) => {
      const adapted = decisions.doubled_down_pinball || decisions.hosted_pinball_league ||
                      decisions.ran_nostalgia_campaign || decisions.added_video_cabinet ||
                      decisions.ran_championship;

      if (adapted) {
        return `Dear Owner,

I wanted to send a mid-term note, given we were in touch a few years ago.

You're one of the operators who read the room early. The work you did to build something durable here — whether that was the community angle, the events, or just keeping the quality high — is visible in the numbers. Not every independent operator made that call.

The NES arrived in UK shops last autumn. The market is feeling it. But there's a category of venue where the experience genuinely can't be replicated at home, and those places are holding. I think you're in that category.

The wider market is going to get harder before it gets easier. But the people who come to a place like yours are coming for something the Nintendo can't give them. You've made sure they know that.

Good luck. I mean that.

Marcus Webb
CoinOp Futures Ltd`;
      } else {
        return `Dear Owner,

I wanted to send a note, since I reached out a few years ago.

The NES arrived in UK shops last October. The operators who held off on adapting are feeling it now. I don't say that to be discouraging — I say it because it's useful to name the moment clearly.

There's still time to make a move. The venues that survive this period are the ones that give people a reason to leave the house. That's the question worth sitting with: what does your venue offer that a Nintendo in the living room doesn't?

It's a real question. I'd be glad to work through it with you if you want.

Marcus Webb
CoinOp Futures Ltd`;
      }
    },
    trigger: ({ time, sentIds }) =>
      sentIds.has('marcus_01') && time.year >= 1988 && time.week >= 1 && !sentIds.has('marcus_console_02'),
    choices: null,
  },

  // ── Outcome A — Gary's numbers recovering (championship path) ─────────────
  {
    id: 'gary_console_recovery',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the numbers — recovery data',
    body:
`Hi.

I wanted to send an updated summary because the numbers have changed in a direction I want to document properly.

Tuesday attendance this year: average 17 per night. That's up from 12 in 1985 and 10 in 1987. I have been tracking the recovery since the championship. The new faces who came in for the event — a significant number of them became regulars. I've been counting carefully because I thought you'd want the data.

My wife looked at the updated graph. She said "it looks like a ski jump." She means this in a positive way. I believe she is right.

I want to note for the record: I attended every week throughout the decline. My attendance data is unbroken from 1976. I feel this is worth noting.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.ran_championship && time.year >= 1989 && time.week >= 3 &&
      !sentIds.has('gary_console_recovery') && !sentIds.has('gary_console_holding') && !sentIds.has('gary_console_decline'),
    choices: null,
  },

  // ── Outcome B — Gary's numbers holding (community path) ───────────────────
  {
    id: 'gary_console_holding',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the numbers — current status',
    body:
`Hi.

An update.

Tuesday attendance: average 14 per night. This has been consistent for about eighteen months. I would describe the situation as: established. Not the peaks of 1980 and 1981. But stable. A core of people who come regularly and seem to have no intention of stopping.

I have a theory about this, which I want to share because I've been thinking about it. The people who kept coming — the regulars — didn't come back because they changed their minds about home consoles. They came back because this place is something else. It's something you do together. I've watched the league nights and that's what I see: people doing something together, in a room, with other people.

I don't know if this is useful information. It's in the log. The entry is fairly long.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds, decisions }) =>
      !decisions.ran_championship && decisions.hosted_pinball_league &&
      time.year >= 1989 && time.week >= 3 &&
      !sentIds.has('gary_console_recovery') && !sentIds.has('gary_console_holding') && !sentIds.has('gary_console_decline'),
    choices: null,
  },

  // ── Outcome C — Gary's quiet accounting (ignored path) ────────────────────
  {
    id: 'gary_console_decline',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'the numbers',
    body:
`Hi.

I wanted to send an update. I've been holding off but I think you should have the data.

Tuesday attendance: average 8 per night. Down from 21 in 1980. I have nine years of unbroken records. The trend has been consistent.

I don't have a recommendation. I'm not an expert in this. I just have the numbers.

I still come every week. The machines are still good. I got 91,000 on Tuesday, which I believe is a personal best. I noted it in the log.

I just wanted to make sure you had the data.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.console_wave_ignored && !decisions.doubled_down_pinball &&
      !decisions.hosted_pinball_league && !decisions.ran_nostalgia_campaign && !decisions.ran_championship &&
      time.year >= 1989 && time.week >= 3 &&
      !sentIds.has('gary_console_recovery') && !sentIds.has('gary_console_holding') && !sentIds.has('gary_console_decline'),
    choices: null,
  },

  // ── Outcome D — Darren comes back (championship path) ─────────────────────
  {
    id: 'darren_returns',
    from: 'Darren Holt',
    address: 'dholt84@compunet.co.uk',
    subject: 'came to the championship',
    body:
`Hi.

I came to the championship last month. I almost didn't — I kept telling myself I'd go and then not going, and then I just went.

I don't know how to explain this properly, but: it was better than I remembered. Being in the room with the actual machines, with actual people, doing something that has to be done right and can't be done on the sofa — it was just better.

I've been in three times since. I'm on the astronaut machine again. Haven't beaten my old score yet but I'm working on it.

I'm glad the place is still here.

Darren`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.ran_championship && time.year >= 1989 && time.week >= 6 &&
      !sentIds.has('darren_returns') && !sentIds.has('darren_drifts'),
    choices: null,
  },

  // ── Outcome E — Darren drifts away (ignored/declined path) ────────────────
  {
    id: 'darren_drifts',
    from: 'Darren Holt',
    address: 'dholt84@compunet.co.uk',
    subject: '(no subject)',
    body:
`Hi.

A mate mentioned you're still open. I thought I should write.

I keep meaning to come back in. I said that before, I think. But there's always something. I've got a proper games setup at home now. It's not the same as the real machines, I know that. But it's just easier.

I hope things are going okay.

Darren`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.console_wave_ignored && !decisions.ran_championship && !decisions.hosted_pinball_league &&
      time.year >= 1989 && time.week >= 6 &&
      !sentIds.has('darren_returns') && !sentIds.has('darren_drifts'),
    choices: null,
  },

];
