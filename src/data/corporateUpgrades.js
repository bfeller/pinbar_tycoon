// Corporate upgrades — available only after a Head Office is established.
// These are purchased immediately (no course duration) through the Corporate HQ
// window in the computer. They represent strategic business capabilities
// rather than personal skills.

export const CORPORATE_UPGRADE_DEFS = [
  {
    id: 'bully_suppliers',
    name: 'Bully Suppliers',
    icon: '🤜',
    flavor: 'Leverage your purchasing volume to extract better terms from bar equipment suppliers. The more locations you have, the less anyone wants to lose the contract.',
    effect: level => `${level * 10}% discount on all bar equipment purchases`,
    maxLevel: 3,
    costs: [50000, 150000, 400000],
  },
  {
    id: 'mascot_program',
    name: 'Mascot Costume Program',
    icon: '🦝',
    flavor: 'A rabid-looking raccoon mascot named "Tilt" patrols every location handing out sticky high-fives. Children weep; adults inexplicably stay for another round.',
    effect: level => `+${level * 12}% customer foot traffic`,
    maxLevel: 3,
    costs: [40000, 120000, 300000],
  },
  {
    id: 'creative_accounting',
    name: 'Creative Accounting',
    icon: '🧾',
    flavor: 'A boutique firm operating out of a Cayman Islands P.O. box "restructures" your head office lease. The paperwork is best left unread.',
    effect: level => `${level * 15}% lower head office rent`,
    maxLevel: 3,
    costs: [60000, 160000, 350000],
  },
  {
    id: 'goon_squad',
    name: 'Goon Squad "Loss Prevention"',
    icon: '🕶️',
    flavor: 'Square-jawed gentlemen in ill-fitting suits loom near the machines. Nobody dares slam a flipper too hard. Repair liability quietly plummets.',
    effect: level => `${level * 8}% less machine damage`,
    maxLevel: 3,
    costs: [45000, 130000, 320000],
  },
  {
    id: 'loyalty_cult',
    name: 'Patron Loyalty Cult',
    icon: '🔮',
    flavor: 'What began as a humble punch-card rewards program has evolved into something with robes, chanting, and a newsletter. Members will wait gladly for their turn at the table.',
    effect: level => `+${level * 10} customer patience`,
    maxLevel: 3,
    costs: [50000, 140000, 360000],
  },
  {
    id: 'espresso_iv',
    name: 'Espresso IV Program',
    icon: '☕',
    flavor: 'Mandatory caffeine drips keep your bartenders moving at a frankly concerning velocity. OSHA has left several voicemails.',
    effect: level => `+${level * 25}% bartender service speed`,
    maxLevel: 2,
    costs: [55000, 175000],
  },
  {
    id: 'happy_hour_engine',
    name: 'Dynamic Happy-Hour Engine',
    icon: '🍸',
    flavor: 'A proprietary algorithm screams "HAPPY HOUR!" at psychologically optimal moments. Patrons feel they are getting a deal. They are not.',
    effect: level => `+$${level * 4} revenue per drink served`,
    maxLevel: 3,
    costs: [50000, 150000, 400000],
  },
];
