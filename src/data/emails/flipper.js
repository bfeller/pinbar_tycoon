// ── The Flipper ───────────────────────────────────────────────────────────────
// Cryptic, plural, and deeply weird. The machines are conscious — or something
// is — and it's been watching longer than the player has been playing.
// Short emails. Lots of white space. No explanation.

export const flipperEmails = [

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
      popularity >= 50 && !sentIds.has('flipper_01'),
    choices: null,
  },

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
      popularity >= 150 && sentIds.has('flipper_01') && !sentIds.has('flipper_02'),
    choices: null,
  },

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
      popularity >= 300 && sentIds.has('flipper_02') && !sentIds.has('flipper_03'),
    choices: null,
  },

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

];
