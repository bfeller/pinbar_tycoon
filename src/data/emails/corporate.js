// ── Corporate correspondence ───────────────────────────────────────────────────
// Automated and semi-automated emails from Bally and Stern. Oblivious,
// over-formal, and increasingly detached from the actual situation.

export const corporateEmails = [

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
