import { NEW_MACHINE_PRICE } from '../constants';

export const extractYear = (supplementary) => {
  if (!supplementary) return 2020;
  const match = supplementary.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1]) : 2020;
};

export const calculatePrice = (machineYear, currentYear, durability = 100) => {
  if (machineYear > currentYear) return null;
  const age = Math.max(0, currentYear - machineYear);
  const ageDiscountPct = Math.min(0.25, age * 0.05);
  const durabilityDiscountPct = 0.5 * (1 - durability / 100);
  const totalDiscount = Math.min(0.75, ageDiscountPct + durabilityDiscountPct);
  return Math.floor(NEW_MACHINE_PRICE * (1 - totalDiscount));
};
