// ── Mick Darrow — M.D. Amusements Repair ─────────────────────────────────────
// The bar's repairman. Gruff, practical, bills by the hour.
// Arc: young and annoyed (1980) → veteran and grim (1998).
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


  // ── Franchise strain ──────────────────────────────────────────────────────
  {
    id: 'mick_franchise_strain',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 're: coverage',
    body:
`Hi.

I need to say something plainly.

I'm covering four locations. I can't cover five. The travel alone is taking two days a week and that's before the actual work.

Something needs to happen. Either I bring someone on and we formalise MD Amusements as a proper outfit, or the franchise locations go to a contract service and I stay on the original. Both are workable. Neither is ideal.

I'm not asking you to solve it for me. I'm telling you what the options are and that I need a decision before the next location opens.

You've got a week.

Mick`,
    trigger: ({ franchises, staff, sentIds, time }) =>
      franchises.length >= 4 && staff.repairman && sentIds.has('mick_02') &&
      time.year >= 2001 && !sentIds.has('mick_franchise_strain'),
    choices: null,
    event: {
      label: 'Mick needs an answer',
      severity: 'neutral',
      message: 'Mick Darrow has reached his limit. Check your inbox.',
    },
  },

  // ── Backed path: MD Amusements Ltd ────────────────────────────────────────
  {
    id: 'mick_backed_01',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'MD Amusements Repair Ltd.',
    body: ({ decisions = {} }) => {
      let body = `Registered it last week. MD Amusements Repair Ltd. — took three attempts to spell "amusements" correctly on the form.

I've found an apprentice.`;

      if (decisions.danny_franchise_consultant) {
        body += ` The one you sent — Chen. He already knows more about these machines than most technicians I've worked with. He learned to read a machine by watching, which is rarer than it sounds. I'll take it.`;
      } else {
        body += ` Young woman named Jules. No background in pinball specifically but she's got the hands for it, which matters more than people think. I'll have her trained on the Williams line by summer.`;
      }

      body += `

The original location is still mine. Always will be, as long as I'm doing this.

Mick`;
      return body;
    },
    trigger: ({ decisions, sentIds }) =>
      decisions.mick_backed && !sentIds.has('mick_backed_01'),
    choices: null,
  },

  // ── Corporatised path: quiet bitterness ───────────────────────────────────
  {
    id: 'mick_corporate_regret',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'update',
    body:
`Machine three at the original location is fine. All others are under contract.

I heard about the Harrow franchise — the board issue. The contractor logged it as intermittent and left it. It ran intermittent for six weeks before it failed completely. Two weeks down.

I would have caught it in the first visit.

I'm not saying this as a complaint. Just thought you should know how that works.

Mick`,
    trigger: ({ decisions, sentIds, time }) =>
      decisions.mick_corporatized && time.year >= 2003 && !sentIds.has('mick_corporate_regret'),
    choices: null,
  },

  // ── Retirement ────────────────────────────────────────────────────────────
  {
    id: 'mick_retirement',
    from: 'Mick Darrow',
    address: 'mick@mdarrow-repairs.co.uk',
    subject: 'last invoice',
    body:
`This is the last one.

Machine three: left flipper mechanism — standard wear, replaced coil sleeve and return spring. Tilt sensitivity — re-calibrated to factory tolerance. Playfield: cleaned and waxed. General check — all systems within spec.

It's in good shape. Better than it should be after this long.

Forty-three years. I don't know what else to say about that, so I won't.

Tell Gary I said hello.

Mick

M.D. Amusements Repair
"If it needs doing, it needs doing right"`,
    trigger: ({ sentIds, time }) =>
      sentIds.has('mick_franchise_strain') && time.year >= 2020 && !sentIds.has('mick_retirement'),
    choices: null,
  },

];
