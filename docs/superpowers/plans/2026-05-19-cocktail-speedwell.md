# Cocktail & Speed Well Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a speed well bar supply machine that lets staff make cocktails, with cocktail demand appearing from 1980 onwards and a Dr. Quill warning email 2 weeks before.

**Architecture:** The existing `SERVICE_STATIONS` array in `staffAI.js` was designed for this extension — appending a speed_well entry and generalising the staff entity fields (`targetKegeratorId` → `targetStationId` + `targetStationType`, `kegLock` → `stationLock`) gives full multi-station support. Cocktails use the same bartop delivery path as beer; the customer entity carries a `drinkType` field so the `drinking` revenue handler picks the right rate. All other systems (grid, economy, needs pool, marketplace) receive isolated additive changes.

**Tech Stack:** React 18, Vite, plain JS modules. No test framework — verify via build + browser.

---

## Files

| File | Change |
|---|---|
| `src/utils/grid.js` | Add `speed_well` to 1×1 cell types and `getPlayCell` |
| `src/utils/economy.js` | Add `speed_well: 1500` to `BAR_SUPPLY_PURCHASE_PRICE` |
| `src/utils/patronNeeds.js` | Add `cocktail` to spawn pool; dedup guard in `rollSpawnNeeds` |
| `src/simulation/staffAI.js` | Append speed_well station; generalise to multi-station (rename statuses + entity fields) |
| `src/simulation/customerAI.js` | `cocktail` need routing; `waiting_for_cocktail` status; `drinkType`-aware revenue |
| `src/hooks/useGameEngine.js` | `hasCocktail` in spawn pool; pass `barClosed` to `tickStaff` |
| `src/App.jsx` | `upgradeValues.cocktailRevenue`; `nameMap` speed_well entry |
| `src/components/Computer.jsx` | Speed well card in Supplies tab |
| `src/data/emails/quill.js` | Append `quill_cocktail` warning email |

---

### Task 1: Foundation — grid, economy, patron needs pool

**Files:**
- Modify: `src/utils/grid.js:2,13`
- Modify: `src/utils/economy.js:3-7`
- Modify: `src/utils/patronNeeds.js:4-35`

- [ ] **Step 1: Add `speed_well` to grid cell helpers**

  In `src/utils/grid.js`, make two edits:

  Line 2 — change:
  ```js
  if (type === 'bartop' || type === 'kegerator') return [{x, y}];
  ```
  to:
  ```js
  if (type === 'bartop' || type === 'kegerator' || type === 'speed_well') return [{x, y}];
  ```

  Line 13 — change:
  ```js
  if (type === 'kegerator' || type === 'bartop') {
  ```
  to:
  ```js
  if (type === 'kegerator' || type === 'bartop' || type === 'speed_well') {
  ```

- [ ] **Step 2: Add speed_well price to economy**

  In `src/utils/economy.js`, change:
  ```js
  export const BAR_SUPPLY_PURCHASE_PRICE = {
    kegerator: 1000,
    bartop: 500,
    bathroom: 2000,
  };
  ```
  to:
  ```js
  export const BAR_SUPPLY_PURCHASE_PRICE = {
    kegerator:  1000,
    bartop:      500,
    bathroom:   2000,
    speed_well: 1500,
  };
  ```

- [ ] **Step 3: Add `cocktail` to the patron needs pool**

  Replace the entire contents of `src/utils/patronNeeds.js` with:

  ```js
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
  ```

- [ ] **Step 4: Build check**

  ```bash
  cd /home/brizzlefeller/Code/pinbar_tycoon && npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/utils/grid.js src/utils/economy.js src/utils/patronNeeds.js
  git commit -m "feat: add speed_well to grid/economy, cocktail to patron needs pool"
  ```

---

### Task 2: Staff AI — multi-station generalisation

**Files:**
- Modify: `src/simulation/staffAI.js` (full replacement)

This task renames kegerator-specific fields/statuses to generic ones and adds the speed_well as a second `SERVICE_STATIONS` entry. The linter-modified version of this file already has `barClosed` and `claimedCustIds` — both are preserved.

Status renames (safe — staff entities are reset to null/[] on every new game and continue):
- `queued_for_kegerator` → `queued_for_station`
- `walking_to_kegerator` → `walking_to_station`
- `waiting_at_kegerator` → `waiting_at_station`

Entity field renames:
- `targetKegeratorId` → `targetStationId`
- _(new)_ `targetStationType` — which service station type the staff member is serving

Lock rename:
- `kegLock` → `stationLock` (same semantics: `machineId → staffId`)

- [ ] **Step 1: Replace `src/simulation/staffAI.js`**

  ```js
  import PF from 'pathfinding';
  import { DOOR_POS, GRID_COLS, GRID_ROWS } from '../constants';
  import { getPlayCell, getBackCell, getMachineCells } from '../utils/grid';
  import { buildGrid } from '../utils/pathfinding';

  const SERVICE_STATIONS = [
    {
      type: 'kegerator',
      waitStatus: 'waiting_for_drink',
      getPourCell: (machine) => getPlayCell('kegerator', machine.x, machine.y, machine.orientation),
      pourTime:  (uv) => Math.max(1, Math.round(5 / (uv.bartenderSpeed ?? 1))),
      serveTime: (uv) => Math.max(1, Math.round(3 / (uv.bartenderSpeed ?? 1))),
    },
    {
      type: 'speed_well',
      waitStatus: 'waiting_for_cocktail',
      getPourCell: (machine) => getPlayCell('speed_well', machine.x, machine.y, machine.orientation),
      pourTime:  (uv) => Math.max(1, Math.round(8 / (uv.bartenderSpeed ?? 1))),
      serveTime: (uv) => Math.max(1, Math.round(3 / (uv.bartenderSpeed ?? 1))),
    },
  ];

  function findDirectApproach(fromX, fromY, targetCell, machines, blocked) {
    if (!targetCell) return null;
    const key = `${targetCell.x},${targetCell.y}`;
    const grid = buildGrid(machines);
    if (!grid.isWalkableAt(targetCell.x, targetCell.y)) return null;
    if (blocked.has(key)) return null;
    const path = new PF.AStarFinder().findPath(fromX, fromY, targetCell.x, targetCell.y, grid);
    if (!path || path.length === 0) return null;
    return { path, x: targetCell.x, y: targetCell.y };
  }

  function findAdjacentApproach(fromX, fromY, machine, machineType, machines, blocked, excludeCell) {
    const candidates = new Map();
    const add = (x, y) => {
      const key = `${x},${y}`;
      if (candidates.has(key)) return;
      if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return;
      if (excludeCell && x === excludeCell.x && y === excludeCell.y) return;
      const grid = buildGrid(machines);
      if (!grid.isWalkableAt(x, y) || blocked.has(key)) return;
      candidates.set(key, { x, y });
    };

    for (const cell of getMachineCells(machineType, machine.x, machine.y, machine.orientation)) {
      for (const n of [
        { x: cell.x - 1, y: cell.y }, { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 }, { x: cell.x, y: cell.y + 1 },
      ]) add(n.x, n.y);
    }

    const finder = new PF.AStarFinder();
    let best = null;
    for (const cell of candidates.values()) {
      const path = finder.findPath(fromX, fromY, cell.x, cell.y, buildGrid(machines));
      if (path && path.length > 0 && (!best || path.length < best.path.length)) {
        best = { path, x: cell.x, y: cell.y };
      }
    }
    return best;
  }

  export function tickStaff(bartender, servers, updatedCustomers, { machines, upgradeValues, barClosed = false }) {
    // Index placed machines by station type for O(1) lookup
    const stationMachinesByType = new Map(
      SERVICE_STATIONS.map(s => [s.type, machines.filter(m => m.type === s.type && m.x !== null)])
    );
    const hasAnyStation    = SERVICE_STATIONS.some(s => (stationMachinesByType.get(s.type) ?? []).length > 0);
    const hasDeliveryTarget = machines.some(m => m.type === 'bartop' && m.x !== null);

    const staffUnits = [
      { id: bartender?.id ?? 'bartender', entity: bartender },
      ...servers.map(s => ({ id: s.id, entity: s })),
    ];

    // stationLock: machineId → staffId currently walking to or pouring at it
    const stationLock = new Map();
    for (const { id, entity } of staffUnits) {
      if (entity && entity.targetStationId &&
          (entity.status === 'walking_to_station' || entity.status === 'pouring')) {
        stationLock.set(entity.targetStationId, id);
      }
    }

    // claimedCustIds prevents two staff picking the same waiting customer in the same tick
    const claimedCustIds = new Set();
    for (const { entity } of staffUnits) {
      if (entity?.targetCustId) claimedCustIds.add(entity.targetCustId);
    }

    const staffPositions = new Map();
    const nextStaffEntities = [];

    const releaseCustomer = (custId) => {
      if (!custId) return;
      claimedCustIds.delete(custId);
      const cust = updatedCustomers.find(c => c.id === custId &&
        (c.status === 'waiting_for_drink' || c.status === 'waiting_for_cocktail'));
      if (cust) cust.beingServed = false;
    };

    for (const { id, entity } of staffUnits) {
      if (!entity || !hasAnyStation || !hasDeliveryTarget) {
        nextStaffEntities.push(entity);
        continue;
      }

      const blocked = new Set(
        [...staffPositions.entries()]
          .filter(([otherId]) => otherId !== id)
          .map(([, pos]) => `${pos.x},${pos.y}`)
      );

      const next = { ...entity };
      if (next.status === 'waiting_at_station') next.status = 'queued_for_station';

      // Initial spawn — place near the first available station machine
      if (next.x === null) {
        for (const station of SERVICE_STATIONS) {
          const mList = stationMachinesByType.get(station.type) ?? [];
          if (mList.length === 0) continue;
          const spawnMachine  = mList[0];
          const spawnPourCell = station.getPourCell(spawnMachine);
          const approach = findAdjacentApproach(DOOR_POS.x, DOOR_POS.y, spawnMachine, station.type, machines, blocked, spawnPourCell);
          if (approach) { next.x = approach.x; next.y = approach.y; break; }
        }
        if (next.x !== null) staffPositions.set(id, { x: next.x, y: next.y });
        nextStaffEntities.push(next);
        continue;
      }

      // Drop stale job if customer left / gave up
      if (next.targetCustId) {
        const stillWaiting = updatedCustomers.some(c => c.id === next.targetCustId &&
          (c.status === 'waiting_for_drink' || c.status === 'waiting_for_cocktail'));
        if (!stillWaiting) {
          if (next.targetStationId && stationLock.get(next.targetStationId) === id) {
            stationLock.delete(next.targetStationId);
          }
          releaseCustomer(next.targetCustId);
          next.targetCustId     = null;
          next.targetBartopId   = null;
          next.targetStationType = null;
          next.targetStationId  = null;
          next.status = 'idle';
        }
      }

      // Bar closed — cancel queued jobs; let in-progress pours/serves finish
      if (barClosed && next.status === 'queued_for_station') {
        if (next.targetStationId && stationLock.get(next.targetStationId) === id) {
          stationLock.delete(next.targetStationId);
        }
        releaseCustomer(next.targetCustId);
        next.targetCustId      = null;
        next.targetBartopId    = null;
        next.targetStationType = null;
        next.targetStationId   = null;
        next.status = 'idle';
      }

      // ── State machine ────────────────────────────────────────────────────────

      if (next.status === 'idle') {
        // Scan SERVICE_STATIONS in order — first match wins
        for (const station of SERVICE_STATIONS) {
          const stationMachines = stationMachinesByType.get(station.type) ?? [];
          if (stationMachines.length === 0) continue;

          const waitingCust = !barClosed
            ? updatedCustomers.find(c =>
                c.status === station.waitStatus && !c.beingServed && !claimedCustIds.has(c.id))
            : null;
          if (!waitingCust) continue;

          // Pick the closest machine of this type not locked by another staff member
          let bestMachine = null, bestDist = Infinity;
          for (const machine of stationMachines) {
            const holder = stationLock.get(machine.id);
            if (holder && holder !== id) continue;
            const cell = station.getPourCell(machine);
            if (!cell) continue;
            const dist = Math.abs(next.x - cell.x) + Math.abs(next.y - cell.y);
            if (dist < bestDist) { bestDist = dist; bestMachine = machine; }
          }

          if (bestMachine) {
            waitingCust.beingServed = true;
            claimedCustIds.add(waitingCust.id);
            next.targetCustId      = waitingCust.id;
            next.targetBartopId    = waitingCust.machineId;
            next.targetStationType = station.type;
            next.targetStationId   = bestMachine.id;
            next.status = 'queued_for_station';
            stationLock.set(bestMachine.id, id); // reserve immediately so next staff skip it
            break;
          }
        }
      }

      // Resolve current station after idle may have assigned one
      const curStation  = next.targetStationType
        ? SERVICE_STATIONS.find(s => s.type === next.targetStationType) : null;
      const curMachine  = next.targetStationId
        ? machines.find(m => m.id === next.targetStationId) : null;
      const curPourCell = curStation && curMachine ? curStation.getPourCell(curMachine) : null;

      if (next.status === 'queued_for_station' && next.targetCustId) {
        if (!curPourCell) {
          // Station removed — abandon job
          releaseCustomer(next.targetCustId);
          next.targetCustId      = null;
          next.targetBartopId    = null;
          next.targetStationType = null;
          next.targetStationId   = null;
          next.status = 'idle';
        } else if (!stationLock.has(next.targetStationId) || stationLock.get(next.targetStationId) === id) {
          stationLock.set(next.targetStationId, id);
          const approach = findDirectApproach(next.x, next.y, curPourCell, machines, blocked);
          if (approach) {
            next.status = 'walking_to_station';
            next.path = approach.path;
            next.pathIndex = 0;
          } else {
            stationLock.delete(next.targetStationId);
          }
        }

      } else if (next.status === 'walking_to_station') {
        if (!curPourCell || stationLock.get(next.targetStationId) !== id) {
          releaseCustomer(next.targetCustId);
          next.targetCustId      = null;
          next.targetBartopId    = null;
          next.targetStationType = null;
          next.targetStationId   = null;
          next.status = 'idle';
        } else if (next.pathIndex < next.path.length - 1) {
          next.pathIndex++;
          next.x = next.path[next.pathIndex][0];
          next.y = next.path[next.pathIndex][1];
        } else if (next.x === curPourCell.x && next.y === curPourCell.y) {
          next.status = 'pouring';
          next.timer    = curStation.pourTime(upgradeValues);
          next.timerMax = next.timer;
        } else {
          // Arrived at path end but not at pour cell — re-pathfind
          const approach = findDirectApproach(next.x, next.y, curPourCell, machines, blocked);
          if (approach) {
            next.path = approach.path;
            next.pathIndex = 0;
          } else {
            stationLock.delete(next.targetStationId);
            next.status = 'queued_for_station';
          }
        }

      } else if (next.status === 'pouring') {
        if (next.targetStationId) stationLock.set(next.targetStationId, id); // re-assert while pouring
        next.timer--;
        if (next.timer <= 0) {
          if (next.targetStationId) stationLock.delete(next.targetStationId);
          next.status = 'walking_to_bartop';
          const bartop   = machines.find(m => m.id === next.targetBartopId);
          const backCell = bartop ? getBackCell(bartop.type, bartop.x, bartop.y, bartop.orientation) : null;
          if (backCell) {
            const path = new PF.AStarFinder().findPath(next.x, next.y, backCell.x, backCell.y, buildGrid(machines));
            if (path && path.length > 0) {
              next.path = path;
              next.pathIndex = 0;
            } else {
              releaseCustomer(next.targetCustId);
              next.targetCustId = null; next.targetBartopId = null;
              next.targetStationType = null; next.targetStationId = null;
              next.status = 'idle';
            }
          } else {
            releaseCustomer(next.targetCustId);
            next.targetCustId = null; next.targetBartopId = null;
            next.targetStationType = null; next.targetStationId = null;
            next.status = 'idle';
          }
        }

      } else if (next.status === 'walking_to_bartop') {
        if (next.pathIndex < next.path.length - 1) {
          next.pathIndex++;
          next.x = next.path[next.pathIndex][0];
          next.y = next.path[next.pathIndex][1];
        } else {
          next.status = 'serving';
          next.timer    = curStation ? curStation.serveTime(upgradeValues) : 3;
          next.timerMax = next.timer;
        }

      } else if (next.status === 'serving') {
        next.timer--;
        if (next.timer <= 0) {
          const waitStatus = curStation?.waitStatus ?? 'waiting_for_drink';
          const cust = updatedCustomers.find(c => c.id === next.targetCustId && c.status === waitStatus);
          if (cust) {
            cust.status = 'drinking';
            cust.beingServed = false;
          }
          claimedCustIds.delete(next.targetCustId);
          next.status = 'idle';
          next.targetCustId      = null;
          next.targetBartopId    = null;
          next.targetStationType = null;
          next.targetStationId   = null;
        }
      }

      if (next.x !== null) staffPositions.set(id, { x: next.x, y: next.y });
      nextStaffEntities.push(next);
    }

    return {
      nextBartender: nextStaffEntities[0] ?? bartender,
      nextServers:   nextStaffEntities.slice(1),
    };
  }
  ```

- [ ] **Step 2: Build check**

  ```bash
  npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/simulation/staffAI.js
  git commit -m "feat: generalise staffAI to multi-station, add speed_well SERVICE_STATION"
  ```

---

### Task 3: Customer AI — cocktail routing and revenue

**Files:**
- Modify: `src/simulation/customerAI.js`

Cocktails route to `bartop` just like beer. The customer receives `drinkType` when the need is picked up so the `walking_to_bar` arrival knows which wait status to enter. The `drinking` handler reads `drinkType` to pick the revenue rate.

- [ ] **Step 1: Add `waiting_for_cocktail` to the bar-closed kick list**

  In `src/simulation/customerAI.js`, locate the bar-closed block starting at line 181. Change:

  ```js
  if (barClosed && (
    c.status === 'waiting_for_drink' ||
    c.status === 'waiting_for_pinball' ||
    c.status === 'waiting_for_bartop' ||
    c.status === 'waiting_for_bathroom' ||
    c.status === 'walking_to_wait_area'
  )) {
    nextC.beingServed = false;
    const reason = c.status === 'waiting_for_drink' || c.status === 'waiting_for_bartop'
      ? 'bar_closed_drink'
      : c.status === 'waiting_for_pinball' ? 'bar_closed_pinball'
      : 'bar_closed_bathroom';
  ```

  to:

  ```js
  if (barClosed && (
    c.status === 'waiting_for_drink' ||
    c.status === 'waiting_for_cocktail' ||
    c.status === 'waiting_for_pinball' ||
    c.status === 'waiting_for_bartop' ||
    c.status === 'waiting_for_bathroom' ||
    c.status === 'walking_to_wait_area'
  )) {
    nextC.beingServed = false;
    const reason = c.status === 'waiting_for_drink' || c.status === 'waiting_for_bartop'
      ? 'bar_closed_drink'
      : c.status === 'waiting_for_cocktail' ? 'bar_closed_cocktail'
      : c.status === 'waiting_for_pinball' ? 'bar_closed_pinball'
      : 'bar_closed_bathroom';
  ```

- [ ] **Step 2: Add `cocktail` to the evaluating_needs bar-closed reason map**

  In the `evaluating_needs` block (around line 213), change:

  ```js
  const key = n === 'pinball' ? 'bar_closed_pinball' : n === 'drink' ? 'bar_closed_drink' : 'bar_closed_bathroom';
  ```

  to:

  ```js
  const key = n === 'pinball' ? 'bar_closed_pinball'
    : n === 'drink' ? 'bar_closed_drink'
    : n === 'cocktail' ? 'bar_closed_cocktail'
    : 'bar_closed_bathroom';
  ```

- [ ] **Step 3: Set `drinkType` when routing a `cocktail` or `drink` need**

  In the `evaluating_needs` block, after the `need` variable is read (line ~222), add `drinkType` assignment before calling `tryAssignTarget`. Change:

  ```js
      } else {
        const need = nextC.needs[0];
        const targetType = need === 'pinball' ? 'pinball' : need === 'bathroom' ? 'bathroom' : 'bartop';
  ```

  to:

  ```js
      } else {
        const need = nextC.needs[0];
        const targetType = need === 'pinball' ? 'pinball' : need === 'bathroom' ? 'bathroom' : 'bartop';
        if (need === 'cocktail') nextC.drinkType = 'cocktail';
        else if (need === 'drink') nextC.drinkType = 'beer';
  ```

- [ ] **Step 4: Transition to `waiting_for_cocktail` when the bartop walk completes**

  In the `walking_in / walking_to_bar / walking_to_bathroom` block (around line 313), change:

  ```js
      } else if (c.status === 'walking_to_bar') {
        nextC.status = 'waiting_for_drink';
        nextC.drinkPatienceTicks = Math.round(DRINK_PATIENCE_TICKS * (upgradeValues.drinkPatienceMult ?? 1));
  ```

  to:

  ```js
      } else if (c.status === 'walking_to_bar') {
        nextC.status = nextC.drinkType === 'cocktail' ? 'waiting_for_cocktail' : 'waiting_for_drink';
        nextC.drinkPatienceTicks = Math.round(DRINK_PATIENCE_TICKS * (upgradeValues.drinkPatienceMult ?? 1));
  ```

- [ ] **Step 5: Add `waiting_for_cocktail` patience block**

  Immediately after the `waiting_for_drink` block (which ends around line 357), add:

  ```js
      } else if (c.status === 'waiting_for_cocktail') {
        if (nextC.drinkPatienceTicks > 0) nextC.drinkPatienceTicks--;
        if (nextC.drinkPatienceTicks <= 0) {
          if (!tryForgive(nextC)) {
            unsatisfiedCount++;
            unsatisfiedReasons.cocktail_wait = (unsatisfiedReasons.cocktail_wait ?? 0) + 1;
          }
          nextC.machineId = null;
          nextC.beingServed = false;
          nextC.drinkPatienceTicks = undefined;
          nextC.needs.shift();
          if (nextC.needs.length === 0) {
            nextC.angry = true;
            if (!sendToExit(nextC, machines)) continue;
          } else {
            nextC.status = 'evaluating_needs';
          }
        }
  ```

- [ ] **Step 6: Make `drinking` revenue aware of `drinkType`**

  In the `drinking` block (around line 364), change:

  ```js
        const drinkAmount = upgradeValues.drinkRevenue ?? 15;
  ```

  to:

  ```js
        const drinkAmount = nextC.drinkType === 'cocktail'
          ? (upgradeValues.cocktailRevenue ?? 25)
          : (upgradeValues.drinkRevenue ?? 15);
  ```

- [ ] **Step 7: Build check**

  ```bash
  npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 8: Commit**

  ```bash
  git add src/simulation/customerAI.js
  git commit -m "feat: add cocktail need routing, waiting_for_cocktail status, drinkType revenue"
  ```

---

### Task 4: Game engine — spawn pool + barClosed wiring

**Files:**
- Modify: `src/hooks/useGameEngine.js`

Two changes:
1. Pass `hasCocktail` to `buildSpawnNeedPool` (gates cocktail demand on year ≥ 1980 + speed_well placed)
2. Pass `barClosed` to `tickStaff` so it can cancel queued jobs when the day ends

- [ ] **Step 1: Add `hasCocktail` to the spawn pool call**

  In `src/hooks/useGameEngine.js`, locate the `buildSpawnNeedPool` call (around line 76). Change:

  ```js
      const needPool = buildSpawnNeedPool({
        hasPinball: currentMachines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0),
        hasDrink:   currentMachines.some(m => m.type === 'bartop' && m.x !== null) &&
                    currentMachines.some(m => m.type === 'kegerator' && m.x !== null),
      });
  ```

  to:

  ```js
      const needPool = buildSpawnNeedPool({
        hasPinball:  currentMachines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0),
        hasDrink:    currentMachines.some(m => m.type === 'bartop'    && m.x !== null) &&
                     currentMachines.some(m => m.type === 'kegerator' && m.x !== null),
        hasCocktail: timeRef.current.year >= 1980 &&
                     currentMachines.some(m => m.type === 'bartop'    && m.x !== null) &&
                     currentMachines.some(m => m.type === 'speed_well' && m.x !== null),
      });
  ```

- [ ] **Step 2: Pass `barClosed` to `tickStaff`**

  In the micro-tick's `tickStaff` call (around line 228), change:

  ```js
        const { nextBartender, nextServers } = tickStaff(
          bartenderRef.current,
          serversRef.current,
          result.next,
          { machines: machinesRef.current, upgradeValues: upgradeValuesRef.current }
        );
  ```

  to:

  ```js
        const dayLen = upgradeValuesRef.current.dayLengthSeconds ?? DAY_LENGTH_SECONDS;
        const barClosed = dayTimerRef.current >= dayLen;
        const { nextBartender, nextServers } = tickStaff(
          bartenderRef.current,
          serversRef.current,
          result.next,
          { machines: machinesRef.current, upgradeValues: upgradeValuesRef.current, barClosed }
        );
  ```

- [ ] **Step 3: Build check**

  ```bash
  npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/hooks/useGameEngine.js
  git commit -m "feat: add hasCocktail to spawn pool, pass barClosed to tickStaff"
  ```

---

### Task 5: App.jsx — upgradeValues + nameMap

**Files:**
- Modify: `src/App.jsx`

Two small additions to the existing objects.

- [ ] **Step 1: Add `cocktailRevenue` to `upgradeValues`**

  In `src/App.jsx`, locate the `upgradeValues` object (around line 133). Add `cocktailRevenue` after `drinkRevenue`:

  ```js
    const upgradeValues = {
      patienceTicks: 30 + upgrades.psychology * 15,
      spawnBoost: upgrades.marketing * 0.08,
      damageReduction: upgrades.electrical_eng * 0.10,
      bartenderSpeed: 1 + upgrades.mixology * 0.5,
      charm: upgrades.charm,
      drinkPatienceMult: staff.server > 0 ? 2 : 1,
      drinkRevenue: staff.server > 0 ? 20 : 15,
      cocktailRevenue: staff.server > 0 ? 35 : 25,
      repairmanActive: staff.repairman,
      repairmanCoverage: staff.repairman ? 10 : 0,
      dayLengthSeconds: DAY_LENGTH_SECONDS + (upgrades.liquor_licensing ?? 0) * 5,
      liquor_licensing: upgrades.liquor_licensing ?? 0,
    };
  ```

- [ ] **Step 2: Add `speed_well` to `nameMap` in `buySupply`**

  In `src/App.jsx`, locate the `buySupply` function (around line 409). Change:

  ```js
    const nameMap = { kegerator: 'Kegerator', bartop: 'Bartop', bathroom: 'Bathroom' };
  ```

  to:

  ```js
    const nameMap = { kegerator: 'Kegerator', bartop: 'Bartop', bathroom: 'Bathroom', speed_well: 'Speed Well' };
  ```

- [ ] **Step 3: Build check**

  ```bash
  npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "feat: add cocktailRevenue to upgradeValues, speed_well to supply nameMap"
  ```

---

### Task 6: Marketplace UI — speed well card

**Files:**
- Modify: `src/components/Computer.jsx`

Add the speed well card after the kegerator card in the Supplies tab.

- [ ] **Step 1: Add speed well card**

  In `src/components/Computer.jsx`, locate the kegerator card block in the Supplies section (around line 235):

  ```jsx
                    <div className="win95-card">
                      <div><strong>Kegerator</strong></div>
                      <div style={{fontSize:'0.8rem'}}>Essential for serving drinks.</div>
                      <div style={{marginTop:'0.5rem'}}>Price: $1000</div>
                      <button
                        className="win95-btn"
                        disabled={cash < 1000 || dayState === 'REPORT'}
                        onClick={() => handlePurchaseSupply('kegerator')}
                      >
                        {purchasedItems['kegerator'] ? 'Purchased!' : 'Order Now'}
                      </button>
                    </div>
  ```

  Add the speed well card immediately after it:

  ```jsx
                    <div className="win95-card">
                      <div><strong>Kegerator</strong></div>
                      <div style={{fontSize:'0.8rem'}}>Essential for serving drinks.</div>
                      <div style={{marginTop:'0.5rem'}}>Price: $1000</div>
                      <button
                        className="win95-btn"
                        disabled={cash < 1000 || dayState === 'REPORT'}
                        onClick={() => handlePurchaseSupply('kegerator')}
                      >
                        {purchasedItems['kegerator'] ? 'Purchased!' : 'Order Now'}
                      </button>
                    </div>
                    <div className="win95-card">
                      <div><strong>Speed Well</strong></div>
                      <div style={{fontSize:'0.8rem'}}>Makes cocktails. Slower than beer, but higher revenue. Cocktail demand starts in 1980.</div>
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

- [ ] **Step 2: Build check**

  ```bash
  npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/Computer.jsx
  git commit -m "feat: add speed well card to Computer supplies marketplace"
  ```

---

### Task 7: Dr. Quill warning email

**Files:**
- Modify: `src/data/emails/quill.js`

Append the `quill_cocktail` email before the final `];`. Trigger: 1979 week 9 — exactly 2 weeks (6 in-game days) before cocktail demand unlocks in 1980. The `|| time.year >= 1980` guard ensures delivery even if a save skips the exact window.

Tone: same as the bathroom warning — Quill is a bureaucrat from the future writing ahead of a known change, apologetic about the subject matter (informing someone about cocktails through temporal communication technology), precise about practical steps.

- [ ] **Step 1: Append the email**

  In `src/data/emails/quill.js`, find the final `];` and insert the new email object before it:

  ```js
    {
      id: 'quill_cocktail',
      from: 'Dr. H. Quill',
      address: 'horatio.quill@temporalcontinuity.gov',
      subject: 'Re: Upcoming Changes to Patron Beverage Preferences (1980)',
      body:
  `I am writing ahead of a change that will affect your bar beginning in 1980.

  Starting that year, some of your patrons will want cocktails.

  I want to acknowledge, before continuing, that sending a message through time to inform someone about cocktails is not the most dignified application of temporal communication technology. I have been in this role for eleven years. I have made peace with it.

  The practical information is as follows. Cocktails require a piece of equipment called a speed well — a low, stainless steel unit that sits behind the bar. Staff approach it the same way they approach the kegerator: they walk over, prepare the drink, and bring it to the patron at the bartop. The preparation takes longer. The drinks sell for more.

  You can purchase a speed well through the Bar Supplies section of your computer at any time. It costs $1,500. I recommend buying one before 1980, since demand will appear without warning and your staff will not spontaneously know how to make cocktails without the equipment present.

  Some clarifications, which I am including because I have observed what happens when I don't:

  — A speed well does not replace the kegerator. Patrons who want beer will still want beer. Patrons who want cocktails will want cocktails. Both types of patron may be present on the same evening. Both types of equipment will be in use simultaneously if your staffing supports it.

  — Cocktail demand does not appear before 1980. If you are reading this in 1979, you have some time. If you are reading this in 1980 or later, I apologise for the timing. The office runs on a fixed schedule.

  — I have researched this period. Cocktails become, as best I can describe it, culturally significant. I do not mean this as a recommendation. I mean it as context.

  I will write again if anything else changes.

  Dr. Quill`,
      trigger: ({ time, sentIds }) =>
        (time.year === 1979 && time.week >= 9 || time.year >= 1980) &&
        !sentIds.has('quill_cocktail'),
      choices: null,
    },
  ```

- [ ] **Step 2: Build check**

  ```bash
  npx vite build --mode development 2>&1 | tail -5
  ```

  Expected: `✓ built in` with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/data/emails/quill.js
  git commit -m "feat: add Dr. Quill cocktail warning email (fires 1979 week 9)"
  ```

---

### Task 8: Manual verification

No automated test framework exists. Verify end-to-end in the browser.

- [ ] **Step 1: Start dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Verify speed well appears in marketplace**

  Open the game → Computer → Market → Supplies. Confirm "Speed Well" card is visible with price $1,500 and an "Order Now" button.

- [ ] **Step 3: Verify speed well placement and staff behaviour**

  Buy a speed well. Place it on the main floor alongside a bartop and a kegerator. Hire a bartender. Start a day in year 1980+. Confirm:
  - Customers occasionally want cocktails (in addition to beer)
  - The bartender walks to the speed well (not the kegerator) to prepare cocktails
  - The bartender delivers the cocktail to the bartop
  - The patron's spend popup shows $25 (or $35 with a server)

- [ ] **Step 4: Verify multiple stations work simultaneously**

  Hire a second server. Place a second kegerator and/or a second speed well. Start a day. Confirm two staff members work independently — one at each station — without blocking each other.

- [ ] **Step 5: Verify Dr. Quill email**

  Using browser console or in-game, advance time to 1979 week 9. Confirm an email arrives from `horatio.quill@temporalcontinuity.gov` with subject `Re: Upcoming Changes to Patron Beverage Preferences (1980)`.

- [ ] **Step 6: Verify no cocktail demand before 1980**

  Start a day in 1979 (or earlier) with a speed well placed. Confirm no customers spawn with a cocktail need.

- [ ] **Step 7: Verify no regression on beer service**

  With only a kegerator (no speed well), confirm beer service works exactly as before: bartender walks to kegerator, delivers to bartop, patron gets $15 (or $20 with server).
