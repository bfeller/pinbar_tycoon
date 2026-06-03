// ── The Inner Flipper — Patron Loyalty Program ─────────────────────────────────
// Unlocked by purchasing the "Patron Loyalty Cult" corporate upgrade. What began
// as a punch-card rewards scheme has quietly acquired robes, candles, and a
// theology. The newsletter is relentlessly upbeat corporate onboarding copy
// stretched over something that is clearly a cult. Funny, then concerning.
//
// Pacing is driven by decisions.cult_joined_day (a linear-day stamp set in
// App.jsx when the upgrade is first purchased). `daysSince` lets each issue
// arrive about a week apart instead of all at once.

import { lin } from './utils';

const daysSince = (decisions, time) =>
  decisions?.cult_joined_day != null ? lin(time) - decisions.cult_joined_day : -1;

export const loyaltyCultEmails = [

  // ── Issue #1 — onboarding ────────────────────────────────────────────────
  {
    id: 'cult_news_01',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'rewards@innerflipper-loyalty.com',
    subject: 'Welcome to the Inner Flipper™ Rewards Program! 🎉',
    body:
`Dear Esteemed Operator,

Congratulations! By enrolling your establishment in the Inner Flipper™ Patron Loyalty Program, you have taken the first step on a journey that, for many of our members, has no final step.

HOW IT WORKS:
Every game played earns Devotion Points. Devotion Points can be redeemed for rewards, recognition, and — at higher tiers — answers.

YOUR MEMBERSHIP TIERS:
  • Tier 1 — Acolyte (you are here!)
  • Tier 2 — Devotee
  • Tier 3 — Silver Plunger
  • Tier 4 — [REDACTED PENDING CEREMONY]
  • Tier 5 — Multiball Eternal

As a welcome gift, please enjoy one (1) complimentary scented candle. Do not light it yet. You will know when.

The Founder requests nothing of you at this time.

Warmly, and with growing anticipation,
The Membership Committee

---
This newsletter is sent automatically. You may unsubscribe at any time by completing the unsubscription rite (see Issue #7).`,
    trigger: ({ upgrades, decisions, time, sentIds }) =>
      (upgrades?.loyalty_cult ?? 0) >= 1 &&
      daysSince(decisions, time) >= 0 &&
      !sentIds.has('cult_news_01'),
    choices: null,
    event: {
      label: 'A newsletter has arrived',
      severity: 'neutral',
      message: 'You have been enrolled in the Inner Flipper™ Rewards Program.',
    },
  },

  // ── Issue #2 — member spotlight ──────────────────────────────────────────
  {
    id: 'cult_news_02',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'rewards@innerflipper-loyalty.com',
    subject: 'Member Spotlight: Gerald (Tier 3 — Silver Plunger) ⭐',
    body:
`Hello again, Esteemed Operator!

This issue we celebrate Gerald, one of your very own patrons, who has reached Tier 3 — Silver Plunger.

Gerald's stats are an inspiration to us all:
  • Devotion Points: 41,000
  • Rewards redeemed: 0
  • Consecutive days on premises: 19
  • Times Gerald has gone home: see above

Gerald's family was contacted and we are pleased to report they are "supportive" and "have stopped asking." Gerald says he has never felt more aligned. Gerald no longer answers to "Gerald." We are working on what he answers to.

Could YOU be our next spotlight? Members reach Tier 3 by simply never leaving. It's that easy!

Keep those flippers flipping,
The Membership Committee

P.S. The candle. Still no.`,
    trigger: ({ decisions, time, sentIds }) =>
      sentIds.has('cult_news_01') &&
      daysSince(decisions, time) >= 3 &&
      !sentIds.has('cult_news_02'),
    choices: null,
  },

  // ── Issue #3 — doctrine + the choice ─────────────────────────────────────
  {
    id: 'cult_news_03',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'devotion@theinnerflipper.org',
    subject: 'On the Multiball, and a Small Request 🙏',
    body:
`Beloved Operator,

A point of doctrine, for the newer Acolytes among your patrons:

The Multiball is not a feature. It is a promise. When the one becomes many and the many cannot be tracked, that is not chaos — that is abundance. We do not fear the drain. We thank the drain, for it teaches us the cost of attachment.

(The Membership Committee has been asked to remind everyone that this is, legally, a rewards program.)

Membership at your location has grown 340% this quarter. Your bar is becoming something. We would like to make it official.

THE REQUEST:
We humbly ask your blessing to operate the Program formally under your establishment's name. With your blessing, the faithful will come in numbers. Without it, we will of course respect your distance — and so, regrettably, will they.

The Founder is watching this decision with what we are told is "interest."

In service,
The Membership Committee`,
    trigger: ({ decisions, time, sentIds }) =>
      sentIds.has('cult_news_02') &&
      daysSince(decisions, time) >= 9 &&
      !sentIds.has('cult_news_03'),
    choices: [
      { label: 'Bless the Program — make it official.', effectId: 'cult_endorse', decisionsFlag: 'cult_endorsed' },
      { label: 'Politely decline — keep your distance.', effectId: 'cult_distance', decisionsFlag: 'cult_distanced' },
    ],
    event: {
      label: 'The Program awaits your blessing',
      severity: 'neutral',
      message: 'The Inner Flipper has made a request. Check your inbox.',
    },
  },

  // ── Issue #4 — "this is not an emergency" ────────────────────────────────
  {
    id: 'cult_news_04',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'devotion@theinnerflipper.org',
    subject: 'A Note on Recent Events (This Is Not an Emergency)',
    body:
`Dear Operator,

We are writing to reassure you, immediately and without ambiguity, regarding recent events at the premises. Everything is fine. Everything was always going to be fine. The fire was small, contained, and — the Committee feels — spiritually appropriate.

In hindsight, distributing the candles was a known risk. We knew. We did it anyway. This is what faith is.

No machines were harmed that did not consent. Gerald is fine. Gerald, in fact, has been promoted.

Enclosed please find a modest invoice for "ceremonial cleanup and reconsecration." We have taken the liberty of handling the matter on your behalf. You're welcome.

Please disregard any sounds the machines are now making. They are normal sounds. They are praise.

Calmly,
The Membership Committee
Legal & Devotional (Joint Department)`,
    trigger: ({ decisions, time, sentIds }) =>
      sentIds.has('cult_news_03') &&
      (decisions?.cult_endorsed || decisions?.cult_distanced) &&
      daysSince(decisions, time) >= 12 &&
      !sentIds.has('cult_news_04'),
    choices: null,
    event: {
      label: 'Ceremonial Cleanup Invoice',
      severity: 'bad',
      message: 'The Inner Flipper has "handled a matter" on your behalf. (−$2,500)',
      effect: 'income_delta',
      effectValue: -2500,
    },
  },

  // ── Issue #5a — finale (blessed) ─────────────────────────────────────────
  {
    id: 'cult_news_05_endorsed',
    from: 'The Inner Flipper',
    address: '————@theinnerflipper',
    subject: 'It Is Done. Thank You. 🕯️',
    body:
`Operator,

It is done.

With your blessing, the Program has come into its fullness. The back room is now a temple. The Tuesday league is now a congregation. Attendance has never been higher and will never be lower.

Your establishment is, by every metric that matters to us and several that matter to you, thriving. The faithful arrive at open and leave only when carried. Receipts are up. So is something else, but receipts are up.

You will still receive this newsletter. You will always receive this newsletter.

The Founder sends regards. We have never met the Founder. We assume you have not either. This is correct.

You may light the candle now.

Eternally,
The Inner Flipper`,
    trigger: ({ decisions, time, sentIds }) =>
      decisions?.cult_endorsed &&
      sentIds.has('cult_news_04') &&
      daysSince(decisions, time) >= 18 &&
      !sentIds.has('cult_news_05_endorsed'),
    choices: null,
    event: {
      label: 'The Program Ascends',
      severity: 'good',
      message: 'The faithful pack your bar. Popularity surges. (+ devotion)',
      effect: 'popularity_delta',
      effectValue: 400,
    },
  },

  // ── Issue #5b — finale (declined) ────────────────────────────────────────
  {
    id: 'cult_news_05_distanced',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'devotion@theinnerflipper.org',
    subject: 'Re: Your Distance. We Understand. (We Do Not Understand.)',
    body:
`Operator,

You kept your distance. We respect this. We respect this so much that we have decided to keep ours.

Effective immediately, the Program will wind down operations at your establishment. Devotion Points have been converted to nothing at the standard rate. The candle should be returned, unlit, in its original packaging, along with any feelings it may have stirred.

The faithful are disappointed but not surprised. They were warned that the Operator might lack vision. They have moved on to a bowling alley three towns over that "gets it."

Gerald says he forgives you. Gerald says a lot of things now.

You are released from your tier. You are, in the only sense that ever mattered, free.

This is the final issue of this newsletter. Probably.

Respectfully,
The Membership Committee (Dissolving)`,
    trigger: ({ decisions, time, sentIds }) =>
      decisions?.cult_distanced &&
      sentIds.has('cult_news_04') &&
      daysSince(decisions, time) >= 18 &&
      !sentIds.has('cult_news_05_distanced'),
    choices: null,
    event: {
      label: 'The Program Withdraws',
      severity: 'bad',
      message: 'The faithful drift away. Popularity dips, but the candles are gone.',
      effect: 'popularity_delta',
      effectValue: -120,
    },
  },


  // ── Franchise expansion arc ────────────────────────────────────────────────
  // These fire when the cult has been endorsed AND the player has franchises.

  {
    id: 'cult_franchise_01',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'devotion@theinnerflipper.org',
    subject: 'Issue #6: New Territories 🌍',
    body:
`Beloved Operator and Expanding Empire,

The Programme is growing.

With the blessing of the Franchise Network, the Inner Flipper™ has extended its reach to your additional locations. We want to reassure you that this happened entirely within the terms of your original endorsement. Clause 7 was always intended to read the way it now reads.

NEWS FROM THE TERRITORIES:
  • Gerald has been designated Roving Devotee. He is currently on secondment to the Northgate location. He will return when "the work is done." We do not know when the work will be done.
  • Candles are now region-specific. Northern locations receive Heather & Persistence. Southern locations receive something we cannot describe in print.
  • Tier 4 documentation has been updated. There is now less of it.

The Founder is pleased.

In service and expansion,
The Membership Committee (HQ Division)`,
    trigger: ({ decisions, sentIds, franchises }) =>
      decisions.cult_endorsed && franchises.length >= 2 &&
      sentIds.has('cult_news_05_endorsed') && !sentIds.has('cult_franchise_01'),
    choices: null,
  },

  {
    id: 'cult_gerald_at_franchise',
    from: 'The Inner Flipper — Patron Loyalty Program',
    address: 'devotion@theinnerflipper.org',
    subject: 'Issue #7: Gerald — A Progress Update 🕯️',
    body:
`Beloved Operator,

Gerald has now visited four of your franchise locations.

At each location he has: identified the machine with "the strongest presence," spent between two and eleven days, reorganised the loyalty display materials, and left a candle. The candles at two locations have been lit. This was, we want to be clear, their own decision.

Gerald has not been asked to leave by any location. We are choosing to read this as endorsement.

We should tell you something. Gerald has reached a threshold that required us to consult the Tier 4 documentation. We did. We are not at liberty to share what it said. What we can tell you is that Gerald is well, that Gerald is content, and that Gerald no longer uses the word "Gerald" in the first person.

He has asked that we refer to him, in all future correspondence, as "The Plunger."

We will be in touch.

Warmly and with increasing complexity,
The Membership Committee`,
    trigger: ({ decisions, sentIds, franchises }) =>
      decisions.cult_endorsed && franchises.length >= 4 &&
      sentIds.has('cult_franchise_01') && !sentIds.has('cult_gerald_at_franchise'),
    choices: null,
    event: {
      label: 'Gerald has achieved Tier 4',
      severity: 'neutral',
      message: "The Membership Committee has an update on Gerald. (He is now The Plunger.)",
    },
  },

];
