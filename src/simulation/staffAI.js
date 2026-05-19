import PF from 'pathfinding';
import { DOOR_POS, GRID_COLS, GRID_ROWS } from '../constants';
import { getPlayCell, getBackCell, getMachineCells } from '../utils/grid';
import { buildGrid } from '../utils/pathfinding';

// ── Service station definitions ──────────────────────────────────────────────
// Each entry describes one type of drink-dispensing equipment.
// Staff use the same state machine for all stations — to add a speed well (or
// any future bar equipment), append a new entry here.
//
// Fields:
//   type          — machine type string (matches machine.type in state)
//   waitStatus    — customer status that signals they need this station's service
//   getPourCell   — (machine) → { x, y } cell staff walk to for the fill step
//   pourTime      — (upgradeValues) → ticks to fill a drink
//   serveTime     — (upgradeValues) → ticks to hand the drink to the customer
const SERVICE_STATIONS = [
  {
    type: 'kegerator',
    waitStatus: 'waiting_for_drink',
    getPourCell: (machine) => getPlayCell('kegerator', machine.x, machine.y, machine.orientation),
    pourTime:  (uv) => Math.max(1, Math.round(5 / (uv.bartenderSpeed ?? 1))),
    serveTime: (uv) => Math.max(1, Math.round(3 / (uv.bartenderSpeed ?? 1))),
  },
];

// Walk to a specific cell. Returns { path, x, y } or null if unreachable/blocked.
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

// Walk to any walkable adjacent cell around a machine, excluding one specific cell
// (used for idle positioning — staff park near the kegerator but not on the pour spot).
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

/**
 * Advance all staff entities by one micro-tick (200ms).
 *
 * Mutates `updatedCustomers` in-place: marks beingServed, transitions customer
 * from 'waiting_for_drink' → 'drinking' when service completes.
 *
 * @returns {{ nextBartender, nextServers }}
 */
export function tickStaff(bartender, servers, updatedCustomers, { machines, upgradeValues }) {
  // Resolve the active service station (first available kegerator for now)
  const station = SERVICE_STATIONS[0];
  const stationMachine = machines.find(m => m.type === station.type && m.x !== null) ?? null;
  const pourCell = stationMachine ? station.getPourCell(stationMachine) : null;
  const hasDeliveryTarget = machines.some(m => m.type === 'bartop' && m.x !== null);

  const staffUnits = [
    { id: bartender?.id ?? 'bartender', entity: bartender },
    ...servers.map(s => ({ id: s.id, entity: s })),
  ];

  // Only one staff member may occupy the pour spot at a time
  let lockId = staffUnits.find(({ entity }) =>
    entity && (entity.status === 'walking_to_kegerator' || entity.status === 'pouring')
  )?.id ?? null;

  const staffPositions = new Map();
  const nextStaffEntities = [];

  const releaseCustomer = (custId) => {
    if (!custId) return;
    const cust = updatedCustomers.find(c => c.id === custId && c.status === 'waiting_for_drink');
    if (cust) cust.beingServed = false;
  };

  for (const { id, entity } of staffUnits) {
    // No station available — staff idles off-screen
    if (!entity || !stationMachine || !pourCell || !hasDeliveryTarget) {
      nextStaffEntities.push(entity);
      continue;
    }

    const blocked = new Set(
      [...staffPositions.entries()]
        .filter(([otherId]) => otherId !== id)
        .map(([, pos]) => `${pos.x},${pos.y}`)
    );

    const next = { ...entity };
    // Reset transient 'waiting_at_kegerator' to queued so the loop below handles it
    if (next.status === 'waiting_at_kegerator') next.status = 'queued_for_kegerator';

    // Initial spawn — place staff near the station
    if (next.x === null) {
      const approach = findAdjacentApproach(DOOR_POS.x, DOOR_POS.y, stationMachine, station.type, machines, blocked, pourCell);
      if (approach) { next.x = approach.x; next.y = approach.y; }
      if (next.x !== null) staffPositions.set(id, { x: next.x, y: next.y });
      nextStaffEntities.push(next);
      continue;
    }

    // Drop stale job if their customer left / gave up
    if (next.targetCustId) {
      const stillWaiting = updatedCustomers.some(c => c.id === next.targetCustId && c.status === 'waiting_for_drink');
      if (!stillWaiting) {
        if (lockId === id) lockId = null;
        next.targetCustId = null;
        next.targetBartopId = null;
        next.status = 'idle';
      }
    }

    // ── State machine ────────────────────────────────────────────────────────

    if (next.status === 'idle') {
      const waitingCust = updatedCustomers.find(c => c.status === station.waitStatus && !c.beingServed);
      if (waitingCust) {
        waitingCust.beingServed = true;
        next.targetCustId = waitingCust.id;
        next.targetBartopId = waitingCust.machineId;
        next.status = 'queued_for_kegerator';
      }
    }

    if (next.status === 'queued_for_kegerator' && next.targetCustId) {
      if (!lockId || lockId === id) {
        lockId = id;
        const approach = findDirectApproach(next.x, next.y, pourCell, machines, blocked);
        if (approach) {
          next.status = 'walking_to_kegerator';
          next.path = approach.path;
          next.pathIndex = 0;
        } else if (lockId === id) {
          lockId = null; // couldn't secure route — release lock so others can try
        }
      }

    } else if (next.status === 'walking_to_kegerator') {
      if (lockId !== id) {
        // Lost the lock to another staff member — give up this job
        releaseCustomer(next.targetCustId);
        next.targetCustId = null;
        next.targetBartopId = null;
        next.status = 'idle';
      } else if (next.pathIndex < next.path.length - 1) {
        next.pathIndex++;
        next.x = next.path[next.pathIndex][0];
        next.y = next.path[next.pathIndex][1];
      } else if (next.x === pourCell.x && next.y === pourCell.y) {
        next.status = 'pouring';
        next.timer = station.pourTime(upgradeValues);
        next.timerMax = next.timer;
      } else {
        // Arrived at end of path but not at pour cell — re-pathfind
        const approach = findDirectApproach(next.x, next.y, pourCell, machines, blocked);
        if (approach) {
          next.path = approach.path;
          next.pathIndex = 0;
        } else {
          if (lockId === id) lockId = null;
          next.status = 'queued_for_kegerator';
        }
      }

    } else if (next.status === 'pouring') {
      if (lockId !== id) lockId = id; // re-assert lock while pouring
      next.timer--;
      if (next.timer <= 0) {
        if (lockId === id) lockId = null;
        next.status = 'walking_to_bartop';
        const bartop = machines.find(m => m.id === next.targetBartopId);
        const backCell = bartop ? getBackCell(bartop.type, bartop.x, bartop.y, bartop.orientation) : null;
        if (backCell) {
          const path = new PF.AStarFinder().findPath(next.x, next.y, backCell.x, backCell.y, buildGrid(machines));
          if (path && path.length > 0) {
            next.path = path;
            next.pathIndex = 0;
          } else {
            releaseCustomer(next.targetCustId);
            next.targetCustId = null;
            next.targetBartopId = null;
            next.status = 'idle';
          }
        } else {
          releaseCustomer(next.targetCustId);
          next.targetCustId = null;
          next.targetBartopId = null;
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
        next.timer = station.serveTime(upgradeValues);
        next.timerMax = next.timer;
      }

    } else if (next.status === 'serving') {
      next.timer--;
      if (next.timer <= 0) {
        const cust = updatedCustomers.find(c => c.id === next.targetCustId && c.status === 'waiting_for_drink');
        if (cust) { cust.status = 'drinking'; cust.beingServed = false; }
        next.status = 'idle';
        next.targetCustId = null;
        next.targetBartopId = null;
      }
    }

    if (next.x !== null) staffPositions.set(id, { x: next.x, y: next.y });
    nextStaffEntities.push(next);
  }

  return {
    nextBartender: nextStaffEntities[0] ?? bartender,
    nextServers: nextStaffEntities.slice(1),
  };
}
