export const NEW_MACHINE_PRICE = 10000;
export const GRID_COLS = 15;
export const GRID_ROWS = 10;
export const BACKROOM_COLS = 5;
export const BACKROOM_ROWS = 5;
export const CELL_SIZE = 50; 
export const DOOR_POS = { x: 7, y: 9 }; 
export const DAY_LENGTH_SECONDS = 15;

/** Finite day length for sim + UI (NaN from bad saves must not bypass the day-end gate). */
export function resolveDayLengthSeconds(upgradeValues = {}) {
  const explicit = Number(upgradeValues.dayLengthSeconds);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const licensing = Number(upgradeValues.liquor_licensing) || 0;
  return DAY_LENGTH_SECONDS + licensing * 5;
}
