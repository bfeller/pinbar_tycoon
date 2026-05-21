// ── Cass Elmore — Pinball Collective ─────────────────────────────────────────
// Barcade-era enthusiast. Arrives in 2013 convinced pinball is the future.
// Correct about this, which she doesn't hide.

export const cassEmails = [

  {
    id: 'cass_01',
    from: 'Cass Elmore',
    address: 'cass@pinballcollective.co',
    subject: 'have you SEEN the Jersey Jack machine',
    body:
`Hi —

Cass here, Pinball Collective. I think we met at the operator meetup? Either way.

Have you seen The Wizard of Oz? Jersey Jack. Twenty-six inch LCD screen, full RGB lighting, completely programmable. It is a completely different category of machine. Not better or worse than your classics, just — different. The authentic experience is still the authentic experience, but this is what the new generation is coming in for.

The barcade thing is real. I know people have been saying it for two years but now it's actually real. Chicago, Austin, Brooklyn — full bars built around games. Not arcade bars. Barcades. Different vibe, different spend, different crowd. People talk about "the space" now. That's a sentence that means something.

I'd love to talk about the venue rebrand conversation if you're open to it. I've put together a mood board. I'll send it over separately.

Cass
Pinball Collective`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2013 && !sentIds.has('cass_01'),
    choices: null,
  },

  {
    id: 'cass_02',
    from: 'Cass Elmore',
    address: 'cass@pinballcollective.co',
    subject: 'FWD: Stern Insider Connected — Operator Action Required',
    body:
`---------- Forwarded message ----------
From: Stern Pinball Operator Relations <operators@sternpinball.com>
Subject: Insider Connected — Network Requirement Notice

Dear Operator,

As part of the Insider Connected rollout with GODZILLA and future titles, all participating machines require a stable Wi-Fi connection to:

  • Receive software and rule-set updates
  • Sync player profiles and achievements
  • Support global and local leaderboard functionality

Please ensure network access is available at machine locations. A minimum of 10 Mbps is recommended. Full setup documentation is available at the Insider Connected operator portal.

Thank you for your continued partnership.

Stern Pinball Operator Relations
---------- End of forwarded message ----------

honestly worth it
the leaderboard stuff is huge right now, players are actually coming back specifically for their scores
also hi, it's been a while

Cass`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2021 && sentIds.has('cass_01') && !sentIds.has('cass_02'),
    choices: null,
  },

];
