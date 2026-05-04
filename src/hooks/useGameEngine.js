import { useEffect, useRef } from 'react';
import PF from 'pathfinding';
import { DOOR_POS, DAY_LENGTH_SECONDS, GRID_COLS, GRID_ROWS } from '../constants';
import { getPlayCell, getBackCell, getMachineCells } from '../utils/grid';
import { buildGrid } from '../utils/pathfinding';

// Patience ticks before a waiting customer gives up (200ms per tick → ~6 seconds)
const PATIENCE_TICKS = 30;

/**
 * Core game simulation loop. Manages:
 * - Day timer and state transitions (BUILD → RUNNING → REPORT)
 * - Customer spawning (macro tick, 1s interval)
 * - Customer movement, needs evaluation, queuing, and bartender AI (micro tick, 200ms interval)
 * - Damage calculations and income tracking
 */
export default function useGameEngine({
  dayState, setDayState,
  dayTimer, setDayTimer,
  machines, setMachines,
  customers, setCustomers,
  cash, setCash,
  bartender, setBartender,
  dailyReport, setDailyReport,
  time
}) {
  // Refs to access current state inside setInterval closures
  const machinesRef = useRef(machines);
  const customersRef = useRef(customers);
  const cashRef = useRef(cash);
  const dayStateRef = useRef(dayState);
  const dayTimerRef = useRef(dayTimer);
  const timeRef = useRef(time);
  const bartenderRef = useRef(bartender);

  useEffect(() => { machinesRef.current = machines; }, [machines]);
  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => { cashRef.current = cash; }, [cash]);
  useEffect(() => { dayStateRef.current = dayState; }, [dayState]);
  useEffect(() => { dayTimerRef.current = dayTimer; }, [dayTimer]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { bartenderRef.current = bartender; }, [bartender]);

  // Helper: try to pathfind a customer to an available target
  const tryAssignTarget = (nextC, targetType, prev, updated) => {
    const isForPinball = targetType === 'pinball';
    const candidates = machinesRef.current.filter(m => {
      if (isForPinball) return (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0;
      return m.type === 'bartop' && m.x !== null;
    });
    const available = candidates.filter(m =>
      !prev.some(oc => oc.machineId === m.id) && !updated.some(oc => oc.machineId === m.id)
    );

    if (available.length === 0) return false;

    const target = available[Math.floor(Math.random() * available.length)];
    const grid = buildGrid(machinesRef.current);
    const playCell = getPlayCell(target.type, target.x, target.y, target.orientation);
    if (!playCell || !grid.isWalkableAt(playCell.x, playCell.y)) return false;

    const finder = new PF.AStarFinder();
    const path = finder.findPath(nextC.x, nextC.y, playCell.x, playCell.y, grid);
    if (!path || path.length === 0) return false;

    nextC.machineId = target.id;
    nextC.path = path;
    nextC.pathIndex = 0;
    nextC.status = isForPinball ? 'walking_in' : 'walking_to_bar';
    nextC.patienceTicks = undefined; // Clear patience since they found a spot
    if (isForPinball) {
      nextC.playTimeLeft = Math.floor(Math.random() * 4) + 4;
    }
    nextC.needs.shift();
    return true;
  };

  // Helper: find a walkable cell near occupied machines of a given type
  const findWaitingSpot = (nextC, targetType, prev, updated) => {
    const isForPinball = targetType === 'pinball';
    const candidates = machinesRef.current.filter(m => {
      if (isForPinball) return (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0;
      return m.type === 'bartop' && m.x !== null;
    });
    if (candidates.length === 0) return false;

    // Collect all open cells adjacent to occupied machines of this type
    const grid = buildGrid(machinesRef.current);
    const adjacentCells = new Set();
    for (const m of candidates) {
      const mCells = getMachineCells(m.type, m.x, m.y, m.orientation);
      for (const mc of mCells) {
        const neighbors = [
          { x: mc.x - 1, y: mc.y }, { x: mc.x + 1, y: mc.y },
          { x: mc.x, y: mc.y - 1 }, { x: mc.x, y: mc.y + 1 }
        ];
        for (const n of neighbors) {
          if (n.x >= 0 && n.x < GRID_COLS && n.y >= 0 && n.y < GRID_ROWS && grid.isWalkableAt(n.x, n.y)) {
            // Don't pick a spot another customer is already standing/waiting at
            const occupied = [...prev, ...updated].some(oc => oc.x === n.x && oc.y === n.y && oc.id !== nextC.id);
            if (!occupied) adjacentCells.add(`${n.x},${n.y}`);
          }
        }
      }
    }

    const spots = Array.from(adjacentCells).map(s => { const [x, y] = s.split(',').map(Number); return { x, y }; });
    if (spots.length === 0) return false;

    // Pick the closest reachable spot
    const finder = new PF.AStarFinder();
    let bestPath = null;
    for (const spot of spots) {
      if (spot.x === nextC.x && spot.y === nextC.y) {
        // Already at a good spot
        return true;
      }
      const g = buildGrid(machinesRef.current);
      const path = finder.findPath(nextC.x, nextC.y, spot.x, spot.y, g);
      if (path && path.length > 0 && (!bestPath || path.length < bestPath.length)) {
        bestPath = path;
      }
    }

    if (bestPath) {
      nextC.status = 'walking_to_wait_area';
      nextC.path = bestPath;
      nextC.pathIndex = 0;
      return true;
    }
    return false;
  };

  // Helper: make customer walk to the exit
  const sendToExit = (nextC) => {
    const grid = buildGrid(machinesRef.current);
    const finder = new PF.AStarFinder();
    const pathOut = finder.findPath(nextC.x, nextC.y, DOOR_POS.x, DOOR_POS.y, grid);
    if (pathOut && pathOut.length > 0) {
      nextC.status = 'walking_out';
      nextC.path = pathOut;
      nextC.pathIndex = 0;
      nextC.patienceTicks = undefined;
      return true;
    }
    return false; // trapped
  };

  // ──────────────────────────────────────────
  // Macro Loop: Spawning customers & day timer
  // ──────────────────────────────────────────
  useEffect(() => {
    const macroTick = setInterval(() => {
      if (dayStateRef.current === 'RUNNING') {
        const timer = dayTimerRef.current;
        setDayTimer(t => t + 1);

        if (timer < DAY_LENGTH_SECONDS) {
          const currentMachines = machinesRef.current;

          const placedPinballs = currentMachines.filter(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.y !== null && m.durability > 0);
          const placedBartops = currentMachines.filter(m => m.type === 'bartop' && m.x !== null && m.y !== null);
          const hasKegerator = currentMachines.some(m => m.type === 'kegerator' && m.x !== null && m.y !== null);

          const possibleNeeds = [];
          if (placedPinballs.length > 0) possibleNeeds.push('pinball');
          if (placedBartops.length > 0 && hasKegerator) possibleNeeds.push('drink');

          if (possibleNeeds.length > 0 && Math.random() > 0.4) {
            const needsCount = Math.floor(Math.random() * 3) + 1;
            const needs = [];
            for (let i = 0; i < needsCount; i++) {
              needs.push(possibleNeeds[Math.floor(Math.random() * possibleNeeds.length)]);
            }

            setCustomers(prev => [...prev, {
              id: 'cust-' + Date.now() + Math.random(),
              machineId: null,
              path: [],
              pathIndex: 0,
              status: 'evaluating_needs',
              x: DOOR_POS.x,
              y: DOOR_POS.y,
              needs,
              playTimeLeft: 0,
              patienceTicks: undefined
            }]);
          }
        } else {
          // Day timer expired — wait for all customers to leave
          if (customersRef.current.length === 0) {
            setDayState('REPORT');
          }
        }
      }
    }, 1000);
    return () => clearInterval(macroTick);
  }, []);

  // ──────────────────────────────────────────
  // Micro Loop: Movement, needs, bartender AI
  // ──────────────────────────────────────────
  useEffect(() => {
    const moveTick = setInterval(() => {
      if (dayStateRef.current !== 'RUNNING') return;

      setCustomers(prev => {
        let moneyEarned = 0;
        const machinesToDegrade = [];
        const updated = [];

        for (const c of prev) {
          const nextC = { ...c, needs: [...(c.needs || [])] };

          if (c.status === 'evaluating_needs') {
            if (nextC.needs.length === 0) {
              // All needs met — walk to door
              if (!sendToExit(nextC)) continue; // trapped — teleport out
            } else {
              const need = nextC.needs[0];
              const targetType = need === 'pinball' ? 'pinball' : 'bartop';
              const assigned = tryAssignTarget(nextC, targetType, prev, updated);
              if (!assigned) {
                // Nothing available — walk towards machines to wait nearby
                const waitType = need === 'pinball' ? 'pinball' : 'bartop';
                nextC.waitingFor = waitType;
                if (nextC.patienceTicks === undefined) {
                  nextC.patienceTicks = PATIENCE_TICKS;
                }
                const foundSpot = findWaitingSpot(nextC, waitType, prev, updated);
                if (!foundSpot) {
                  // Can't even get near — just wait in place
                  nextC.status = need === 'pinball' ? 'waiting_for_pinball' : 'waiting_for_bartop';
                }
              }
            }

          } else if (c.status === 'walking_to_wait_area') {
            // Walk towards the waiting area near machines
            if (c.pathIndex < c.path.length - 1) {
              nextC.pathIndex++;
              nextC.x = c.path[nextC.pathIndex][0];
              nextC.y = c.path[nextC.pathIndex][1];
            } else {
              // Arrived at waiting spot — start waiting
              const waitType = nextC.waitingFor || 'pinball';
              nextC.status = waitType === 'pinball' ? 'waiting_for_pinball' : 'waiting_for_bartop';
            }
            // While walking, also check if a spot opened up
            const walkWaitType = nextC.waitingFor || 'pinball';
            const earlyAssign = tryAssignTarget(nextC, walkWaitType, prev, updated);
            if (earlyAssign) {
              // Grabbed a spot while walking — great!
            }

          } else if (c.status === 'waiting_for_pinball' || c.status === 'waiting_for_bartop') {
            // Decrement patience
            if (nextC.patienceTicks !== undefined) {
              nextC.patienceTicks--;
            }

            if (nextC.patienceTicks <= 0) {
              // Out of patience — skip this need
              nextC.needs.shift();
              nextC.patienceTicks = undefined;
              nextC.waitingFor = undefined;
              if (nextC.needs.length === 0) {
                // No more needs — leave
                if (!sendToExit(nextC)) continue;
              } else {
                // Try evaluating the next need
                nextC.status = 'evaluating_needs';
              }
            } else {
              // Still patient — try to find a spot again
              const targetType = c.status === 'waiting_for_pinball' ? 'pinball' : 'bartop';
              const assigned = tryAssignTarget(nextC, targetType, prev, updated);
              if (assigned) {
                // Great — they found a spot, patience is cleared inside tryAssignTarget
              }
              // Otherwise stay waiting
            }

          } else if (c.status === 'walking_in' || c.status === 'walking_to_bar') {
            if (c.pathIndex < c.path.length - 1) {
              nextC.pathIndex++;
              nextC.x = c.path[nextC.pathIndex][0];
              nextC.y = c.path[nextC.pathIndex][1];
            } else {
              nextC.status = c.status === 'walking_in' ? 'playing' : 'waiting_for_drink';
            }
          } else if (c.status === 'playing') {
            if (nextC.playTicks === undefined) nextC.playTicks = nextC.playTimeLeft * 5;
            if (nextC.playTicks > 0) {
              nextC.playTicks--;
            } else {
              moneyEarned += 25;
              machinesToDegrade.push(c.machineId);
              nextC.machineId = null;
              nextC.playTicks = undefined;
              nextC.status = 'evaluating_needs';
            }
          } else if (c.status === 'waiting_for_drink') {
            // Idle — waiting for bartender to serve
          } else if (c.status === 'drinking') {
            if (nextC.playTicks === undefined) nextC.playTicks = 15;
            if (nextC.playTicks > 0) {
              nextC.playTicks--;
            } else {
              moneyEarned += 15;
              nextC.machineId = null;
              nextC.playTicks = undefined;
              nextC.status = 'evaluating_needs';
            }
          } else if (c.status === 'walking_out') {
            if (c.pathIndex < c.path.length - 1) {
              nextC.pathIndex++;
              nextC.x = c.path[nextC.pathIndex][0];
              nextC.y = c.path[nextC.pathIndex][1];
            } else {
              continue; // Reached door — remove
            }
          }
          updated.push(nextC);
        }

        // ── Bartender AI ──
        const nextB = { ...bartenderRef.current };
        const hasKeg = machinesRef.current.some(m => m.type === 'kegerator' && m.x !== null);
        const hasBartop = machinesRef.current.some(m => m.type === 'bartop' && m.x !== null);

        if (hasKeg && hasBartop) {
          if (nextB.x === null) {
            const keg = machinesRef.current.find(m => m.type === 'kegerator' && m.x !== null);
            if (keg) { nextB.x = keg.x; nextB.y = keg.y; }
          } else {
            if (nextB.status === 'idle') {
              const waitingCust = updated.find(c => c.status === 'waiting_for_drink' && !c.beingServed);
              if (waitingCust) {
                waitingCust.beingServed = true;
                nextB.status = 'walking_to_kegerator';
                nextB.targetCustId = waitingCust.id;
                nextB.targetBartopId = waitingCust.machineId;

                const keg = machinesRef.current.find(m => m.type === 'kegerator' && m.x !== null);
                const grid = buildGrid(machinesRef.current);
                grid.setWalkableAt(keg.x, keg.y, true); // Bartender can walk on keg
                const finder = new PF.AStarFinder();
                const path = finder.findPath(nextB.x, nextB.y, keg.x, keg.y, grid);
                if (path && path.length > 0) {
                  nextB.path = path;
                  nextB.pathIndex = 0;
                } else {
                  nextB.status = 'idle';
                  waitingCust.beingServed = false;
                }
              }
            } else if (nextB.status === 'walking_to_kegerator') {
              if (nextB.pathIndex < nextB.path.length - 1) {
                nextB.pathIndex++;
                nextB.x = nextB.path[nextB.pathIndex][0];
                nextB.y = nextB.path[nextB.pathIndex][1];
              } else {
                nextB.status = 'pouring';
                nextB.timer = 5;
              }
            } else if (nextB.status === 'pouring') {
              nextB.timer--;
              if (nextB.timer <= 0) {
                nextB.status = 'walking_to_bartop';
                const bartop = machinesRef.current.find(m => m.id === nextB.targetBartopId);
                if (bartop) {
                  const backCell = getBackCell(bartop.type, bartop.x, bartop.y, bartop.orientation);
                  const grid = buildGrid(machinesRef.current);
                  if (backCell) {
                    const finder = new PF.AStarFinder();
                    const path = finder.findPath(nextB.x, nextB.y, backCell.x, backCell.y, grid);
                    if (path && path.length > 0) {
                      nextB.path = path;
                      nextB.pathIndex = 0;
                    } else { nextB.status = 'idle'; }
                  } else { nextB.status = 'idle'; }
                } else { nextB.status = 'idle'; }
              }
            } else if (nextB.status === 'walking_to_bartop') {
              if (nextB.pathIndex < nextB.path.length - 1) {
                nextB.pathIndex++;
                nextB.x = nextB.path[nextB.pathIndex][0];
                nextB.y = nextB.path[nextB.pathIndex][1];
              } else {
                nextB.status = 'serving';
                nextB.timer = 3;
              }
            } else if (nextB.status === 'serving') {
              nextB.timer--;
              if (nextB.timer <= 0) {
                const cust = updated.find(c => c.id === nextB.targetCustId);
                if (cust) {
                  cust.status = 'drinking';
                  cust.beingServed = false;
                }
                nextB.status = 'idle';
                nextB.targetCustId = null;
                nextB.targetBartopId = null;
              }
            }
          }
          setBartender(nextB);
        }

        // ── Income & damage processing ──
        if (moneyEarned > 0) {
          setCash(c => c + moneyEarned);
          setDailyReport(r => ({ ...r, income: r.income + moneyEarned }));
        }

        if (machinesToDegrade.length > 0) {
          const damageEvents = [];
          for (const mId of machinesToDegrade) {
            const machine = machinesRef.current.find(m => m.id === mId);
            if (!machine) continue;

            const age = Math.max(0, timeRef.current.year - machine.year);
            const damageChance = Math.min(0.60, 0.20 + (age * 0.02));

            if (Math.random() < damageChance) {
              const amount = Math.floor(Math.random() * 5) + 1;
              damageEvents.push({ id: mId, amount });
            }
          }

          if (damageEvents.length > 0) {
            setMachines(currentMachines => {
              const newMachines = currentMachines.map(m => {
                const event = damageEvents.find(d => d.id === m.id);
                if (event) {
                  return { ...m, durability: Math.max(0, m.durability - event.amount) };
                }
                return m;
              });

              setDailyReport(r => {
                const newDamageMap = new Map(r.damage.map(d => [d.id, d]));
                for (const event of damageEvents) {
                  const m = currentMachines.find(mac => mac.id === event.id);
                  const newM = newMachines.find(mac => mac.id === event.id);
                  if (m && newM) {
                    if (newDamageMap.has(event.id)) {
                      const existing = newDamageMap.get(event.id);
                      existing.damageTaken += event.amount;
                      existing.currentDurability = newM.durability;
                    } else {
                      newDamageMap.set(event.id, {
                        id: event.id,
                        name: m.name,
                        damageTaken: event.amount,
                        currentDurability: newM.durability
                      });
                    }
                  }
                }
                return { ...r, damage: Array.from(newDamageMap.values()) };
              });

              return newMachines;
            });
          }
        }

        return updated;
      });
    }, 200);
    return () => clearInterval(moveTick);
  }, []);
}
