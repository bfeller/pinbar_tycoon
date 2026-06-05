import PF from 'pathfinding';
import { DOOR_POS, GRID_COLS, GRID_ROWS } from '../constants';
import { getPlayCell, getBackCell, getMachineCells } from '../utils/grid';
import { buildGrid, findPathInBounds } from '../utils/pathfinding';

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
  const path = findPathInBounds(new PF.AStarFinder(), fromX, fromY, targetCell.x, targetCell.y, grid);
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
    const path = findPathInBounds(finder, fromX, fromY, cell.x, cell.y, buildGrid(machines));
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

    // Initial spawn — place near the first available station machine.
    // Falls back to the door if no reachable adjacent cell exists (e.g. machine in a corner).
    if (next.x === null) {
      for (const station of SERVICE_STATIONS) {
        const mList = stationMachinesByType.get(station.type) ?? [];
        if (mList.length === 0) continue;
        const spawnMachine  = mList[0];
        const spawnPourCell = station.getPourCell(spawnMachine);
        const approach = findAdjacentApproach(DOOR_POS.x, DOOR_POS.y, spawnMachine, station.type, machines, blocked, spawnPourCell);
        if (approach) { next.x = approach.x; next.y = approach.y; break; }
      }
      if (next.x === null) { next.x = DOOR_POS.x; next.y = DOOR_POS.y; }
      staffPositions.set(id, { x: next.x, y: next.y });
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
        next.targetCustId      = null;
        next.targetBartopId    = null;
        next.targetStationType = null;
        next.targetStationId   = null;
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
          const path = findPathInBounds(new PF.AStarFinder(), next.x, next.y, backCell.x, backCell.y, buildGrid(machines));
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
