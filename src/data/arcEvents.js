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

// popularityPct:     fraction of current popularity added as a one-time hit (negative = loss)
// setGainMult:       scales only positive daily popularity growth (losses stay full strength)
// pinballPopDelta:   additive change to pinballPopularity (0–100 clamped 5–100)
// setPinballPop:     set pinballPopularity to an absolute value (used for guaranteed floors)
// triggerLiquidation: opens the Bumper Zone sale window in the market
export const ARC_EVENTS = [

  // ── Roger Sharpe lifts NYC ban (1976) ────────────────────────────────────
  // Sharpe called his shot before city council. 35 years of bans ended in one afternoon.
  {
    id: 'arc_sharpe_ruling',
    pinballPopDelta: 20,
    trigger: ({ time, firedIds }) =>
      time.year >= 1976 && !firedIds.has('arc_sharpe_ruling'),
  },

  // ── Danny's story reaches the paper ──────────────────────────────────────
  {
    id: 'arc_danny_fame',
    popularityPct: 0.12,
    pinballPopDelta: 5,
    trigger: ({ time, firedIds, sentIds }) =>
      sentIds.has('danny_letter_01') && time.year >= 1977 && time.week >= 4 && !firedIds.has('arc_danny_fame'),
  },
  {
    id: 'arc_danny_press_boost',
    pinballPopDelta: 8,
    trigger: ({ firedIds, decisions }) =>
      decisions.danny_journalist_featured && !firedIds.has('arc_danny_press_boost'),
  },

  // ── Danny breaks the record ───────────────────────────────────────────────
  {
    id: 'arc_danny_record_boost',
    pinballPopDelta: 12,
    trigger: ({ time, firedIds, decisions }) =>
      time.year >= 1979 &&
      (decisions.danny_stayed_for_run || decisions.crabtree_distracted) &&
      !firedIds.has('arc_danny_record_boost'),
  },

  {
    id: 'arc_competition',
    popularityPct: -0.15,
    trigger: ({ time, firedIds }) =>
      time.year >= 1981 && !firedIds.has('arc_competition'),
  },

  // ── Home Console Wave (1983–1989) ─────────────────────────────────────────
  {
    id: 'arc_atari_crash_ripple',
    popularityPct: -0.05,
    pinballPopDelta: -8,
    trigger: ({ time, firedIds }) =>
      time.year >= 1983 && !firedIds.has('arc_atari_crash_ripple'),
  },
  {
    id: 'arc_console_wave_soft',
    popularityPct: -0.12,
    setGainMult: 0.92,
    pinballPopDelta: -12,
    trigger: ({ time, firedIds, decisions }) =>
      time.year >= 1987 &&
      !firedIds.has('arc_console_wave_soft') && !firedIds.has('arc_console_wave_hard') &&
      (decisions.doubled_down_pinball || decisions.hosted_pinball_league ||
       decisions.ran_championship || decisions.ran_nostalgia_campaign),
  },
  {
    id: 'arc_console_wave_hard',
    popularityPct: -0.25,
    setGainMult: 0.85,
    pinballPopDelta: -25,
    trigger: ({ time, firedIds, decisions }) =>
      time.year >= 1987 &&
      !firedIds.has('arc_console_wave_soft') && !firedIds.has('arc_console_wave_hard') &&
      !decisions.doubled_down_pinball && !decisions.hosted_pinball_league &&
      !decisions.ran_championship && !decisions.ran_nostalgia_campaign,
  },
  {
    id: 'arc_arcade_community_holds',
    popularityPct: 0.08,
    pinballPopDelta: 5,
    trigger: ({ time, firedIds, decisions }) =>
      time.year >= 1989 &&
      !firedIds.has('arc_arcade_community_holds') &&
      (decisions.ran_championship || decisions.hosted_pinball_league),
  },
  {
    id: 'arc_clustering',
    popularityPct: 0.25,
    setGainMult: 1.1,
    trigger: ({ sentIds, firedIds }) =>
      sentIds.has('voss_03') && !firedIds.has('arc_clustering'),
  },

  // ── Nineties boom — Williams golden age, Addams Family era ───────────────
  {
    id: 'arc_nineties_boom',
    setGainMult: 1.0,
    pinballPopDelta: 18,
    trigger: ({ time, firedIds }) =>
      time.year >= 1990 && time.year < 2001 && !firedIds.has('arc_nineties_boom'),
  },

  // ── Williams exits pinball manufacturing (1999) ───────────────────────────
  {
    id: 'arc_williams_retires',
    popularityPct: -0.10,
    pinballPopDelta: -15,
    trigger: ({ time, firedIds }) =>
      time.year >= 1999 && !firedIds.has('arc_williams_retires'),
  },

  // ── Internet era — pinball floors out ────────────────────────────────────
  {
    id: 'arc_crisis_begins',
    popularityPct: -0.35,
    setGainMult: 0.75,
    setPinballPop: 20,
    trigger: ({ time, firedIds }) =>
      time.year >= 2001 && !firedIds.has('arc_crisis_begins'),
  },
  {
    id: 'arc_crisis_deepens',
    popularityPct: -0.45,
    setGainMult: 0.50,
    setPinballPop: 10,
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

  // ── Pinball renaissance ───────────────────────────────────────────────────
  {
    id: 'arc_renaissance',
    popularityPct: 0.50,
    setGainMult: 1.0,
    setPinballPop: 50,
    trigger: ({ time, firedIds }) =>
      time.year >= 2015 && !firedIds.has('arc_renaissance'),
  },
];
