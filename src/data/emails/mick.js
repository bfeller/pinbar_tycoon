// ── Mick Darrow — M.D. Amusements Repair ─────────────────────────────────────
// The bar's repairman. Gruff, practical, bills by the hour.
// Arc: young and annoyed (1980) → veteran and grim (1999).
// Emails only fire after the repairman has been hired (staff.repairman === true).

export const mickEmails = [

  {
    id: 'mick_01',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'service note – Black Knight',
    body:
`Hi.

Just flagging something from last night.

The Black Knight. Two levels. I know it's impressive. It's also a nightmare to work on.

The upper playfield rubber rings require removing panel C, then panel A, in that order, before you can get to panel B. The manual says nothing about this. I found out the hard way. Panel B has a sharp edge on the left side that I have also now found the hard way.

I'm noting it for billing purposes. If that machine needs regular rubber work — and it will — factor in an extra thirty minutes per service. That's just how it is.

No complaints. Just information.

Mick`,
    trigger: ({ time, sentIds, staff }) =>
      time.year >= 1980 && staff.repairman && !sentIds.has('mick_01'),
    choices: null,
  },

  {
    id: 'mick_02',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'williams',
    body:
`Hi.

I'm going to keep this short.

Williams is done. Not officially yet, but I've got contacts in the supply chain and I know what a parts drought looks like before it happens. It's happening now.

Order whatever you need this week. Not next week. This week. I'd start with flipper mechs, solenoid coils, and playfield plastics — those go first and they go fast.

I know this sounds dramatic. I've been doing this for twenty years. I'm not being dramatic.

Mick`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1998 && sentIds.has('mick_01') && !sentIds.has('mick_02'),
    choices: [
      { label: 'Order spares now ($400)', effectId: 'mick_stockpile' },
      { label: 'Wait and see',            effectId: null },
    ],
    expiresAfterDays: 5,
    event: {
      label: 'Industry Warning',
      severity: 'bad',
      message: 'Mick has heard something. Check your inbox.',
    },
  },

];
