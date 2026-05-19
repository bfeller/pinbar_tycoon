import {
  POPULARITY_TIER_SIZE,
  POPULARITY_UNSATISFIED_FIRST_TIER,
  POPULARITY_SPAWN_HALF_SATURATION,
} from '../constants';

const MIN_SPAWN_THRESHOLD = 0.15;
const SPAWN_THRESHOLD_BASE = 0.85;
const SPAWN_THRESHOLD_POP_RANGE = 0.60;
const OPENING_RUSH_BONUS = 0.25;

/**
 * Unsatisfied penalty tier: 1 below FIRST_TIER, then +1 every TIER_SIZE
 * (2× above 1000, 3× above 2000, 4× above 3000, …).
 */
export function getUnsatisfiedPopMultiplier(popularity) {
  if (popularity <= POPULARITY_UNSATISFIED_FIRST_TIER) return 1;
  return 1 + Math.ceil((popularity - POPULARITY_UNSATISFIED_FIRST_TIER) / POPULARITY_TIER_SIZE);
}

/** Popularity at which unsatisfied penalty first reaches `multiplier` (2 → 1001, 3 → 2001, …). */
export function getUnsatisfiedTierStart(multiplier) {
  if (multiplier <= 1) return Infinity;
  return POPULARITY_UNSATISFIED_FIRST_TIER + (multiplier - 2) * POPULARITY_TIER_SIZE + 1;
}

/** True when within `advance` points of crossing into a new unsatisfied tier. */
export function isApproachingUnsatisfiedTier(popularity, multiplier, advance = 100) {
  const start = getUnsatisfiedTierStart(multiplier);
  return popularity >= start - advance && popularity < start;
}

/**
 * Foot-traffic factor (0 → 1 asymptotically). Keeps improving past any fixed cap.
 */
export function getSpawnPopFactor(popularity) {
  const pop = Math.max(0, popularity);
  return 1 - 1 / (1 + pop / POPULARITY_SPAWN_HALF_SATURATION);
}

/** Per-second spawn roll threshold (lower = more spawns). */
export function getSpawnThreshold(popularity, { spawnBoost = 0, openingRush = false } = {}) {
  let threshold = Math.max(
    MIN_SPAWN_THRESHOLD,
    SPAWN_THRESHOLD_BASE - SPAWN_THRESHOLD_POP_RANGE * getSpawnPopFactor(popularity),
  ) - spawnBoost;
  if (openingRush) threshold = Math.max(MIN_SPAWN_THRESHOLD, threshold - OPENING_RUSH_BONUS);
  return threshold;
}

export function calcCustomerPopDelta(satisfied, unsatisfied, popularity) {
  const mult = getUnsatisfiedPopMultiplier(popularity);
  return (satisfied ?? 0) - (unsatisfied ?? 0) * mult;
}

/**
 * Daily popularity from machines + patrons. Arc-era gainMult (crisis, etc.)
 * only scales positive growth; losses stay at full value (still × socialBoost).
 */
export function calcDailyPopGain(machineScore, customerDelta, { socialBoost = 1, gainMult = 1 } = {}) {
  const positive = machineScore + Math.max(0, customerDelta);
  const negative = Math.min(0, customerDelta);
  return Math.round(positive * socialBoost * gainMult + negative * socialBoost);
}
