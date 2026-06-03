// Mid-day decision events — player is presented with a choice and consequences are saved as flags.
//
// condition({ machines, decisions, popularity, cash, time, franchises }) → bool
// getMessage({ machineName, decisions, franchises }) → string
// choices[].flagId is stored in the decisions object once chosen.
// Non-repeatable events skip re-firing once any of their flagIds appears in decisions.
// effect2/effect2Value is an optional secondary effect applied alongside effect.

export const DECISION_DEFS = [

  // ── Chaos events (chaosOnly: true, repeatable: true) ─────────────────────
  // Fire only when franchises > 10 and no head office is established.
  // Frequency scales with excess franchise count via the chaos roll in eventRoller.
  // These are excluded from the regular decision pool.

  {
    id: 'chaos_coordination',
    label: 'Coordination Failure',
    weight: 5,
    repeatable: true,
    chaosOnly: true,
    condition: ({ franchises }) => franchises.length > 10,
    getMessage: ({ franchises = [] }) => {
      const count = franchises.length;
      return `A routine maintenance decision needed authorisation from someone. Nobody knew who. Three managers waited a week. Two acted independently and contradicted each other. You're running ${count} locations without a central authority and it is starting to show.`;
    },
    choices: [
      {
        id: 'chaos_coord_absorb',
        label: 'Absorb the cost and move on',
        hint: '−$2,000',
        flagId: 'chaos_coord_absorbed',
        effect: 'income_delta',
        effectValue: -2000,
        resolution: {
          severity: 'bad',
          message: "You signed off on the remediation. It was routine. It should not have cost $2,000. It will happen again.",
        },
      },
      {
        id: 'chaos_coord_escalate',
        label: 'Investigate — find out who dropped this',
        hint: '−$500, −15 popularity',
        flagId: 'chaos_coord_escalated',
        effect: 'income_delta',
        effectValue: -500,
        effect2: 'popularity_delta',
        effect2Value: -15,
        resolution: {
          severity: 'bad',
          message: "The investigation cost more in morale than the original problem cost in money. Staff at three locations are now unsure what they're allowed to decide.",
        },
      },
    ],
  },

  {
    id: 'chaos_rogue_spend',
    label: 'Unauthorised Expenditure',
    weight: 4,
    repeatable: true,
    chaosOnly: true,
    condition: ({ franchises }) => franchises.length > 10,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)]?.name ?? 'one of your locations';
      return `The manager at ${loc} spent $4,000 on a full refit of the bar area. It looks good. They did not ask. They sent receipts after the fact with a note explaining that they'd "been meaning to bring it up."`;
    },
    choices: [
      {
        id: 'chaos_rogue_absorb',
        label: "Absorb it — it's done now",
        hint: '−$4,000',
        flagId: 'chaos_rogue_absorbed',
        effect: 'income_delta',
        effectValue: -4000,
        resolution: {
          severity: 'bad',
          message: "The refit looks good. You paid for it. You still don't know how many other managers are planning similar initiatives.",
        },
      },
      {
        id: 'chaos_rogue_claw_back',
        label: 'Claw it back from wages over three months',
        hint: '−$1,500, −20 popularity',
        flagId: 'chaos_rogue_clawed',
        effect: 'income_delta',
        effectValue: -1500,
        effect2: 'popularity_delta',
        effect2Value: -20,
        resolution: {
          severity: 'bad',
          message: "The manager accepted the deduction without complaint, which somehow made it worse. Word travelled to other locations before the week was out.",
        },
      },
    ],
  },

  {
    id: 'chaos_coverage_gap',
    label: 'Location Unstaffed',
    weight: 5,
    repeatable: true,
    chaosOnly: true,
    condition: ({ franchises }) => franchises.length > 10,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)]?.name ?? 'one of your locations';
      return `${loc} ran without a manager for four days. The bar manager quit on Monday. Nobody escalated it. Staff opened and closed without authorisation because they didn't know what else to do. You found out on Friday.`;
    },
    choices: [
      {
        id: 'chaos_gap_emergency',
        label: 'Send emergency cover immediately',
        hint: '−$3,000',
        flagId: 'chaos_gap_covered',
        effect: 'income_delta',
        effectValue: -3000,
        resolution: {
          severity: 'bad',
          message: "Cover arrived and stabilised the location. The four days of unmanaged operation cost you in a dozen small ways you'll be finding for weeks.",
        },
      },
      {
        id: 'chaos_gap_promote',
        label: 'Promote from within — give a staff member the keys',
        hint: '−$800, −10 popularity',
        flagId: 'chaos_gap_promoted',
        effect: 'income_delta',
        effectValue: -800,
        effect2: 'popularity_delta',
        effect2Value: -10,
        resolution: {
          severity: 'bad',
          message: "The promoted staff member is trying their best. Customers are noticing the inconsistency in how the location is run.",
        },
      },
    ],
  },

  {
    id: 'chaos_supplier_tangle',
    label: 'Supply Chain Confusion',
    weight: 4,
    repeatable: true,
    chaosOnly: true,
    condition: ({ franchises }) => franchises.length > 10,
    getMessage: ({ franchises = [] }) => {
      const count = franchises.length;
      return `${count} locations placed separate orders with the same three suppliers this month. The suppliers received conflicting instructions, applied discounts inconsistently, and one of them invoiced the same delivery to two different locations. Your accounts department has flagged a discrepancy of approximately $3,500.`;
    },
    choices: [
      {
        id: 'chaos_supplier_pay',
        label: 'Pay the discrepancy and sort it out later',
        hint: '−$3,500',
        flagId: 'chaos_supplier_paid',
        effect: 'income_delta',
        effectValue: -3500,
        resolution: {
          severity: 'bad',
          message: "The accounts are cleared. The underlying process that caused it is unchanged. Next month the same suppliers will receive seventeen separate orders again.",
        },
      },
      {
        id: 'chaos_supplier_dispute',
        label: 'Dispute the invoice — drag it out',
        hint: '−$1,000, −10 popularity',
        flagId: 'chaos_supplier_disputed',
        effect: 'income_delta',
        effectValue: -1000,
        effect2: 'popularity_delta',
        effect2Value: -10,
        resolution: {
          severity: 'bad',
          message: "The dispute resolved in your favour, mostly. The supplier now charges you a 'complex account premium' on future orders. You choose not to ask what that means.",
        },
      },
    ],
  },

  // ── Franchise events ──────────────────────────────────────────────────────
  // These only fire when the player has at least one active franchise.
  // getMessage receives franchises so it can name the affected location.

  {
    id: 'franchise_machine_breakdown',
    label: 'Location Incident',
    weight: 6,
    repeatable: false,
    condition: ({ franchises }) => franchises.length >= 1,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)];
      const name = loc?.name ?? 'one of your locations';
      return `Machine three at ${name} has gone dark. Staff called it in this morning — no warning, no diagnostics, just off. It's your busiest cabinet.`;
    },
    choices: [
      {
        id: 'franchise_emergency_repair',
        label: 'Emergency callout — get it fixed today',
        hint: '−$800',
        flagId: 'franchise_machine_repaired_emergency',
        effect: 'income_delta',
        effectValue: -800,
        resolution: {
          severity: 'good',
          message: "The technician had it running by mid-afternoon. A solenoid. Standard wear. The queue re-formed within the hour.",
        },
      },
      {
        id: 'franchise_wait_repairman',
        label: 'It can wait for the regular service visit',
        hint: '−$200 lost revenue',
        flagId: 'franchise_machine_waited',
        effect: 'income_delta',
        effectValue: -200,
        resolution: {
          severity: 'neutral',
          message: "Customers noticed. A few left. The machine sat dark for three days until the repairman came through. It's running now.",
        },
      },
    ],
  },

  {
    id: 'franchise_staff_dispute',
    label: 'Staff Dispute',
    weight: 4,
    repeatable: false,
    condition: ({ franchises, time }) => franchises.length >= 1 && time.year >= 1985,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)];
      const name = loc?.name ?? 'one of your locations';
      return `The bar manager at ${name} has written. Two staff members are unhappy with a recent schedule change and looking at other options. The manager thinks one of them will leave by the end of the month.`;
    },
    choices: [
      {
        id: 'franchise_staff_retention',
        label: 'Resolve it — retention bonus and a schedule review',
        hint: '−$600, +5 popularity',
        flagId: 'franchise_staff_retained',
        effect: 'income_delta',
        effectValue: -600,
        effect2: 'popularity_delta',
        effect2Value: 5,
        resolution: {
          severity: 'good',
          message: "Both staff stayed. The manager thanked you in a short email that also subtly suggested the original schedule had been the problem from the start.",
        },
      },
      {
        id: 'franchise_staff_let_go',
        label: 'Let it play out — staff turnover is normal',
        hint: '−20 popularity',
        flagId: 'franchise_staff_left',
        effect: 'popularity_delta',
        effectValue: -20,
        resolution: {
          severity: 'bad',
          message: "One of them went. The location ran short-staffed for two weeks. Regulars noticed the difference in service.",
        },
      },
    ],
  },

  {
    id: 'franchise_local_competitor',
    label: 'New Competition',
    weight: 4,
    repeatable: false,
    condition: ({ franchises, time }) => franchises.length >= 1 && time.year >= 1987,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)];
      const name = loc?.name ?? 'one of your locations';
      return `A new bar opened on the same street as ${name} last week. Staff report it has newer machines and cheap weeknight drinks. Foot traffic at the location is already down.`;
    },
    choices: [
      {
        id: 'franchise_invest_competitive',
        label: 'Invest in the location — refresh the machines and run a promotion',
        hint: '−$700, +20 popularity',
        flagId: 'franchise_competition_fought',
        effect: 'income_delta',
        effectValue: -700,
        effect2: 'popularity_delta',
        effect2Value: 20,
        resolution: {
          severity: 'good',
          message: "The promotion ran for three weeks. Some customers who'd drifted came back. The new bar is still there, but it's no longer the obvious choice.",
        },
      },
      {
        id: 'franchise_accept_competition',
        label: 'Hold your ground — your regulars know where they belong',
        hint: '−15 popularity',
        flagId: 'franchise_competition_accepted',
        effect: 'popularity_delta',
        effectValue: -15,
        resolution: {
          severity: 'bad',
          message: "Some customers didn't come back. The ones who did were more loyal than before, which is something, but the numbers are down.",
        },
      },
    ],
  },

  {
    id: 'franchise_breakout_night',
    label: 'Record Night',
    weight: 3,
    repeatable: false,
    condition: ({ franchises, popularity }) => franchises.length >= 1 && popularity >= 500,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)];
      const name = loc?.name ?? 'one of your locations';
      return `The manager at ${name} called. Saturday was their best night since opening — a full house, a queue at the door, someone asking about hosting a tournament. They want to talk about expanding capacity.`;
    },
    choices: [
      {
        id: 'franchise_expand_capacity',
        label: 'Back the expansion — add machines and open the back room',
        hint: '−$1,200, +30 popularity',
        flagId: 'franchise_expanded',
        effect: 'income_delta',
        effectValue: -1200,
        effect2: 'popularity_delta',
        effect2Value: 30,
        resolution: {
          severity: 'good',
          message: "Three new machines went in over the following fortnight. The manager sent a photo. The queue on Saturday now goes around the corner.",
        },
      },
      {
        id: 'franchise_acknowledge_night',
        label: 'Acknowledge the win — keep the current setup',
        hint: '+8 popularity',
        flagId: 'franchise_good_night_noted',
        effect: 'popularity_delta',
        effectValue: 8,
        resolution: {
          severity: 'neutral',
          message: "You wrote back with a well done. The manager seemed pleased. The Saturday numbers stayed strong for another few weeks.",
        },
      },
    ],
  },

  {
    id: 'franchise_supply_delay',
    label: 'Supply Chain Issue',
    weight: 4,
    repeatable: false,
    condition: ({ franchises }) => franchises.length >= 2,
    getMessage: ({ franchises = [] }) => {
      const count = franchises.length;
      return `The parts supplier has a backlog. Replacement flippers, solenoids, and coil sleeves for ${count} of your locations are stuck in a warehouse in Coventry. Estimated wait: two weeks.`;
    },
    choices: [
      {
        id: 'franchise_premium_sourcing',
        label: 'Source parts at premium through an alternative supplier',
        hint: '−$500',
        flagId: 'franchise_supply_resolved',
        effect: 'income_delta',
        effectValue: -500,
        resolution: {
          severity: 'good',
          message: "The parts arrived within 48 hours from a distributor in Birmingham. The premium hurt. The machines stayed running.",
        },
      },
      {
        id: 'franchise_wait_supply',
        label: 'Wait it out — two weeks is manageable',
        hint: '−12 popularity',
        flagId: 'franchise_supply_waited',
        effect: 'popularity_delta',
        effectValue: -12,
        resolution: {
          severity: 'bad',
          message: "Wear caught up with two machines before the parts arrived. Customers noticed degraded play. The wait was two and a half weeks, not two.",
        },
      },
    ],
  },

  {
    id: 'franchise_community_league',
    label: 'Community Initiative',
    weight: 5,
    repeatable: false,
    condition: ({ franchises, popularity, time }) =>
      franchises.length >= 1 && popularity >= 400 && time.year >= 1980,
    getMessage: ({ franchises = [] }) => {
      const loc = franchises[Math.floor(Math.random() * franchises.length)];
      const name = loc?.name ?? 'one of your locations';
      return `The staff at ${name} have organised a weekly pinball league on their own initiative. Eight regulars are already signed up. They're asking for a small sponsorship to make it official — a trophy, a league board, a Friday night slot.`;
    },
    choices: [
      {
        id: 'franchise_league_full',
        label: 'Back it fully — trophy, board, and a proper slot',
        hint: '−$250, +35 popularity',
        flagId: 'franchise_league_sponsored',
        effect: 'income_delta',
        effectValue: -250,
        effect2: 'popularity_delta',
        effect2Value: 35,
        resolution: {
          severity: 'good',
          message: "The league grew to fourteen players by week three. Someone photographed the trophy board and it ended up in the local paper. Gary, somehow, heard about it.",
        },
      },
      {
        id: 'franchise_league_light',
        label: 'Let them run it — give your blessing, no funds',
        hint: '+15 popularity',
        flagId: 'franchise_league_informal',
        effect: 'popularity_delta',
        effectValue: 15,
        resolution: {
          severity: 'neutral',
          message: "They ran it on a shoestring. The trophy was a certificate printed on the office printer. The players didn't seem to mind.",
        },
      },
      {
        id: 'franchise_league_decline',
        label: 'Keep the schedule standard — league nights complicate operations',
        hint: '−10 popularity',
        flagId: 'franchise_league_declined',
        effect: 'popularity_delta',
        effectValue: -10,
        resolution: {
          severity: 'bad',
          message: "The staff accepted the decision. Two of the eight regulars found a bar down the road that would let them run it.",
        },
      },
    ],
  },



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

  // ── Crabtree arc decisions ────────────────────────────────────────────────
  // These fire as part of the Crabtree inspection timeline (crabtree.js).
  // crabtree_third_attempt: his most focused inspection attempt, ~1980.
  // crabtree_replacement_inspection: his successor Ms. Fenchurch arrives, ~1986.

  {
    id: 'crabtree_third_attempt',
    label: "The Inspector's Return",
    weight: 7,
    repeatable: false,
    condition: ({ time, sentIds, decisions }) =>
      (sentIds.has('crabtree_04_welcomed') || sentIds.has('crabtree_04_corresponded')) &&
      time.year >= 1980 && time.week >= 5 &&
      !decisions.crabtree_inspection_completed && !decisions.crabtree_inspection_derailed,
    getMessage: ({ decisions = {} }) => {
      let text = `Crabtree is at the door. He has his clipboard. He is working through a checklist quietly and systematically. He hasn't mentioned the drain once. It might actually be an inspection.`;
      if (decisions.crabtree_corresponded) {
        text += `\n\nHe has printed notes. He looks prepared.`;
      }
      return text;
    },
    choices: [
      {
        id: 'cooperate_crabtree',
        label: 'Cooperate fully — show him around',
        hint: 'outstanding inspection resolved',
        flagId: 'crabtree_inspection_completed',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'good',
          message: "He went through the checklist. He found nothing of concern. At the door he shook your hand and wrote something down — in the journal, not the clipboard. You chose not to ask which.",
        },
      },
      {
        id: 'derail_crabtree',
        label: 'Offer him a coffee — ask about the journal',
        hint: 'inspection deferred again',
        flagId: 'crabtree_inspection_derailed',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He accepted the coffee. You talked for an hour. At the end he said 'I should have done the inspection.' You both agreed he probably would.",
        },
      },
    ],
  },

  {
    id: 'crabtree_replacement_inspection',
    label: 'The Replacement Inspector',
    weight: 7,
    repeatable: false,
    condition: ({ time, sentIds, decisions }) =>
      sentIds.has('crabtree_07') && time.year >= 1986 && time.week >= 2 &&
      !decisions.crabtree_replacement_cooperated && !decisions.crabtree_replacement_redirected,
    getMessage: () =>
      `A woman in a council jacket is at the door with a clipboard. She identifies herself as Ms. Fenchurch from Environmental Health — here for the outstanding inspection, reference BC/0044. She appears to have memorised the reference number. She shows no signs of philosophical distraction.`,
    choices: [
      {
        id: 'cooperate_fenchurch',
        label: 'Welcome her — cooperate fully',
        hint: '−5 popularity (closed early)',
        flagId: 'crabtree_replacement_cooperated',
        effect: 'popularity_delta',
        effectValue: -5,
        resolution: {
          severity: 'neutral',
          message: "She was thorough and efficient. Three minor citations, all legitimate. Done in forty-five minutes. She did not look at the machines the way Crabtree looked at the machines.",
        },
      },
      {
        id: 'redirect_fenchurch',
        label: "Tell her you'll need to consult Mr. Crabtree about the scheduling",
        hint: 'inspection deferred',
        flagId: 'crabtree_replacement_redirected',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "She noted it on her clipboard and left without entering. Her expression suggested she had spoken to Crabtree before and was not entirely surprised.",
        },
      },
    ],
  },

  // ── Franchise character arc decisions ────────────────────────────────────
  // mick_succession: Mick can't cover the whole network alone. Expand MD Amusements
  //   or move franchise locations to a corporate contract?
  // janet_rebrand: Janet proposes standardising all locations. Franchise coherence
  //   vs. protecting what makes the original work.

  {
    id: 'mick_succession',
    label: "Mick's Decision",
    weight: 9,
    repeatable: false,
    condition: ({ sentIds, decisions }) =>
      sentIds.has('mick_franchise_strain') &&
      !decisions.mick_backed && !decisions.mick_corporatized,
    getMessage: ({ decisions = {} }) => {
      let text = `Mick Darrow has been servicing your machines since the beginning. At four franchise locations he's reached his limit. He's given you two options: fund the expansion of MD Amusements into a proper outfit with an apprentice, or he stays on the original location only and the network goes to a corporate repair contract.`;
      if (decisions.danny_franchise_consultant) {
        text += `\n\nDanny Chen has mentioned he'd be interested in the apprentice role, if it comes to that.`;
      }
      return text;
    },
    choices: [
      {
        id: 'back_mick',
        label: 'Back Mick — fund the expansion of MD Amusements',
        hint: '−$3,000, better long-term quality',
        flagId: 'mick_backed',
        effect: 'income_delta',
        effectValue: -3000,
        resolution: {
          severity: 'good',
          message: "Mick registered MD Amusements Repair Ltd. the following week. He spelled 'amusements' wrong on the first attempt. He corrected it. He did not mention this.",
        },
      },
      {
        id: 'corporatize_repairs',
        label: 'Move the network to a corporate contract',
        hint: '−$500/month saved, risk to quality',
        flagId: 'mick_corporatized',
        effect: 'income_delta',
        effectValue: 500,
        resolution: {
          severity: 'neutral',
          message: "Mick acknowledged the decision in one sentence. He said he'd stay on the original. He did not say anything else about it.",
        },
      },
    ],
  },

  {
    id: 'janet_rebrand',
    label: 'The Rebrand Proposal',
    weight: 8,
    repeatable: false,
    condition: ({ decisions, sentIds, franchises }) =>
      decisions.head_office_purchased && franchises.length >= 5 &&
      sentIds.has('janet_cult_alarm') &&
      !decisions.brand_refreshed && !decisions.brand_protected,
    getMessage: () =>
      `Janet Okafor has sent a formal proposal: a network-wide rebrand. Standardised interiors, a unified name, consistent design across all locations. The projections show a seven percent revenue lift and substantially reduced operational confusion. It would change what the original location looks like to new visitors. It would make the chain legible. It would make it a chain.`,
    choices: [
      {
        id: 'approve_rebrand',
        label: 'Back the rebrand — scale requires coherence',
        hint: '+7% franchise income, −15 popularity at original',
        flagId: 'brand_refreshed',
        effect: 'popularity_delta',
        effectValue: -15,
        effect2: 'income_delta',
        effect2Value: 1500,
        resolution: {
          severity: 'neutral',
          message: "The rollout took three months. Revenue lifted across the network. Gary noted the new lighting scheme was 'technically an improvement.' He still came on Tuesday.",
        },
      },
      {
        id: 'protect_brand',
        label: 'Protect the name — the original is not a template',
        hint: 'no cost, Janet adapts her approach',
        flagId: 'brand_protected',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'good',
          message: "Janet said understood. She came to the original location on Saturday without a clipboard. She sat at the bar for two hours. She sent a different kind of proposal the following week.",
        },
      },
    ],
  },

  // ── Flipper arc decisions ─────────────────────────────────────────────────
  // flipper_night_activity: machine three does the impossible in front of witnesses (trust path).
  // flipper_cold_machines: the bar grows subtly wrong after the Flipper was refused.

  {
    id: 'flipper_night_activity',
    label: 'The Incident',
    weight: 8,
    repeatable: false,
    condition: ({ time, decisions, popularity }) =>
      decisions.flipper_trusted && popularity >= 4000 && time.year >= 1991 &&
      !decisions.flipper_kept_secret && !decisions.flipper_promoted,
    getMessage: () =>
      `Three customers were still at the bar past midnight when it happened. Machine three played a complete multiball sequence — forty-four bumper contacts, both ramps — with no ball visible on the playfield. The sequence ran for forty-eight seconds. Then the machine reset itself and went dark. No fault lights. No error codes. Gary was there. He has been sitting at his table for two hours with his notebook open and has not looked up.`,
    choices: [
      {
        id: 'flipper_say_nothing',
        label: 'Leave it. This stays between you and the machines.',
        hint: 'no effect',
        flagId: 'flipper_kept_secret',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "You turned off the lights and locked up. Whatever it was, it happened. Gary was still writing when you left.",
        },
      },
      {
        id: 'flipper_lean_in',
        label: "Embrace it — this bar has something the others don't.",
        hint: '+25 popularity',
        flagId: 'flipper_promoted',
        effect: 'popularity_delta',
        effectValue: 25,
        resolution: {
          severity: 'good',
          message: "Word spread. People came specifically to be in the room. Three of them stayed until two in the morning and didn't play a single game. They just sat near the machines.",
        },
      },
    ],
  },

  {
    id: 'flipper_cold_machines',
    label: 'Something Has Changed',
    weight: 7,
    repeatable: false,
    condition: ({ time, decisions }) =>
      decisions.flipper_refused && time.year >= 1989 &&
      !decisions.flipper_coldness_accepted && !decisions.flipper_reconcile_attempt,
    getMessage: () =>
      `Three regulars have mentioned to staff, separately, that the machines feel different this month. Not broken — different. One said she couldn't explain it. Gary's Tuesday count is down for the fourth consecutive week. Mick came through on Wednesday and found no fault. He said the machines were "technically fine." He said it the way you say something is technically the speed limit.`,
    choices: [
      {
        id: 'flipper_hold_steady',
        label: "Hold steady — it's probably a quiet patch.",
        hint: '−10 popularity',
        flagId: 'flipper_coldness_accepted',
        effect: 'popularity_delta',
        effectValue: -10,
        resolution: {
          severity: 'bad',
          message: "The quiet continued for another fortnight. Gary noted in his log that machine three had been draining unusually fast. He wrote it factually, without comment.",
        },
      },
      {
        id: 'flipper_try_overnight',
        label: 'Leave the machines on overnight. Try it once.',
        hint: 'opens reconciliation',
        flagId: 'flipper_reconcile_attempt',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "You left the lights on and went home. In the morning everything was exactly as you'd left it. Gary's Tuesday numbers were better the following week. He noted the improvement without explanation.",
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

  {
    id: 'reg_donation_choice',
    label: "Reg's Offer",
    weight: 10,
    repeatable: false,
    condition: ({ decisions, sentIds }) =>
      sentIds.has('reg_offers_organ') &&
      !decisions.reg_donation_accepted && !decisions.reg_donation_declined,
    getMessage: () =>
      `Reg has been tested. He's a match. He's already spoken to the hospital. He's told Linda. The email is sitting in your inbox and he's waiting for an answer.`,
    choices: [
      {
        id: 'accept_donation',
        label: 'Yes. Tell him yes.',
        hint: 'the surgery is scheduled',
        flagId: 'reg_donation_accepted',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'good',
          message: "You wrote back. He replied within the hour with one word: 'Good.' Linda added a P.S. that was longer than Reg's entire email.",
        },
      },
      {
        id: 'decline_donation',
        label: "I can't let him do this.",
        hint: 'find another way',
        flagId: 'reg_donation_declined',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He wrote back one line: 'I expected that. Think about it.' He left the offer open.",
        },
      },
    ],
  },

  {
    id: 'black_market_offer',
    label: 'An Approach',
    weight: 8,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      time.year >= 2021 &&
      !decisions.reg_donation_accepted &&
      !sentIds.has('reg_offers_money') &&
      !decisions.black_market_accepted && !decisions.black_market_declined,
    getMessage: () =>
      `A man you don't recognise comes in on a Tuesday evening and orders water. He says he heard you've been having some medical difficulties. He says he knows people. He says it's expensive but it works, and that you don't need to know anything else about it.`,
    choices: [
      {
        id: 'black_market_yes',
        label: "Tell me the number.",
        hint: '−$50,000',
        flagId: 'black_market_accepted',
        effect: 'income_delta',
        effectValue: -50000,
        resolution: {
          severity: 'bad',
          message: "He named a number. You didn't ask any questions. It worked. You're not going to think too hard about how.",
        },
      },
      {
        id: 'black_market_no',
        label: 'Tell him to leave.',
        hint: 'no effect',
        flagId: 'black_market_declined',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He finished his water and left. You don't know if he'll come back.",
        },
      },
    ],
  },

  {
    id: 'home_computer_warning',
    label: 'The Industry Memo',
    weight: 5,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      time.year >= 1984 && time.week >= 5 &&
      sentIds.has('terry_console_01') &&
      !decisions.doubled_down_pinball && !decisions.added_video_cabinet && !decisions.console_wave_ignored,
    getMessage: () =>
      `Terry has forwarded a distributor circular about falling footfall at coin-op venues across the country. The numbers aren't dramatic yet, but the trend is clear. Gary noticed this week's Tuesday count was down eleven.`,
    choices: [
      {
        id: 'double_down_pinball',
        label: 'Double down — make this the best pinball bar in the city',
        hint: '−$150, +20 popularity',
        flagId: 'doubled_down_pinball',
        effect: 'popularity_delta',
        effectValue: 20,
        effect2: 'income_delta',
        effect2Value: -150,
        resolution: {
          severity: 'good',
          message: 'You had the windows cleaned, the machines tuned, and a hand-lettered sign put in the door. The Tuesday count went back up.',
        },
      },
      {
        id: 'add_video_cabinet',
        label: 'Add a couple of video arcade cabinets',
        hint: '−$300, +10 popularity',
        flagId: 'added_video_cabinet',
        effect: 'income_delta',
        effectValue: -300,
        effect2: 'popularity_delta',
        effect2Value: 10,
        resolution: {
          severity: 'neutral',
          message: "The video cabinets drew some new faces. Gary noted that most of them came for Space Invaders and didn't stay.",
        },
      },
      {
        id: 'wait_and_see',
        label: "Wait and see — it might sort itself out",
        hint: 'no effect now',
        flagId: 'console_wave_ignored',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "You filed the memo away. Tuesday was quieter than usual. You told yourself it was the weather.",
        },
      },
    ],
  },

  {
    id: 'nes_response',
    label: 'The Nintendo Question',
    weight: 5,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      time.year >= 1986 && time.week >= 5 &&
      sentIds.has('gary_console_02') &&
      !decisions.hosted_pinball_league && !decisions.ran_nostalgia_campaign && !decisions.cut_opening_hours,
    getMessage: ({ decisions = {} }) => {
      let text = `Gary's latest numbers: Tuesday attendance down 23% on this time last year. The Nintendo console launched in America last Christmas. It's not here yet, but word travels.`;
      if (decisions.doubled_down_pinball) {
        text += `\n\nThe work you did in '84 is still visible — the machines are in good shape, the regulars are loyal. But the trend is real.`;
      }
      if (decisions.added_video_cabinet) {
        text += `\n\nThe video cabinets have done decent business, but Gary notes the novelty is fading.`;
      }
      return text;
    },
    choices: [
      {
        id: 'host_league',
        label: 'Start a weekly pinball league — make this the place',
        hint: '−$200, +35 popularity',
        flagId: 'hosted_pinball_league',
        effect: 'popularity_delta',
        effectValue: 35,
        effect2: 'income_delta',
        effect2Value: -200,
        resolution: {
          severity: 'good',
          message: 'Eight people signed up for the first league night. By week three it was sixteen. Gary made a spreadsheet.',
        },
      },
      {
        id: 'nostalgia_campaign',
        label: 'Run a "Real Machines" campaign — flyers, local press',
        hint: '−$100, +15 popularity',
        flagId: 'ran_nostalgia_campaign',
        effect: 'popularity_delta',
        effectValue: 15,
        effect2: 'income_delta',
        effect2Value: -100,
        resolution: {
          severity: 'neutral',
          message: 'The piece ran in the local paper. You got some curious new faces, and a letter from someone who remembered playing here in 1978.',
        },
      },
      {
        id: 'cut_hours',
        label: 'Cut opening hours — focus on the loyal regulars',
        hint: '+$150, −20 popularity',
        flagId: 'cut_opening_hours',
        effect: 'income_delta',
        effectValue: 150,
        effect2: 'popularity_delta',
        effect2Value: -20,
        resolution: {
          severity: 'bad',
          message: 'The savings were real. So was the drop. Gary noted that three regulars stopped coming because of the Tuesday closure.',
        },
      },
    ],
  },

  {
    id: 'console_peak_response',
    label: 'The Reckoning',
    weight: 8,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      time.year >= 1987 && time.week >= 5 &&
      sentIds.has('darren_console_02') &&
      !decisions.ran_championship && !decisions.accepted_decline && !decisions.leaned_into_nostalgia,
    getMessage: ({ decisions = {} }) => {
      let text = `The NES is in shops now. Darren hasn't been in since before Christmas. Gary says Tuesday attendance is down thirty-eight percent on 1984 levels.`;
      if (decisions.hosted_pinball_league) {
        text += `\n\nThe league nights are holding — fifteen regulars who wouldn't go anywhere else. It's something.`;
      }
      if (decisions.ran_nostalgia_campaign) {
        text += `\n\nYour "Real Machines" regulars are still coming. They feel invested in the place.`;
      }
      if (decisions.console_wave_ignored && !decisions.hosted_pinball_league && !decisions.ran_nostalgia_campaign) {
        text += `\n\nYou haven't made any major moves. The machines are still good, but the atmosphere has changed.`;
      }
      return text;
    },
    choices: [
      {
        id: 'championship',
        label: 'Host a city-wide pinball championship',
        hint: '−$300, +50 popularity',
        flagId: 'ran_championship',
        effect: 'popularity_delta',
        effectValue: 50,
        effect2: 'income_delta',
        effect2Value: -300,
        resolution: {
          severity: 'good',
          message: 'Forty-one entrants. A reporter from the local paper came to watch. Gary produced a written account of the final round. The log entry was the longest he had ever written.',
        },
      },
      {
        id: 'accept_decline',
        label: 'Accept the new reality — serve the adults who remain',
        hint: 'no cost, −10 popularity',
        flagId: 'accepted_decline',
        effect: 'popularity_delta',
        effectValue: -10,
        resolution: {
          severity: 'neutral',
          message: 'You let the bar shift. Quieter, older crowd. Not what it was, but honest about what it is now.',
        },
      },
      {
        id: 'lean_nostalgia',
        label: 'Lean into nostalgia — vintage machines, period decor',
        hint: '−$150, +20 popularity',
        flagId: 'leaned_into_nostalgia',
        effect: 'popularity_delta',
        effectValue: 20,
        effect2: 'income_delta',
        effect2Value: -150,
        resolution: {
          severity: 'neutral',
          message: 'Some people drove across the city to see the old machines. A few of them were photographers. You started seeing the place in pictures for the first time.',
        },
      },
    ],
  },

  {
    id: 'danny_first_visit',
    label: 'The Kid',
    weight: 10,
    repeatable: false,
    condition: ({ time, decisions }) =>
      time.year >= 1976 && time.week >= 5 &&
      !decisions.danny_welcomed && !decisions.danny_turned_away,
    getMessage: () =>
      `A boy — can't be more than fourteen — has been at one of the machines since early evening. He hasn't bought a drink. He hasn't looked up. It's last orders and he's still playing.`,
    choices: [
      {
        id: 'danny_welcome',
        label: 'He can stay till close',
        hint: 'arc begins',
        flagId: 'danny_welcomed',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: 'He played for another hour without speaking. On the way out he said "thanks." That was it.',
        },
      },
      {
        id: 'danny_turn_away',
        label: "Bar's closing, son",
        hint: 'arc may still continue',
        flagId: 'danny_turned_away',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: 'He packed up without a word. You noticed Gary watching from the back.',
        },
      },
    ],
  },

  {
    id: 'danny_repair_bill',
    label: 'The Invoice',
    weight: 6,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      sentIds.has('mick_danny_note') && time.year >= 1977 && time.week >= 4 &&
      !decisions.danny_maintenance_covered && !decisions.danny_told_about_wear && !decisions.danny_charged_for_repairs,
    getMessage: () =>
      `Mick's invoice is on the bar. The line item reads: "Machine three — elevated service frequency, extended wear pattern, left flipper mechanism." It's the third month in a row. Danny plays six, sometimes eight hours a week. The machines weren't built for that.`,
    choices: [
      {
        id: 'pay_quietly',
        label: 'Pay it without a word',
        hint: '−$150',
        flagId: 'danny_maintenance_covered',
        effect: 'income_delta',
        effectValue: -150,
        resolution: {
          severity: 'good',
          message: "You signed the invoice and put it in the drawer. Danny doesn't know. He probably wouldn't accept it if he did.",
        },
      },
      {
        id: 'tell_danny',
        label: 'Tell him — he should know what the machines cost to run',
        hint: 'no immediate cost',
        flagId: 'danny_told_about_wear',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He listened carefully and didn't say anything for a moment. Then he said he understood and would think about it.",
        },
      },
      {
        id: 'charge_danny',
        label: 'Ask him to chip in — a few pounds a month',
        hint: '+$30',
        flagId: 'danny_charged_for_repairs',
        effect: 'income_delta',
        effectValue: 30,
        resolution: {
          severity: 'bad',
          message: "He paid without complaint. Exact amount. He didn't look at you when he handed it over.",
        },
      },
    ],
  },

  {
    id: 'danny_bumperzone_warning',
    label: 'The Scout',
    weight: 6,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      sentIds.has('gary_danny_warning') && time.year >= 1977 && time.week >= 7 &&
      !decisions.danny_warned_about_bumperzone && !decisions.danny_not_warned_about_bumperzone,
    getMessage: () =>
      `Gary's note is sitting on the bar. A Bumper Zone fleet car. A man asking questions at the counter about "the boy who plays on Tuesdays." Danny's coming in tomorrow. He doesn't know any of this.`,
    choices: [
      {
        id: 'warn_danny',
        label: 'Tell him what you know',
        hint: '+10 popularity',
        flagId: 'danny_warned_about_bumperzone',
        effect: 'popularity_delta',
        effectValue: 10,
        resolution: {
          severity: 'good',
          message: "He absorbed it quietly. Said 'okay.' You got the impression he'd already half-suspected something like this. He thanked you before he left.",
        },
      },
      {
        id: 'say_nothing',
        label: 'Say nothing — it might come to nothing',
        hint: 'no effect',
        flagId: 'danny_not_warned_about_bumperzone',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He played his session and left. You watched him go and told yourself it was the right call.",
        },
      },
    ],
  },

  {
    id: 'danny_journalist',
    label: 'The Journalist',
    weight: 3,
    repeatable: false,
    condition: ({ time, decisions, popularity }) =>
      time.year >= 1977 && popularity >= 400 &&
      !decisions.danny_journalist_featured && !decisions.danny_journalist_declined &&
      (decisions.danny_welcomed || decisions.danny_turned_away),
    getMessage: () =>
      `A woman from the Evening Standard wants to write about "the pinball prodigy." The piece would mention the bar by name. She's already spoken to Gary, who apparently gave her eleven pages of notes and a graph.`,
    choices: [
      {
        id: 'journalist_feature',
        label: 'Feature him — good for both of us',
        hint: '+25 popularity',
        flagId: 'danny_journalist_featured',
        effect: 'popularity_delta',
        effectValue: 25,
        resolution: {
          severity: 'good',
          message: "The piece ran Thursday. Eight new faces on the following Tuesday. Gary kept count.",
        },
      },
      {
        id: 'journalist_decline',
        label: 'Keep him out of the papers',
        hint: 'no effect',
        flagId: 'danny_journalist_declined',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: 'Gary told her the graph was private. She apparently understood.',
        },
      },
    ],
  },

  {
    id: 'chen_evening',
    label: "Mr. Chen's Visit",
    weight: 8,
    repeatable: false,
    condition: ({ time, decisions }) =>
      decisions.chen_invited && time.year >= 1978 && time.week >= 3 &&
      !decisions.chen_welcomed_personally && !decisions.chen_found_danny_quietly && !decisions.chen_observed_quietly,
    getMessage: () =>
      `Lawrence Chen is by the door. He's in a good coat and he's standing very still, watching Danny at machine three. Danny hasn't noticed. Mr. Chen doesn't look like he wants to interrupt. He looks like a man seeing something he'd been trying to picture for a long time.`,
    choices: [
      {
        id: 'introduce_personally',
        label: 'Go over and introduce yourself — tell him what you see in his son',
        hint: '+15 popularity',
        flagId: 'chen_welcomed_personally',
        effect: 'popularity_delta',
        effectValue: 15,
        resolution: {
          severity: 'good',
          message: "He shook your hand for a long time. He said 'I see.' He said it twice. Danny noticed his father from across the room and went still for a moment, then kept playing. Mr. Chen watched to the end.",
        },
      },
      {
        id: 'point_him_over',
        label: 'Catch his eye and point him toward Danny',
        hint: 'no effect',
        flagId: 'chen_found_danny_quietly',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He gave you a nod and walked over. You went back to the bar and didn't hear what was said.",
        },
      },
      {
        id: 'let_it_happen',
        label: 'Leave them to it — Danny will notice when he looks up',
        hint: 'no effect',
        flagId: 'chen_observed_quietly',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "Danny looked up between games and went very still. They found each other without you. That felt right.",
        },
      },
    ],
  },

  {
    id: 'danny_late_night',
    label: 'Last Orders',
    weight: 7,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      sentIds.has('danny_request_01') && time.year >= 1978 && time.week >= 9 &&
      !decisions.danny_stayed_after_hours && !decisions.danny_closed_on_time,
    getMessage: ({ decisions = {} }) => {
      let text = `It's Thursday, twenty minutes to close. Danny is on machine three and he's clearly in the middle of something — not just playing, working something out. He hasn't looked at the clock.`;
      if (decisions.danny_watched_repairs) {
        text += ` Mick's tools are still on the side — he was in earlier and Danny stayed to watch him finish.`;
      }
      return text;
    },
    choices: [
      {
        id: 'lock_up_around_him',
        label: 'Let him stay — lock up around him',
        hint: '+5 popularity',
        flagId: 'danny_stayed_after_hours',
        effect: 'popularity_delta',
        effectValue: 5,
        resolution: {
          severity: 'good',
          message: "You put the chairs up and turned off the main lights except the one over machine three. He was still there when you left. You locked the door and he had a key.",
        },
      },
      {
        id: 'close_on_time',
        label: 'Last orders — same rules for everyone',
        hint: 'no effect',
        flagId: 'danny_closed_on_time',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "He looked up, registered the time, and powered down the machine mid-game without complaint. 'Fair enough,' he said. He said it like Gary.",
        },
      },
    ],
  },

  {
    id: 'danny_big_night',
    label: 'The Big Night',
    weight: 10,
    repeatable: false,
    condition: ({ time, decisions, sentIds }) =>
      time.year >= 1979 && time.week >= 4 &&
      sentIds.has('danny_letter_01') && sentIds.has('crabtree_02') &&
      !decisions.danny_slipped_out && !decisions.danny_stayed_for_run && !decisions.crabtree_distracted,
    getMessage: ({ decisions = {} }) => {
      let text = `It's a Friday. Danny Chen has been at machine three for an hour and a half. The bar is packed — people came to watch. And Crabtree has just walked in with his clipboard.`;
      if (decisions.danny_journalist_featured) {
        text += `\n\nCrabtree has a clipping from the Evening Standard in his clipboard.`;
      }
      if (decisions.chen_invited) {
        text += `\n\nMr. Chen is in his usual corner, watching.`;
      }
      if (decisions.danny_watched_repairs) {
        text += `\n\nMick is at the bar tonight — he came to tune machine three.`;
      }
      return text;
    },
    choices: [
      {
        id: 'danny_slip_out',
        label: 'Quietly get Danny out the side door',
        hint: 'score lost',
        flagId: 'danny_slipped_out',
        effect: null,
        effectValue: 0,
        resolution: {
          severity: 'neutral',
          message: "Danny went quietly. Crabtree inspected an ordinary bar. No incident. Gary watched Danny leave.",
        },
      },
      {
        id: 'danny_stay',
        label: 'Let it play out',
        hint: '−10 popularity',
        flagId: 'danny_stayed_for_run',
        effect: 'popularity_delta',
        effectValue: -10,
        resolution: {
          severity: 'bad',
          message: "Crabtree noted the age. It's in the logbook now. Danny finished the run.",
        },
      },
      {
        id: 'danny_distract_crabtree',
        label: 'Get Crabtree a drink and find something to discuss',
        hint: '−$200',
        flagId: 'crabtree_distracted',
        effect: 'income_delta',
        effectValue: -200,
        resolution: {
          severity: 'good',
          message: "Crabtree stayed forty minutes. He talked mostly about metaphors. Danny finished the run. Gary wrote about it.",
        },
      },
    ],
  },

];
