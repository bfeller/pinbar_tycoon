export const BATHROOM_AFTER_DRINK_BASE_CHANCE = 0.55;
export const BATHROOM_UNLOCK_YEAR = 1976;
export const COCKTAIL_UNLOCK_YEAR = 1980;

export function buildSpawnNeedPool({ hasPinball, hasDrink, hasCocktail }) {
  const pool = [];
  if (hasPinball)  pool.push('pinball');
  if (hasDrink)    pool.push('drink');
  if (hasCocktail) pool.push('cocktail');
  return pool;
}

export function rollSpawnNeeds(needPool, rng = Math.random) {
  const needsCount = Math.floor(rng() * 3) + 1;
  const needs = [];
  let drinkAdded = false;
  let pinballAdded = false;
  let cocktailAdded = false;
  for (let i = 0; i < needsCount; i++) {
    const available = needPool.filter((n) => {
      if (n === 'drink'    && drinkAdded)    return false;
      if (n === 'pinball'  && pinballAdded)  return false;
      if (n === 'cocktail' && cocktailAdded) return false;
      return true;
    });
    const pool = available.length > 0 ? available : needPool;
    const pick = pool[Math.floor(rng() * pool.length)];
    needs.push(pick);
    if (pick === 'drink')    drinkAdded    = true;
    if (pick === 'pinball')  pinballAdded  = true;
    if (pick === 'cocktail') cocktailAdded = true;
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
