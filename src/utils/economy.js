import { NEW_MACHINE_PRICE } from '../constants';

export const extractYear = (supplementary) => {
  if (!supplementary) return 2020;
  const match = supplementary.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1]) : 2020;
};

const LOG_MAX = Math.log1p(1200); // normalise against ~peak observed locationCount

export const calculatePrice = (machineYear, currentYear, durability = 100, locationCount = 0) => {
  if (machineYear > currentYear) return null;
  const age = Math.max(0, currentYear - machineYear);
  const ageDiscountPct = Math.min(0.25, age * 0.05);
  const durabilityDiscountPct = 0.5 * (1 - durability / 100);

  if (age === 0) {
    // New machine — no popularity adjustment, straight durability discount
    return Math.floor(NEW_MACHINE_PRICE * (1 - durabilityDiscountPct));
  }

  // Popularity premium: scales up to +45% of new price at peak popularity + mint condition.
  // This overcomes the max 25% age discount and adds up to 20% above new price.
  // conditionFactor ensures trashed machines never benefit from popularity.
  const popularityFactor = Math.log1p(locationCount) / LOG_MAX; // 0–1
  const conditionFactor = durability / 100;                      // 0–1
  const popularityBonus = popularityFactor * conditionFactor * 0.45;

  const netAdjustment = -ageDiscountPct - durabilityDiscountPct + popularityBonus;

  // Only allow above-new-price if machine is more than 5 years old —
  // otherwise you could just buy it new.
  const maxFactor = age > 5 ? 1.20 : 1.0;
  return Math.floor(NEW_MACHINE_PRICE * Math.min(maxFactor, Math.max(0.25, 1 + netAdjustment)));
};
