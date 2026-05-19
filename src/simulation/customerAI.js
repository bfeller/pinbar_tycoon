import PF from 'pathfinding';
import { DOOR_POS, DAY_LENGTH_SECONDS, GRID_COLS, GRID_ROWS } from '../constants';
import { getPlayCell, getMachineCells } from '../utils/grid';
import { buildGrid } from '../utils/pathfinding';
import { maybeQueueBathroomAfterDrink } from '../utils/patronNeeds';

const PATIENCE_TICKS = 30;        // ticks before a queued customer gives up (~6s at 200ms)
const DRINK_PATIENCE_TICKS = 75;  // ticks while seated waiting for service (~15s)
const BATHROOM_USE_TICKS = 20;    // ticks spent inside bathroom (~4s)

const LOG_MAX = Math.log1p(1200); // normalise locationCount against ~peak observed value

function popularityWeight(machine) {
  return 1 + 2 * (Math.log1p(machine.locationCount ?? 0) / LOG_MAX);
  // range: 1.0 (unknown machine) → 3.0 (most popular)
}

function weightedRandomMachine(machines) {
  const weights = machines.map(popularityWeight);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < machines.length; i++) {
    r -= weights[i];
    if (r <= 0) return machines[i];
  }
  return machines[machines.length - 1];
}

function tryAssignTarget(nextC, targetType, prev, updated, machines) {
  const isForPinball  = targetType === 'pinball';
  const isForBathroom = targetType === 'bathroom';

  const candidates = machines.filter(m => {
    if (isForPinball)  return (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0;
    if (isForBathroom) return m.type === 'bathroom' && m.x !== null && (m.room === 'main' || !m.room);
    return m.type === 'bartop' && m.x !== null;
  });
  const available = candidates.filter(m =>
    !prev.some(oc => oc.machineId === m.id) && !updated.some(oc => oc.machineId === m.id)
  );
  if (available.length === 0) return false;

  const target = isForPinball
    ? weightedRandomMachine(available)
    : available[Math.floor(Math.random() * available.length)];

  const grid = buildGrid(machines);

  // Bathroom: entry is the cell directly below the bottom-left tile (matches BathroomSVG door)
  if (isForBathroom) {
    const entryX = target.x;
    const entryY = target.y + 2;
    if (entryX < 0 || entryX >= GRID_COLS || entryY < 0 || entryY >= GRID_ROWS) return false;
    if (!grid.isWalkableAt(entryX, entryY)) return false;
    const finder = new PF.AStarFinder();
    const path = finder.findPath(nextC.x, nextC.y, entryX, entryY, grid.clone());
    if (!path || path.length === 0) return false;
    nextC.machineId = target.id;
    nextC.path = path;
    nextC.pathIndex = 0;
    nextC.status = 'walking_to_bathroom';
    nextC.patienceTicks = undefined;
    nextC.needs.shift();
    return true;
  }

  const playCell = getPlayCell(target.type, target.x, target.y, target.orientation);
  if (!playCell || !grid.isWalkableAt(playCell.x, playCell.y)) return false;

  const finder = new PF.AStarFinder();
  const path = finder.findPath(nextC.x, nextC.y, playCell.x, playCell.y, grid);
  if (!path || path.length === 0) return false;

  nextC.machineId = target.id;
  nextC.path = path;
  nextC.pathIndex = 0;
  nextC.status = isForPinball ? 'walking_in' : 'walking_to_bar';
  nextC.patienceTicks = undefined;
  if (isForPinball) nextC.playTimeLeft = Math.floor(Math.random() * 4) + 4;
  nextC.needs.shift();
  return true;
}

function findWaitingSpot(nextC, targetType, prev, updated, machines) {
  const isForPinball = targetType === 'pinball';
  const candidates = machines.filter(m => {
    if (isForPinball) return (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0;
    return m.type === targetType && m.x !== null;
  });
  if (candidates.length === 0) return false;

  const grid = buildGrid(machines);
  const adjacentCells = new Set();
  for (const m of candidates) {
    for (const mc of getMachineCells(m.type, m.x, m.y, m.orientation)) {
      for (const n of [
        { x: mc.x - 1, y: mc.y }, { x: mc.x + 1, y: mc.y },
        { x: mc.x, y: mc.y - 1 }, { x: mc.x, y: mc.y + 1 },
      ]) {
        if (n.x >= 0 && n.x < GRID_COLS && n.y >= 0 && n.y < GRID_ROWS && grid.isWalkableAt(n.x, n.y)) {
          const occupied = [...prev, ...updated].some(oc => oc.x === n.x && oc.y === n.y && oc.id !== nextC.id);
          if (!occupied) adjacentCells.add(`${n.x},${n.y}`);
        }
      }
    }
  }

  const spots = Array.from(adjacentCells).map(s => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
  });
  if (spots.length === 0) return false;

  const finder = new PF.AStarFinder();
  let bestPath = null;
  for (const spot of spots) {
    if (spot.x === nextC.x && spot.y === nextC.y) return true; // already at a good spot
    const path = finder.findPath(nextC.x, nextC.y, spot.x, spot.y, buildGrid(machines));
    if (path && path.length > 0 && (!bestPath || path.length < bestPath.length)) bestPath = path;
  }

  if (bestPath) {
    nextC.status = 'walking_to_wait_area';
    nextC.path = bestPath;
    nextC.pathIndex = 0;
    return true;
  }
  return false;
}

function sendToExit(nextC, machines) {
  const grid = buildGrid(machines);
  const finder = new PF.AStarFinder();
  const path = finder.findPath(nextC.x, nextC.y, DOOR_POS.x, DOOR_POS.y, grid);
  if (!path || path.length === 0) return false;
  nextC.status = 'walking_out';
  nextC.path = path;
  nextC.pathIndex = 0;
  nextC.patienceTicks = undefined;
  return true;
}

/**
 * Advance all customers by one micro-tick (200ms).
 *
 * @param {Array} prev  Current customer array (from setState)
 * @param {Object} ctx
 *   machines       — current placed machines
 *   dayTimer       — seconds elapsed in current day
 *   upgradeValues  — active upgrade effects
 *   time           — { year, week, day }
 *   onCustomerSpend — spend callback
 *
 * @returns {{ next, moneyEarned, satisfiedCount, unsatisfiedCount,
 *             unsatisfiedReasons, machinesToDegrade, forgivenCount }}
 */
export function tickCustomers(prev, { machines, dayTimer, upgradeValues, time, onCustomerSpend }) {
  let moneyEarned = 0;
  let satisfiedCount = 0;
  let unsatisfiedCount = 0;
  const unsatisfiedReasons = {};
  const machinesToDegrade = [];
  const updated = [];

  const tryForgive = (nextC) => {
    const charmLevel = upgradeValues.charm ?? 0;
    if (charmLevel > 0 && (nextC.satisfiedNeeds ?? 0) >= 1 && (nextC.forgivenUnsatisfied ?? 0) < charmLevel) {
      nextC.forgivenUnsatisfied = (nextC.forgivenUnsatisfied ?? 0) + 1;
      return true;
    }
    return false;
  };

  for (const c of prev) {
    const nextC = { ...c, needs: [...(c.needs || [])] };

    if (c.status === 'evaluating_needs') {
      if (nextC.needs.length === 0) {
        if (!sendToExit(nextC, machines)) continue;

      } else if (dayTimer >= DAY_LENGTH_SECONDS) {
        // Bar closed — customer leaves angry, marking unmet needs
        for (const n of nextC.needs) {
          if (!tryForgive(nextC)) {
            unsatisfiedCount++;
            const key = n === 'pinball' ? 'bar_closed_pinball' : n === 'drink' ? 'bar_closed_drink' : 'bar_closed_bathroom';
            unsatisfiedReasons[key] = (unsatisfiedReasons[key] ?? 0) + 1;
          }
        }
        nextC.needs = [];
        nextC.angry = true;
        if (!sendToExit(nextC, machines)) continue;

      } else {
        const need = nextC.needs[0];
        const targetType = need === 'pinball' ? 'pinball' : need === 'bathroom' ? 'bathroom' : 'bartop';

        if (need === 'bathroom') {
          const hasBathroom = machines.some(m => m.type === 'bathroom' && m.x !== null && (m.room === 'main' || !m.room));
          if (!hasBathroom) {
            if (!tryForgive(nextC)) {
              unsatisfiedCount++;
              unsatisfiedReasons.no_bathroom = (unsatisfiedReasons.no_bathroom ?? 0) + 1;
            }
            nextC.needs.shift();
            nextC.bathroomQueued = true;
            if (nextC.needs.length === 0) {
              nextC.angry = true;
              if (!sendToExit(nextC, machines)) continue;
            } else {
              nextC.status = 'evaluating_needs';
            }
            updated.push(nextC);
            continue;
          }
        }

        const assigned = tryAssignTarget(nextC, targetType, prev, updated, machines);
        if (!assigned) {
          nextC.waitingFor = targetType;
          if (nextC.patienceTicks === undefined) {
            nextC.patienceTicks = upgradeValues.patienceTicks ?? PATIENCE_TICKS;
          }
          if (!findWaitingSpot(nextC, targetType, prev, updated, machines)) {
            nextC.status = need === 'pinball' ? 'waiting_for_pinball'
              : need === 'bathroom' ? 'waiting_for_bathroom'
              : 'waiting_for_bartop';
          }
        }
      }

    } else if (c.status === 'walking_to_wait_area') {
      if (c.pathIndex < c.path.length - 1) {
        nextC.pathIndex++;
        nextC.x = c.path[nextC.pathIndex][0];
        nextC.y = c.path[nextC.pathIndex][1];
      } else {
        const waitType = nextC.waitingFor || 'pinball';
        nextC.status = waitType === 'pinball' ? 'waiting_for_pinball'
          : waitType === 'bathroom' ? 'waiting_for_bathroom'
          : 'waiting_for_bartop';
      }
      // Try to grab a spot opportunistically while walking
      tryAssignTarget(nextC, nextC.waitingFor || 'pinball', prev, updated, machines);

    } else if (
      c.status === 'waiting_for_pinball' ||
      c.status === 'waiting_for_bartop' ||
      c.status === 'waiting_for_bathroom'
    ) {
      if (nextC.patienceTicks !== undefined) nextC.patienceTicks--;

      if (nextC.patienceTicks <= 0) {
        if (!tryForgive(nextC)) {
          unsatisfiedCount++;
          const reason = c.status === 'waiting_for_pinball' ? 'patience_pinball'
            : c.status === 'waiting_for_bathroom' ? 'patience_bathroom'
            : 'patience_bartop';
          unsatisfiedReasons[reason] = (unsatisfiedReasons[reason] ?? 0) + 1;
        }
        nextC.needs.shift();
        nextC.patienceTicks = undefined;
        nextC.waitingFor = undefined;
        if (nextC.needs.length === 0) {
          nextC.angry = true;
          if (!sendToExit(nextC, machines)) continue;
        } else {
          nextC.status = 'evaluating_needs';
        }
      } else {
        const targetType = c.status === 'waiting_for_pinball' ? 'pinball'
          : c.status === 'waiting_for_bathroom' ? 'bathroom'
          : 'bartop';
        tryAssignTarget(nextC, targetType, prev, updated, machines);
      }

    } else if (
      c.status === 'walking_in' ||
      c.status === 'walking_to_bar' ||
      c.status === 'walking_to_bathroom'
    ) {
      if (c.pathIndex < c.path.length - 1) {
        nextC.pathIndex++;
        nextC.x = c.path[nextC.pathIndex][0];
        nextC.y = c.path[nextC.pathIndex][1];
      } else if (c.status === 'walking_to_bar') {
        nextC.status = 'waiting_for_drink';
        nextC.drinkPatienceTicks = Math.round(DRINK_PATIENCE_TICKS * (upgradeValues.drinkPatienceMult ?? 1));
      } else if (c.status === 'walking_to_bathroom') {
        const bath = machines.find(m => m.id === nextC.machineId);
        if (bath) { nextC.x = bath.x + 1; nextC.y = bath.y; }
        nextC.status = 'using_bathroom';
        nextC.bathroomTicks = BATHROOM_USE_TICKS;
      } else {
        nextC.status = 'playing';
      }

    } else if (c.status === 'playing') {
      if (nextC.playTicks === undefined) nextC.playTicks = nextC.playTimeLeft * 5;
      if (nextC.playTicks > 0) {
        nextC.playTicks--;
      } else {
        moneyEarned += 25;
        onCustomerSpend?.({ x: nextC.x, y: nextC.y, amount: 25 });
        satisfiedCount++;
        nextC.satisfiedNeeds = (nextC.satisfiedNeeds ?? 0) + 1;
        machinesToDegrade.push(c.machineId);
        nextC.machineId = null;
        nextC.playTicks = undefined;
        nextC.status = 'evaluating_needs';
      }

    } else if (c.status === 'waiting_for_drink') {
      if (nextC.drinkPatienceTicks > 0) nextC.drinkPatienceTicks--;
      if (nextC.drinkPatienceTicks <= 0) {
        if (!tryForgive(nextC)) {
          unsatisfiedCount++;
          unsatisfiedReasons.drink_wait = (unsatisfiedReasons.drink_wait ?? 0) + 1;
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

    } else if (c.status === 'drinking') {
      if (nextC.playTicks === undefined) nextC.playTicks = 15;
      if (nextC.playTicks > 0) {
        nextC.playTicks--;
      } else {
        const drinkAmount = upgradeValues.drinkRevenue ?? 15;
        moneyEarned += drinkAmount;
        onCustomerSpend?.({ x: nextC.x, y: nextC.y, amount: drinkAmount });
        satisfiedCount++;
        nextC.satisfiedNeeds = (nextC.satisfiedNeeds ?? 0) + 1;
        nextC.machineId = null;
        nextC.playTicks = undefined;
        const hasBathroom = machines.some(m => m.type === 'bathroom' && m.x !== null && (m.room === 'main' || !m.room));
        const afterDrink = maybeQueueBathroomAfterDrink(nextC, { year: time.year, hasBathroom });
        nextC.needs = afterDrink.needs;
        nextC.drinksHad = afterDrink.drinksHad;
        nextC.bathroomQueued = afterDrink.bathroomQueued;
        nextC.status = 'evaluating_needs';
      }

    } else if (c.status === 'using_bathroom') {
      if (nextC.bathroomTicks > 0) {
        nextC.bathroomTicks--;
      } else {
        satisfiedCount++;
        nextC.satisfiedNeeds = (nextC.satisfiedNeeds ?? 0) + 1;
        // Teleport back to bathroom door cell
        const bath = machines.find(m => m.id === nextC.machineId);
        if (bath) { nextC.x = bath.x; nextC.y = bath.y + 2; }
        nextC.machineId = null;
        nextC.bathroomTicks = undefined;
        nextC.bathroomQueued = true;
        nextC.status = 'evaluating_needs';
      }

    } else if (c.status === 'walking_out') {
      if (c.pathIndex < c.path.length - 1) {
        nextC.pathIndex++;
        nextC.x = c.path[nextC.pathIndex][0];
        nextC.y = c.path[nextC.pathIndex][1];
      } else {
        continue; // reached door — remove from array
      }
    }

    updated.push(nextC);
  }

  const forgivenDelta =
    updated.reduce((s, c) => s + (c.forgivenUnsatisfied ?? 0), 0) -
    prev.reduce((s, c) => s + (c.forgivenUnsatisfied ?? 0), 0);

  return {
    next: updated,
    moneyEarned,
    satisfiedCount,
    unsatisfiedCount,
    unsatisfiedReasons,
    machinesToDegrade,
    forgivenCount: Math.max(0, forgivenDelta),
  };
}
