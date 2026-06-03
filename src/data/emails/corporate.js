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



  // ── Janet Okafor — Head Office Operations ────────────────────────────────
  // Janet proposed the head office. Once established she becomes a full
  // character: perceptive, occasionally conflicted, increasingly fond of
  // the original location in a way she can't quantify.
  //
  // Arc flags set via email choices:
  //   gary_data_shared / gary_data_log_protected  — from janet_gary_proposal
  //
  // Arc flags set via decisions (decisions.js):
  //   brand_refreshed / brand_protected           — janet_rebrand

  {
    id: 'janet_01',
    from: 'Janet Okafor',
    address: 'j.okafor@pinbar-ops.co.uk',
    subject: 'First week — a few notes',
    body:
`Good morning.

I've spent the first week going through operational data across all locations. I have observations. Most of them are what you'd expect: three sites with inconsistent maintenance scheduling, supply procurement duplicated across seven accounts, and two franchise managers who have been making capital decisions without authorisation. I'll send the full report on Friday.

One thing I want to flag separately.

The original location's data doesn't follow the franchise pattern. Customer retention is different — not just higher, qualitatively different. The visit frequency, the average session length, the repeat rate over five-plus years: it's unlike anything I've seen at this scale in an independent venue. There's a regular who appears to have been logging attendance data since at least 1976. I'd like to speak to him, if that can be arranged.

Also, and I'll put this plainly: the machine maintenance situation across the network is becoming a liability. I'll have a specific recommendation by end of the month.

Janet Okafor
Head Office Operations`,
    trigger: ({ decisions, sentIds }) =>
      decisions.head_office_purchased && !sentIds.has('janet_01'),
    choices: null,
  },

  {
    id: 'janet_gary_proposal',
    from: 'Janet Okafor',
    address: 'j.okafor@pinbar-ops.co.uk',
    subject: 'RE: Gary Kowalski — a proposal',
    body:
`I tracked him down through the loyalty bookings system.

I've been through what's available — attendance records, purchase patterns, the log summaries he's shared in a few local press pieces over the years. If the rest of the log is what those extracts suggest, it's the most comprehensive longitudinal record of any licensed venue in the country. Possibly longer. I haven't found a comparison.

My proposal: with your authorisation, I'd like to approach him about transcribing the key data into a usable format. Not publishing it, not anonymising it for trade research — just preserving it as a resource for understanding what makes the original location work. If we can identify the variables, we can try to replicate the conditions across the network.

I want to be clear: I am not suggesting we turn him into a subject. I'm suggesting we ask him if he'd like to be a collaborator.

He can say no. That's fine. But I think he'll say yes.

Janet`,
    trigger: ({ decisions, sentIds }) =>
      decisions.head_office_purchased && sentIds.has('janet_01') && !sentIds.has('janet_gary_proposal'),
    choices: [
      { label: 'Put them in touch — Gary will appreciate being asked properly.', effectId: null, decisionsFlag: 'gary_data_shared' },
      { label: "The log stays with Gary. It's his.", effectId: null, decisionsFlag: 'gary_data_log_protected' },
    ],
  },

  {
    id: 'janet_cult_alarm',
    from: 'Janet Okafor',
    address: 'j.okafor@pinbar-ops.co.uk',
    subject: 'RE: Inner Flipper — Programme Query [ESCALATED]',
    body:
`I'm forwarding something from the Northgate franchise manager. I've redacted his name because he seemed genuinely distressed.

"A man arrived on Monday calling himself Gerald. He presented what appeared to be a laminated card identifying him as Silver Plunger (Emeritus). He has not left. He has opinions about the carpet layout. He says he is here on behalf of The Programme. He brought a candle. It is unlit. We don't know what to do with Gerald."

I then contacted two other franchise managers who had similar reports.

I have also now read the Inner Flipper newsletters. All of them. I have several questions, the most urgent of which is: what is Tier 4. The newsletter does not say. I have read Issue 5 three times. It still does not say.

I'm not raising this as a complaint. I'm raising it because at some point the network will need a coherent position on Gerald.

Janet

P.S. I have requested Tier 4 documentation through official channels. No one has responded, which I understand is normal.`,
    trigger: ({ decisions, sentIds, franchises }) =>
      decisions.head_office_purchased && sentIds.has('cult_news_02') &&
      franchises.length >= 3 && !sentIds.has('janet_cult_alarm'),
    choices: null,
  },

  {
    id: 'janet_rebrand_outcome_yes',
    from: 'Janet Okafor',
    address: 'j.okafor@pinbar-ops.co.uk',
    subject: 'RE: Rebrand — rollout update',
    body:
`The standardised interiors are in across eleven locations. Revenue is up seven percent network-wide in the first quarter, which is in line with projections.

The original location had a mixed response. Three regulars wrote in. Two of them were complimentary. One of them was Gary, who noted in his letter that the new lighting scheme was "technically an improvement on a measurable level" but that the original lighting had "a quality he had not been able to classify in forty years of trying, which is possibly why it worked." He has filed this under the new category "unmeasurable positives."

He still comes on Tuesday. He always will.

Janet`,
    trigger: ({ decisions, sentIds }) =>
      decisions.brand_refreshed && !sentIds.has('janet_rebrand_outcome_yes'),
    choices: null,
  },

  {
    id: 'janet_rebrand_outcome_no',
    from: 'Janet Okafor',
    address: 'j.okafor@pinbar-ops.co.uk',
    subject: 'RE: Rebrand — understood',
    body:
`Understood. I've shelved the proposal.

I want to be honest with you: I went back to the original location on Saturday to understand why you said no. I sat at the bar for two hours without a clipboard.

The data is accurate — the retention curves, the session lengths, the loyalty patterns. But the data doesn't explain itself. There's something about the room that the spreadsheet can see the edges of but can't see the centre of. I don't have a framework for that yet.

I'm going to try a different approach: instead of standardising toward the original, I'll try to identify what the other locations are missing and address those gaps individually. It'll be slower. It might work better.

Thank you for saying no clearly. It was useful.

Janet`,
    trigger: ({ decisions, sentIds }) =>
      decisions.brand_protected && !sentIds.has('janet_rebrand_outcome_no'),
    choices: null,
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
