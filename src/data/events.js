// effect types:
//   'machine_damage'     — damages the weakest (or a random) placed pinball machine
//   'all_machine_damage' — applies small damage to every placed pinball machine
//   'popularity_delta'   — added to dailyReport.eventPopularityDelta, applied in nextDay()
//   'income_delta'       — immediately added to cash
//
// getMessage(ctx) receives { machineName } and returns the notification string.

export const EVENT_DEFS = [

  // ── Bad events ──────────────────────────────────────────────────────────

  {
    id: 'machine_breakdown',
    label: 'Machine Breakdown',
    severity: 'bad',
    weight: 3,
    condition: ({ machines }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability < 50),
    effect: 'machine_damage',
    effectValue: 25,
    target: 'weakest',
    getMessage: ({ machineName }) => `${machineName} gave out mid-session.`,
  },

  {
    id: 'rowdy_crowd',
    label: 'Rowdy Crowd',
    severity: 'bad',
    weight: 2,
    condition: ({ machines }) =>
      machines.filter(m => (m.type === 'pinball' || !m.type) && m.x !== null).length >= 3,
    effect: 'all_machine_damage',
    effectValue: 8,
    getMessage: () => 'A rowdy group tore through the machines tonight.',
  },

  {
    id: 'spilled_drink',
    label: 'Spilled Drink',
    severity: 'bad',
    weight: 2,
    condition: ({ machines }) =>
      machines.some(m => m.type === 'kegerator' && m.x !== null) &&
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null),
    effect: 'machine_damage',
    effectValue: 15,
    target: 'random',
    getMessage: ({ machineName }) => `Someone spilled a pint on ${machineName}.`,
  },

  {
    id: 'power_flicker',
    label: 'Power Flicker',
    severity: 'bad',
    weight: 1,
    condition: () => true,
    effect: 'popularity_delta',
    effectValue: -10,
    getMessage: () => 'The power flickered mid-session. Customers were not pleased.',
  },

  {
    id: 'noise_complaint',
    label: 'Noise Complaint',
    severity: 'bad',
    weight: 1,
    condition: ({ popularity }) => popularity > 50,
    effect: 'popularity_delta',
    effectValue: -15,
    getMessage: () => 'A neighbour called in a noise complaint. You had to dial things back.',
  },

  // ── Good events ──────────────────────────────────────────────────────────

  {
    id: 'high_score',
    label: 'High Score',
    severity: 'good',
    weight: 4,
    condition: ({ machines }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0),
    effect: 'popularity_delta',
    effectValue: 20,
    getMessage: ({ machineName }) => `Someone played an incredible game on ${machineName}. People are talking.`,
  },

  {
    id: 'word_of_mouth',
    label: 'Word of Mouth',
    severity: 'good',
    weight: 3,
    condition: ({ machines }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0),
    effect: 'popularity_delta',
    effectValue: 12,
    getMessage: () => 'A group of friends arrived after hearing about the place.',
  },

  {
    id: 'vintage_appreciation',
    label: 'Vintage Appreciation',
    severity: 'good',
    weight: 2,
    condition: ({ machines, time }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && (time.year - (m.year ?? time.year)) > 15),
    effect: 'popularity_delta',
    effectValue: 18,
    getMessage: ({ machineName }) => `A customer couldn't believe ${machineName} still plays. They told everyone.`,
  },

  {
    id: 'local_press',
    label: 'Local Press',
    severity: 'good',
    weight: 1,
    condition: ({ popularity }) => popularity > 30,
    effect: 'popularity_delta',
    effectValue: 50,
    getMessage: () => 'A local journalist mentioned the bar in their column.',
  },

  {
    id: 'lucky_tip',
    label: 'Lucky Tip',
    severity: 'good',
    weight: 2,
    condition: ({ machines }) =>
      machines.some(m => m.type === 'bartop' && m.x !== null),
    effect: 'income_delta',
    effectValue: 75,
    getMessage: () => 'A customer left a very generous tip on their way out.',
  },

];
