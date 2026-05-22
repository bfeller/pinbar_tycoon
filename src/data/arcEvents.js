export const LIQUIDATION_DURATION_DAYS = 60; // ~2 in-game years

export const BUMPER_ZONE_MACHINES = [
  { id: 'bz-gorgar',      name: 'Gorgar',                        supplementary: 'Williams · 1979', parsedYear: 1979, durability: 45, locationCount: 150 },
  { id: 'bz-firepower',   name: 'Firepower',                     supplementary: 'Williams · 1980', parsedYear: 1980, durability: 38, locationCount: 200 },
  { id: 'bz-blackknight', name: 'Black Knight',                  supplementary: 'Williams · 1980', parsedYear: 1980, durability: 52, locationCount: 180 },
  { id: 'bz-centaur',     name: 'Centaur',                       supplementary: 'Bally · 1981',    parsedYear: 1981, durability: 61, locationCount: 120 },
  { id: 'bz-highspeed',   name: 'High Speed',                    supplementary: 'Williams · 1986', parsedYear: 1986, durability: 55, locationCount: 250 },
  { id: 'bz-comet',       name: 'Comet',                         supplementary: 'Williams · 1985', parsedYear: 1985, durability: 41, locationCount: 190 },
  { id: 'bz-elvira',      name: 'Elvira and the Party Monsters', supplementary: 'Bally · 1989',    parsedYear: 1989, durability: 67, locationCount: 160 },
  { id: 'bz-tz',          name: 'Twilight Zone',                 supplementary: 'Williams · 1993', parsedYear: 1993, durability: 72, locationCount: 350 },
  { id: 'bz-addams',      name: 'The Addams Family',             supplementary: 'Williams · 1992', parsedYear: 1992, durability: 58, locationCount: 550 },
  { id: 'bz-tom',         name: 'Theatre of Magic',              supplementary: 'Bally · 1995',    parsedYear: 1995, durability: 44, locationCount: 280 },
  { id: 'bz-medieval',    name: 'Medieval Madness',              supplementary: 'Williams · 1997', parsedYear: 1997, durability: 36, locationCount: 310 },
  { id: 'bz-sopranos',    name: 'The Sopranos',                  supplementary: 'Stern · 2005',    parsedYear: 2005, durability: 69, locationCount: 120 },
];

// popularityPct: fraction of current popularity added as a one-time hit (negative = loss)
// setGainMult: scales only positive daily popularity growth (losses stay full strength)
// triggerLiquidation: opens the Bumper Zone sale window in the market
export const ARC_EVENTS = [
  {
    id: 'arc_danny_fame',
    popularityPct: 0.12,
    trigger: ({ time, firedIds, sentIds }) =>
      sentIds.has('danny_letter_01') && time.year >= 1977 && time.week >= 4 && !firedIds.has('arc_danny_fame'),
  },
  {
    id: 'arc_competition',
    popularityPct: -0.15,
    trigger: ({ time, firedIds }) =>
      time.year >= 1981 && !firedIds.has('arc_competition'),
  },
  {
    id: 'arc_clustering',
    popularityPct: 0.25,
    setGainMult: 1.1,
    trigger: ({ sentIds, firedIds }) =>
      sentIds.has('voss_03') && !firedIds.has('arc_clustering'),
  },
  {
    id: 'arc_nineties_boom',
    // Pinball's second wind — full positive growth; 80s one-time shocks do not linger here.
    setGainMult: 1.0,
    trigger: ({ time, firedIds }) =>
      time.year >= 1990 && time.year < 2001 && !firedIds.has('arc_nineties_boom'),
  },
  {
    id: 'arc_crisis_begins',
    popularityPct: -0.35,
    setGainMult: 0.75,
    trigger: ({ time, firedIds }) =>
      time.year >= 2001 && !firedIds.has('arc_crisis_begins'),
  },
  {
    id: 'arc_crisis_deepens',
    popularityPct: -0.45,
    setGainMult: 0.50,
    trigger: ({ time, firedIds }) =>
      time.year >= 2006 && !firedIds.has('arc_crisis_deepens'),
  },
  {
    id: 'arc_bumperzone_closes',
    popularityPct: -0.20,
    setGainMult: 0.55,
    triggerLiquidation: true,
    trigger: ({ sentIds, firedIds }) =>
      sentIds.has('reg_08') && !firedIds.has('arc_bumperzone_closes'),
  },
  {
    id: 'arc_renaissance',
    popularityPct: 0.50,
    setGainMult: 1.0,
    trigger: ({ time, firedIds }) =>
      time.year >= 2015 && !firedIds.has('arc_renaissance'),
  },
];
