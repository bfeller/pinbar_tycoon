export const BATHROOM_AFTER_DRINK_BASE_CHANCE = 0.55;
export const BATHROOM_UNLOCK_YEAR = 1976;

export function buildSpawnNeedPool({ hasPinball, hasDrink }) {
  const pool = [];
  if (hasPinball) pool.push('pinball');
  if (hasDrink) pool.push('drink');
  return pool;
}

export function rollSpawnNeeds(needPool, rng = Math.random) {
  const needsCount = Math.floor(rng() * 3) + 1;
  const needs = [];
  for (let i = 0; i < needsCount; i++) {
    needs.push(needPool[Math.floor(rng() * needPool.length)]);
  }
  return needs;
}

export function getBathroomChance(drinksHad) {
  if (drinksHad <= 0) return 0;
  return 1 - Math.pow(1 - BATHROOM_AFTER_DRINK_BASE_CHANCE, drinksHad);
}

export function maybeQueueBathroomAfterDrink(patron, { year, hasBathroom, rng = Math.random }) {
  const drinksHad = (patron.drinksHad ?? 0) + 1;
  let needs = [...(patron.needs ?? [])];
  let bathroomQueued = patron.bathroomQueued ?? false;

  if (bathroomQueued || needs.includes('bathroom')) {
    return { needs, drinksHad, bathroomQueued };
  }

  if (year >= BATHROOM_UNLOCK_YEAR && hasBathroom) {
    const chance = getBathroomChance(drinksHad);
    if (rng() < chance) {
      needs = [...needs, 'bathroom'];
      bathroomQueued = true;
    }
  }

  return { needs, drinksHad, bathroomQueued };
}

export function markBathroomQueued(patron) {
  return { bathroomQueued: true };
}

/** After a completed bathroom visit; blocks any further bathroom rolls this visit. */
export function markBathroomVisitComplete(patron) {
  return { bathroomQueued: true };
}
