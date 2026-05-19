import { lin } from './utils';

// ── Reg's Spy Arc ─────────────────────────────────────────────────────────────
// Triggers only if the player bought Reg's Bally (machine name check).
// Arc: Reg installed something in the machine → suspicious emails → anonymous tip
//      → confrontation (choice) → Reg's humiliating non-denial denial → resolution.
//
// Voice: same as mainline Reg — terse, corporate-speak used wrong, P.S.s reveal
//        more than the body, never admits an emotion directly.

const hasBally = ({ machines }) => machines.some(m => m.name === "Reg's Bally (1978)");

export const regSpyEmails = [

  // ── Reg knows too much (1977) ─────────────────────────────────────────────

  {
    id: 'reg_spy_01',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'general update',
    body:
`Hi.

Just a general update from our end. Things are fine.

I was just thinking — and this is a coincidence — that Tuesday evenings seem like a good time to run a special. I understand some bars have had strong numbers on Tuesdays recently. Not saying yours specifically. Just in the industry. Generally.

Anyway. I'm sure you're making your own decisions.

Reg

P.S. How's the Bally? It runs best if you leave it on during business hours. This is a technical thing. The machine benefits from continuous operation. That's all that is.`,
    trigger: ({ time, machines, sentIds }) =>
      hasBally({ machines }) && sentIds.has('reg_03') &&
      !sentIds.has('reg_spy_01') && lin(time) >= lin({ year: 1977, week: 8, day: 1 }),
    choices: null,
  },

  {
    id: 'reg_spy_02',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'RE: (no subject)',
    body:
`Hi.

Sorry — replying to my previous email because I wanted to add something.

You mentioned (or I assumed, or it came up in general industry awareness) that you might be looking at acquiring another machine. Just so you know, the Bally you have operates better when it's the only Bally-type machine in a room. It's a spatial thing. Something to do with the audio.

This is not me suggesting you shouldn't buy another machine. This is purely technical information that I happen to have about that specific unit.

Reg

P.S. The Bally should ideally face east. If it's currently facing east, please ignore this. If it isn't, you might want to consider it. For acoustic reasons. There are no other reasons.`,
    trigger: ({ time, machines, sentIds }) =>
      hasBally({ machines }) && sentIds.has('reg_spy_01') &&
      !sentIds.has('reg_spy_02') && lin(time) >= lin({ year: 1977, week: 10, day: 1 }),
    choices: null,
  },

  {
    id: 'reg_spy_03',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'overheard something',
    body:
`Hi.

This is a bit awkward to bring up, but I feel professionally obligated.

I overheard — through general trade channels, you understand — that you're considering whether to keep the Bally or move it to storage. I just want to say that would be a mistake. Specifically for that machine. It's not a storage machine. It needs to be active. Plugged in. Running. In the main room.

I feel strongly about this from a technical standpoint and I would like that noted.

Reg

P.S. I also heard the bathroom situation is going well. Good. That's good. I don't know why I know that.`,
    trigger: ({ time, machines, sentIds }) =>
      hasBally({ machines }) && sentIds.has('reg_spy_02') &&
      !sentIds.has('reg_spy_03') && lin(time) >= lin({ year: 1978, week: 2, day: 1 }),
    choices: null,
  },

  // ── Anonymous tip ─────────────────────────────────────────────────────────

  {
    id: 'reg_spy_anon',
    from: 'A Friend',
    address: 'noreply@anonymous.net',
    subject: 'Something you should know about that Bally',
    body:
`Hi.

You don't know me. I work near The Bumper Zone. I've seen some things.

The machine Reg sold you — the 1978 Bally — has something in it. In the cabinet. Behind the lower left panel. It's been there since before the sale.

I'm not saying what it is exactly. I'm saying you should look. And maybe ask yourself why Reg has been so unusually interested in how that machine is "running."

Good luck.

— A Friend

P.S. He calls it "The Asset." I heard him say this to Steve. Steve seemed confused. Steve is always confused.`,
    trigger: ({ time, machines, sentIds }) =>
      hasBally({ machines }) && sentIds.has('reg_spy_03') &&
      !sentIds.has('reg_spy_anon') && lin(time) >= lin({ year: 1978, week: 4, day: 1 }),
    choices: null,
    event: {
      label: 'Anonymous Tip',
      severity: 'bad',
      message: 'Someone sent you a strange email about the Bally. Check your inbox.',
    },
  },

  // ── Confrontation ─────────────────────────────────────────────────────────

  {
    id: 'reg_spy_confront',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'RE: RE: RE: a proposition',
    body:
`Hi.

I'm going to assume from your silence on the matter of the Bally that everything is fine and you haven't found anything. This is just a standard assumption I'm making.

If you have found something — which you haven't — I want to be clear that it would have a perfectly reasonable explanation that I have prepared but which I hope I won't need to share.

I would like to suggest that we move forward as professionals, in the spirit of the industry, without asking further questions about any specific machine or its internal configuration.

Reg

P.S. If, hypothetically, you were planning to contact me about something, could you do it by reply email rather than showing up in person. Linda is home on Thursdays and she asks questions.`,
    trigger: ({ machines, sentIds }) =>
      hasBally({ machines }) && sentIds.has('reg_spy_anon') &&
      !sentIds.has('reg_spy_confront'),
    choices: [
      { label: "This ends now, Reg.",    effectId: 'reg_spy_end_machine' },
      { label: "...Let it go",           effectId: null },
    ],
    expiresAfterDays: 6,
  },

  // ── Resolution ────────────────────────────────────────────────────────────

  {
    id: 'reg_spy_resolution',
    from: 'Reg Nutter',
    address: 'regnutter@thebumperzone.biz',
    subject: 'RE: RE: RE: RE: a proposition',
    body:
`Hi.

Right.

I don't know what Linda told you when you called. Whatever she said is broadly accurate and I am not disputing it.

I want to be clear that what I did was wrong. I know that. I knew it while I was doing it and I did it anyway, which I think is actually worse, and I've been sitting with that.

The thing is — and I know this doesn't make it better — I was scared. You were doing well. I wasn't. I didn't know how you were doing it and I couldn't ask because we were competitors and competitors don't ask that. So I did something stupid instead.

The device has been remotely deactivated. It was a small radio transmitter. It cost me thirty-four pounds from a catalogue. In retrospect, thirty-four pounds was too much.

I'm sorry. That's what I wanted to say. I'm sorry.

Reg

P.S. The machine is still good. It wasn't bugged at the factory or anything. I added it myself with a soldering iron. The machine is fine.`,
    trigger: ({ sentIds }) =>
      sentIds.has('reg_spy_confront') && !sentIds.has('reg_spy_resolution'),
    choices: null,
  },

];
