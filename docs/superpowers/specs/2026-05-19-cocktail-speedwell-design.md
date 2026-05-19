# Cocktail & Speed Well — Design Spec

**Date:** 2026-05-19
**Feature:** New machine (speed well) and new drink type (cocktail) unlocked from 1980 onwards

---

## Overview

Add a `speed_well` supply machine that lets bartenders and servers make cocktails. Customers from 1980 onwards may want cocktails. Cocktails take longer to prepare than beer but earn more revenue. The implementation extends the existing `SERVICE_STATIONS` pattern in `staffAI.js`, which was explicitly designed for this addition.

---

## New Machine — `speed_well`

| Field | Value |
|---|---|
| Type string | `'speed_well'` |
| Display name | `'Speed Well'` |
| Size | 1×1 (same as kegerator) |
| Price | $1,500 |
| Grid behaviour | Identical to kegerator — `getMachineCells`, `getPlayCell`, `getBackCell` all treat it like `kegerator` |
| Sell value | 50% of purchase price × (durability / 100) — via existing `isBarSupply` path |

The speed well appears in the Computer's Supplies tab alongside the kegerator, bartop, and bathroom. It is always purchasable (no year gate in the UI); cocktail demand simply does not appear until 1980, so buying early is a valid forward-planning choice with no harmful side effect.

---

## New Customer Need — `cocktail`

- **Year gate:** only added to the spawn need pool when `time.year >= 1980`
- **Equipment requirement:** at least one placed speed_well AND at least one placed bartop
- **Spawn pool:** `buildSpawnNeedPool` gains a `hasCocktail` flag; `rollSpawnNeeds` treats `'cocktail'` identically to `'drink'` (at most one per customer, deduped)
- **Navigation:** customers with a `'cocktail'` need walk to a bartop (same target type as `'drink'`)
- **Wait status:** `'waiting_for_cocktail'` — mirrors `'waiting_for_drink'`
- **Drinking status:** shared `'drinking'` — customer carries `drinkType: 'cocktail'` so the revenue handler knows which rate to apply
- **Patience:** same `DRINK_PATIENCE_TICKS` and `drinkPatienceMult` as beer — no separate tuning needed at launch
- **Bathroom roll:** `maybeQueueBathroomAfterDrink` fires after a cocktail exactly as it does after a beer (cocktails are still drinks)
- **Unsatisfied reason key:** `'cocktail_wait'` (distinct from `'drink_wait'` for reporting)

---

## Revenue

| Scenario | Beer | Cocktail |
|---|---|---|
| No server | $15 | $25 |
| Server hired | $20 | $35 |

`upgradeValues` gains:

```js
cocktailRevenue: staff.server > 0 ? 35 : 25,
```

The `drinking` handler in `customerAI.js` reads:

```js
const revenue = c.drinkType === 'cocktail'
  ? (upgradeValues.cocktailRevenue ?? 25)
  : (upgradeValues.drinkRevenue ?? 15);
```

---

## Pour Times

All times are in micro-ticks (200 ms each), modified by the bartender speed upgrade.

| Drink | Pour ticks (base) | Serve ticks |
|---|---|---|
| Beer (kegerator) | `⌈5 / bartenderSpeed⌉` | `⌈3 / bartenderSpeed⌉` |
| Cocktail (speed well) | `⌈8 / bartenderSpeed⌉` | `⌈3 / bartenderSpeed⌉` |

---

## Staff AI — Generalised Multi-Station

### `SERVICE_STATIONS` addition

Append to the existing array in `staffAI.js`:

```js
{
  type: 'speed_well',
  waitStatus: 'waiting_for_cocktail',
  getPourCell: (machine) => getPlayCell('speed_well', machine.x, machine.y, machine.orientation),
  pourTime:  (uv) => Math.max(1, Math.round(8 / (uv.bartenderSpeed ?? 1))),
  serveTime: (uv) => Math.max(1, Math.round(3 / (uv.bartenderSpeed ?? 1))),
},
```

### Staff entity fields

Replace `targetKegeratorId` with two generalised fields:

| Field | Type | Meaning |
|---|---|---|
| `targetStationType` | `string \| null` | `'kegerator'` or `'speed_well'` |
| `targetStationId` | `string \| null` | ID of the specific machine claimed |

The per-kegerator `kegLock` map becomes `stationLock: Map<machineId, staffId>` — semantics are identical, scope is now all service machines.

### Status renames

| Old | New |
|---|---|
| `queued_for_kegerator` | `queued_for_station` |
| `walking_to_kegerator` | `walking_to_station` |
| `waiting_at_kegerator` | `waiting_at_station` (transient; reset to `queued_for_station` at top of loop) |

`pouring`, `walking_to_bartop`, `serving`, `idle` are unchanged.

Renaming is safe because staff entities are reset to `DEFAULT_BARTENDER` (null) and `[]` on new game and continue, so no persisted status strings survive across sessions.

### Idle → queued transition

When a staff member is idle, iterate `SERVICE_STATIONS` in order. For each station:
1. Collect all placed machines of that type.
2. Find the first unserved, unclaimed customer with `status === station.waitStatus`.
3. Among machines of that type not locked by another staff member, pick the closest one (Manhattan distance to pour cell).
4. If found: claim the customer, claim the machine in `stationLock`, set `targetStationType`, `targetStationId`, transition to `queued_for_station`.
5. `break` — staff takes only one job per tick.

This means beer orders are served before cocktail orders if both are waiting (kegerator is first in the array). That's acceptable; a future priority system can be added if needed.

### stationLock initialisation

Pre-populate from all staff entities whose status is `walking_to_station` or `pouring` and have a non-null `targetStationId`.

---

## Customer AI — `waiting_for_cocktail`

In `tickCustomers`, the `'cocktail'` need is routed to a bartop exactly like `'drink'`:

```js
const targetType = need === 'pinball' ? 'pinball'
                 : need === 'bathroom' ? 'bathroom'
                 : 'bartop';  // covers both 'drink' and 'cocktail'
```

After reaching the bartop, the customer transitions to:
- `'waiting_for_drink'` if their need was `'drink'`
- `'waiting_for_cocktail'` if their need was `'cocktail'`

The patience timer, stale-job cleanup, and leaving logic are identical for both wait statuses. The `waiting_for_cocktail` block mirrors `waiting_for_drink` verbatim, with `'cocktail_wait'` as the unsatisfied reason key.

When staff finishes serving, the customer receives:

```js
cust.status = 'drinking';
cust.drinkType = 'cocktail';  // set by staff serving block
cust.beingServed = false;
```

---

## `useGameEngine.js` — Spawn Pool

```js
const needPool = buildSpawnNeedPool({
  hasPinball: ...,
  hasDrink:   currentMachines.some(m => m.type === 'bartop'     && m.x !== null) &&
              currentMachines.some(m => m.type === 'kegerator'  && m.x !== null),
  hasCocktail: timeRef.current.year >= 1980 &&
               currentMachines.some(m => m.type === 'bartop'    && m.x !== null) &&
               currentMachines.some(m => m.type === 'speed_well' && m.x !== null),
});
```

---

## `patronNeeds.js` — Pool & Roll

```js
export function buildSpawnNeedPool({ hasPinball, hasDrink, hasCocktail }) {
  const pool = [];
  if (hasPinball)  pool.push('pinball');
  if (hasDrink)    pool.push('drink');
  if (hasCocktail) pool.push('cocktail');
  return pool;
}
```

`rollSpawnNeeds` gains a `cocktailAdded` guard identical to `drinkAdded` — at most one cocktail need per customer.

---

## `App.jsx` Changes

- `nameMap` in `buySupply`: add `speed_well: 'Speed Well'`
- `upgradeValues`: add `cocktailRevenue: staff.server > 0 ? 35 : 25`

---

## `economy.js` Changes

```js
export const BAR_SUPPLY_PURCHASE_PRICE = {
  kegerator:  1000,
  bartop:      500,
  bathroom:   2000,
  speed_well: 1500,
};
```

---

## `grid.js` Changes

```js
export const getMachineCells = (type, x, y, orientation) => {
  if (type === 'bartop' || type === 'kegerator' || type === 'speed_well') return [{x, y}];
  ...
};

export const getPlayCell = (type, x, y, orientation) => {
  if (type === 'kegerator' || type === 'bartop' || type === 'speed_well') {
    // same directional logic
  }
  ...
};
```

---

## `Computer.jsx` Changes

Add a speed well card in the Supplies tab, after the kegerator card:

```jsx
<div className="win95-card">
  <div><strong>Speed Well</strong></div>
  <div style={{fontSize:'0.8rem'}}>For making cocktails. Slower but higher revenue.</div>
  <div style={{marginTop:'0.5rem'}}>Price: $1,500</div>
  <button
    className="win95-btn"
    disabled={cash < 1500 || dayState === 'REPORT'}
    onClick={() => handlePurchaseSupply('speed_well')}
  >
    {purchasedItems['speed_well'] ? 'Purchased!' : 'Order Now'}
  </button>
</div>
```

---

## Dr. Quill Warning Email

An advance-warning email from Dr. Horatio Quill arrives 2 weeks before cocktails unlock, giving the player time to buy a speed well before demand appears.

**Note:** The user requested "Dr. Quinn" — this is Dr. Horatio Quill from `src/data/emails/quill.js`, the time-travelling analyst who sends all "heads-up about upcoming changes" emails (including the bathroom warning in 1975 week 7). The name is a near-homophone; the email goes in `quill.js`.

### Trigger

```js
trigger: ({ time, sentIds }) =>
  (time.year === 1979 && time.week >= 9 || time.year >= 1980) &&
  !sentIds.has('quill_cocktail'),
```

Fires at 1979 week 9 — 2 weeks (6 in-game days) before 1980 week 1. The `|| time.year >= 1980` safety net ensures delivery even if the player's save happens to skip the exact window.

### Tone

Same voice as the bathroom email: Dr. Quill is a bureaucrat from the future writing ahead of a known change, mildly apologetic about the subject matter, precise about practical steps. He mentions cocktails specifically, recommends the speed well, and notes the revenue upside without making it sound like a sales pitch. He is not surprised that cocktails are coming. He researched this.

### Fields

| Field | Value |
|---|---|
| `id` | `'quill_cocktail'` |
| `from` | `'Dr. H. Quill, Temporal Continuity Office'` |
| `address` | `'h.quill@tco.gov.future'` |
| `subject` | `'Re: Upcoming Changes to Patron Beverage Preferences (1980)'` |
| `choices` | `null` |

---

## Files Modified

| File | Change |
|---|---|
| `src/utils/grid.js` | Add `speed_well` to 1×1 types and `getPlayCell` |
| `src/utils/economy.js` | Add `speed_well: 1500` to `BAR_SUPPLY_PURCHASE_PRICE` |
| `src/utils/patronNeeds.js` | Add `cocktail` to pool; `rollSpawnNeeds` cocktail dedup guard |
| `src/simulation/customerAI.js` | `cocktail` need routing; `waiting_for_cocktail` status; `drinkType`-aware revenue |
| `src/simulation/staffAI.js` | Append speed_well to `SERVICE_STATIONS`; generalise to multi-station; rename statuses |
| `src/hooks/useGameEngine.js` | `buildSpawnNeedPool` gains `hasCocktail` |
| `src/App.jsx` | `nameMap`, `upgradeValues.cocktailRevenue` |
| `src/components/Computer.jsx` | Speed well card in Supplies tab |
| `src/data/emails/quill.js` | Append `quill_cocktail` warning email |

No new files. No changes to `constants.js` or `upgrades.js`.
