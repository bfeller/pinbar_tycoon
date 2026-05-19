import { lin } from './utils';

// ── Inspector Bernard Crabtree ────────────────────────────────────────────────
// Environmental Health Officer Grade 2. Means well. Has become existentially
// distracted by pinball as a metaphor. Never quite makes it to the inspection.

export const crabtreeEmails = [

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

];
