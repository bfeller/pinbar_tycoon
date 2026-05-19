// Mid-day decision events — player is presented with a choice and consequences are saved as flags.
//
// condition({ machines, decisions, popularity, cash, time }) → bool
// getMessage({ machineName }) → string
// choices[].flagId is stored in the decisions object once chosen.
// Non-repeatable events skip re-firing once any of their flagIds appears in decisions.
// effect2/effect2Value is an optional secondary effect applied alongside effect.

export const DECISION_DEFS = [

  {
    id: 'angry_customer',
    label: 'Angry Customer',
    weight: 3,
    repeatable: false,
    condition: ({ machines }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability < 70),
    getMessage: ({ machineName }) =>
      `A customer is at the bar claiming ${machineName} swallowed his quarters without giving him a single ball. He says this loudly. He is continuing to say it.`,
    choices: [
      {
        id: 'refund',
        label: 'Give the refund',
        hint: '−$5',
        flagId: 'refund_given',
        effect: 'income_delta',
        effectValue: -5,
        resolution: {
          severity: 'good',
          message: 'You handed back his quarters. He left looking almost pleased.',
        },
      },
      {
        id: 'deny',
        label: 'Deny the refund',
        hint: '−5 popularity',
        flagId: 'refund_denied',
        effect: 'popularity_delta',
        effectValue: -5,
        resolution: {
          severity: 'bad',
          message: "He left muttering something. You don't know what Yelp is yet, but it felt like a threat.",
        },
      },
    ],
  },

  {
    id: 'local_band',
    label: 'Live Music Request',
    weight: 2,
    repeatable: false,
    condition: ({ popularity, time }) => popularity >= 300 && time.year >= 1979,
    getMessage: () =>
      `A four-piece called "The Plungers" want to set up in the corner on Friday nights. No cover charge. They'll bring their own PA. One of them is already moving tables.`,
    choices: [
      {
        id: 'book_band',
        label: 'Let them play',
        hint: '+30 popularity, −$50',
        flagId: 'band_booked',
        effect: 'popularity_delta',
        effectValue: 30,
        effect2: 'income_delta',
        effect2Value: -50,
        resolution: {
          severity: 'good',
          message: "They were surprisingly good. The place was packed. The bassist cried a little during the encore, but in a good way.",
        },
      },
      {
        id: 'decline_band',
        label: 'Turn them down',
        hint: 'no effect',
        flagId: 'band_declined',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "They took it well. The drummer said 'fair enough' and the bassist cried a little. Not in a good way.",
        },
      },
    ],
  },

  {
    id: 'health_inspection',
    label: 'Health Inspector',
    weight: 2,
    repeatable: false,
    condition: ({ time }) => time.year >= 1978,
    getMessage: () =>
      `A man in a beige jacket is standing at the door with a clipboard. He says he's here for a "routine inspection." He's looking at the bar area with what you can only describe as professional disappointment.`,
    choices: [
      {
        id: 'cooperate',
        label: 'Cooperate fully',
        hint: '−10 popularity (closed early)',
        flagId: 'inspection_passed',
        effect: 'popularity_delta',
        effectValue: -10,
        resolution: {
          severity: 'neutral',
          message: "You closed early to let him look around. He found three things to cite. None of them were real problems. The paperwork will probably be fine.",
        },
      },
      {
        id: 'bribe_inspector',
        label: 'Slide him $200',
        hint: '−$200',
        flagId: 'inspector_bribed',
        effect: 'income_delta',
        effectValue: -200,
        resolution: {
          severity: 'bad',
          message: "He took it without making eye contact and wrote 'satisfactory' on his clipboard. You both pretended this was normal.",
        },
      },
    ],
  },

  {
    id: 'tournament_request',
    label: 'Tournament Proposal',
    weight: 2,
    repeatable: false,
    condition: ({ machines, popularity }) =>
      machines.filter(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0).length >= 3 &&
      popularity >= 500,
    getMessage: () =>
      `A man named Gerald from the Regional Pinball Enthusiasts' Society has written to propose a Friday tournament. He notes in his letter that "a venue of your calibre" would be ideal. Gerald means this sincerely.`,
    choices: [
      {
        id: 'host_tournament',
        label: 'Host it',
        hint: '+60 popularity, −$100',
        flagId: 'tournament_hosted',
        effect: 'popularity_delta',
        effectValue: 60,
        effect2: 'income_delta',
        effect2Value: -100,
        resolution: {
          severity: 'good',
          message: "Twenty-three people showed up. Gerald thanked you twice and shook your hand for too long. Word got around.",
        },
      },
      {
        id: 'decline_tournament',
        label: 'Decline',
        hint: '−5 popularity',
        flagId: 'tournament_declined',
        effect: 'popularity_delta',
        effectValue: -5,
        resolution: {
          severity: 'bad',
          message: "Gerald was visibly wounded. He said he understood. He did not understand.",
        },
      },
    ],
  },

  {
    id: 'photo_request',
    label: 'Press Photographer',
    weight: 1,
    repeatable: false,
    condition: ({ popularity }) => popularity >= 600,
    getMessage: () =>
      `A woman with a camera bag wants to photograph the bar for a piece in the Evening Standard. "Local colour," she says. "Very retro." You're not sure if that's a compliment.`,
    choices: [
      {
        id: 'free_photos',
        label: 'Let her shoot for free',
        hint: '+35 popularity',
        flagId: 'photo_free',
        effect: 'popularity_delta',
        effectValue: 35,
        resolution: {
          severity: 'good',
          message: "The photo ran on page 12. You're in the background, slightly out of focus. It's a good photo.",
        },
      },
      {
        id: 'charge_photos',
        label: 'Charge a location fee — $150',
        hint: '+$150',
        flagId: 'photo_charged',
        effect: 'income_delta',
        effectValue: 150,
        resolution: {
          severity: 'good',
          message: "She paid without complaint. The photo still ran. You appeared in none of it. Still worth it.",
        },
      },
    ],
  },

  {
    id: 'suspicious_offer',
    label: 'The Proposition',
    weight: 1,
    repeatable: false,
    condition: ({ cash, time }) => cash < 8000 && time.year >= 1979,
    getMessage: () =>
      `A man you don't recognise sits at the bar and orders water. After a long silence he mentions he knows some people who'd pay well to use the back room a few nights a week. "Private games," he says. He doesn't elaborate on what kind.`,
    choices: [
      {
        id: 'accept_offer',
        label: 'Agree to it',
        hint: '+$500',
        flagId: 'deal_accepted',
        effect: 'income_delta',
        effectValue: 500,
        resolution: {
          severity: 'bad',
          message: "He left a brown envelope on the bar. You didn't ask any questions. Some things are better not known.",
        },
      },
      {
        id: 'decline_offer',
        label: 'Tell him to leave',
        hint: 'no effect',
        flagId: 'deal_declined',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'good',
          message: "He finished his water and left without a word. You feel vaguely better about yourself.",
        },
      },
    ],
  },

  {
    id: 'kid_on_machine',
    label: 'Underage Player',
    weight: 2,
    repeatable: false,
    condition: ({ time }) => time.year >= 1977,
    getMessage: ({ machineName }) =>
      `There's a kid — can't be more than twelve — absolutely rinsing ${machineName}. He's on a genuine high score run. A woman who might be his mother is watching from the door, arms folded.`,
    choices: [
      {
        id: 'let_kid_play',
        label: 'Let him finish the game',
        hint: '+15 popularity',
        flagId: 'kid_allowed',
        effect: 'popularity_delta',
        effectValue: 15,
        resolution: {
          severity: 'good',
          message: "He got the high score. He shook your hand. His mother uncrossed her arms. Regular customers applauded.",
        },
      },
      {
        id: 'eject_kid',
        label: 'Ask him to leave',
        hint: '−10 popularity',
        flagId: 'kid_ejected',
        effect: 'popularity_delta',
        effectValue: -10,
        resolution: {
          severity: 'bad',
          message: "He left. The room went very quiet. Someone at the bar said 'bit much, wasn't it.' They were right.",
        },
      },
    ],
  },

];
