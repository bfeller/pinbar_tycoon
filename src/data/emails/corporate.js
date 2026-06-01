// ── Corporate correspondence ───────────────────────────────────────────────────
// Automated and semi-automated emails from Bally and Stern. Oblivious,
// over-formal, and increasingly detached from the actual situation.

export const corporateEmails = [

  // ── Head Office proposal — fires at 10 franchises ─────────────────────────
  {
    id: 'head_office_offer',
    from: 'Janet Okafor — Franchise Operations',
    address: 'j.okafor@pinbar-ops.co.uk',
    subject: 'Proposal: Establishing Head Office',
    body:
`Dear Owner,

My name is Janet Okafor. I manage operations across your franchise network, and I'm writing with a proposal I've been developing for some time.

You now operate eleven locations. At this scale, the informal coordination model we've been using — direct calls, shared spreadsheets, best guesses — is becoming a liability. I've been tracking operational incidents across the network for the past six months and the pattern is clear: decisions that should take an afternoon are taking a week, and problems at one location are reaching two others before anyone has context.

What I'm proposing is a dedicated head office. A central operations hub from which the network can be managed properly: procurement, maintenance scheduling, staff oversight, and eventually R&D into what makes this business more competitive at scale.

The upfront cost is significant — £250,000 for the fit-out and first year — with ongoing premises costs of £5,000 per week thereafter. It's not a small commitment. But at eleven locations generating what we generate, it's also not an unusual one.

I can walk you through the numbers in detail if that would help. What I can say from here: the network is ready for this. The question is whether the business is.

Yours,
Janet Okafor
Franchise Operations Manager`,
    trigger: ({ franchises, sentIds }) =>
      franchises.length >= 10 && !sentIds.has('head_office_offer'),
    choices: [
      { label: 'Establish Head Office ($250,000 + $5,000/week)', effectId: 'purchase_head_office', decisionsFlag: 'head_office_purchased' },
      { label: 'Not yet — hold off for now.', effectId: null, decisionsFlag: 'head_office_deferred' },
    ],
    event: {
      label: 'Proposal from Operations',
      severity: 'neutral',
      message: 'Janet Okafor has sent a proposal. Check your inbox.',
    },
  },



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

];
