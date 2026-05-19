import {
  POPULARITY_UNSATISFIED_DOUBLE_ABOVE,
  POPULARITY_UNSATISFIED_TRIPLE_ABOVE,
} from '../constants';

/** How hard each unsatisfied patron hits popularity at the current score. */
export function getUnsatisfiedPopMultiplier(popularity) {
  if (popularity > POPULARITY_UNSATISFIED_TRIPLE_ABOVE) return 3;
  if (popularity > POPULARITY_UNSATISFIED_DOUBLE_ABOVE) return 2;
  return 1;
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
