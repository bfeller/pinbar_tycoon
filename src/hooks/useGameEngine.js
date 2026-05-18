import { useEffect, useRef } from 'react';
import PF from 'pathfinding';
import { DOOR_POS, DAY_LENGTH_SECONDS, GRID_COLS, GRID_ROWS } from '../constants';
import { getPlayCell, getBackCell, getMachineCells } from '../utils/grid';
import { buildGrid } from '../utils/pathfinding';
import { EVENT_DEFS } from '../data/events';

function toLinDay({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}

// Patience ticks before a waiting customer gives up (200ms per tick → ~6 seconds)
const PATIENCE_TICKS = 30;
// Drink patience is longer — the customer has a seat, they're just waiting for service (~15 seconds)
const DRINK_PATIENCE_TICKS = 75;
// How long a customer spends using the bathroom (~4 seconds)
const BATHROOM_USE_TICKS = 20;

// Popularity helpers — locationCount is the number of real-world venues with this machine.
// log scale so the curve is gentle: a machine at 0 locations still earns something,
// and the gap between 100 and 1000 locations isn't absurd.
const LOG_MAX = Math.log1p(1200); // normalise against ~peak observed count

function popularityWeight(machine) {
  return 1 + 2 * (Math.log1p(machine.locationCount ?? 0) / LOG_MAX);
  // range: 1.0 (unknown) → 3.0 (most popular)
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
  servers = [], setServers,
  dailyReport, setDailyReport,
  time,
  popularity,
  upgradeValues = {},
  onEvent,
}) {
  // Refs to access current state inside setInterval closures
  const machinesRef = useRef(machines);
  const customersRef = useRef(customers);
  const cashRef = useRef(cash);
  const dayStateRef = useRef(dayState);
  const dayTimerRef = useRef(dayTimer);
  const timeRef = useRef(time);
  const bartenderRef = useRef(bartender);
  const serversRef = useRef(servers);
  const upgradeValuesRef = useRef(upgradeValues);
  const popularityRef = useRef(popularity);
  const onEventRef = useRef(onEvent);
  const lastEventDayRef = useRef(-1); // lin-day of last event, prevents >1 per day

  useEffect(() => { machinesRef.current = machines; }, [machines]);
  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => { cashRef.current = cash; }, [cash]);
  useEffect(() => { dayStateRef.current = dayState; }, [dayState]);
  useEffect(() => { dayTimerRef.current = dayTimer; }, [dayTimer]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { bartenderRef.current = bartender; }, [bartender]);
  useEffect(() => { serversRef.current = servers; }, [servers]);
  useEffect(() => { upgradeValuesRef.current = upgradeValues; }, [upgradeValues]);
  useEffect(() => { popularityRef.current = popularity; }, [popularity]);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  // Helper: try to pathfind a customer to an available target
  const tryAssignTarget = (nextC, targetType, prev, updated) => {
    const isForPinball = targetType === 'pinball';
    const isForBathroom = targetType === 'bathroom';
    const candidates = machinesRef.current.filter(m => {
      if (isForPinball) return (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0;
      if (isForBathroom) return m.type === 'bathroom' && m.x !== null && (m.room === 'main' || !m.room);
      return m.type === 'bartop' && m.x !== null;
    });
    const available = candidates.filter(m =>
      !prev.some(oc => oc.machineId === m.id) && !updated.some(oc => oc.machineId === m.id)
    );

    if (available.length === 0) return false;

    const target = isForPinball ? weightedRandomMachine(available) : available[Math.floor(Math.random() * available.length)];
    const grid = buildGrid(machinesRef.current);

    // Bathrooms are 2×2 — find any adjacent walkable cell as the entry point
    if (isForBathroom) {
      const bathCells = getMachineCells('bathroom', target.x, target.y, 'N');
      const adjKeys = new Set();
      for (const bc of bathCells) {
        for (const n of [{x:bc.x-1,y:bc.y},{x:bc.x+1,y:bc.y},{x:bc.x,y:bc.y-1},{x:bc.x,y:bc.y+1}]) {
          if (!bathCells.some(c => c.x===n.x && c.y===n.y)) adjKeys.add(`${n.x},${n.y}`);
        }
      }
      const finder = new PF.AStarFinder();
      for (const key of adjKeys) {
        const [cx, cy] = key.split(',').map(Number);
        if (cx < 0 || cx >= GRID_COLS || cy < 0 || cy >= GRID_ROWS || !grid.isWalkableAt(cx, cy)) continue;
        const path = finder.findPath(nextC.x, nextC.y, cx, cy, grid.clone());
        if (path && path.length > 0) {
          nextC.machineId = target.id;
          nextC.path = path;
          nextC.pathIndex = 0;
          nextC.status = 'walking_to_bathroom';
          nextC.patienceTicks = undefined;
          nextC.needs.shift();
          return true;
        }
      }
      return false;
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
      return m.type === targetType && m.x !== null; // handles bartop and bathroom
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
          if (timeRef.current.year >= 1976) possibleNeeds.push('bathroom');

          // Spawn rate scales with popularity: nearly empty at pop 0, busy at pop 300+
          const popFactor = Math.min(1, popularityRef.current / 300);
          const spawnThreshold = Math.max(0.15, 0.85 - 0.60 * popFactor) - (upgradeValuesRef.current.spawnBoost ?? 0);
          if (possibleNeeds.length > 0 && Math.random() > spawnThreshold) {
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
          // ── Random event roll (once per in-game day, midway through) ──
          const today = toLinDay(timeRef.current);
          if (timer >= 3 && lastEventDayRef.current !== today) {
            const ctx = {
              machines: machinesRef.current,
              time: timeRef.current,
              popularity: popularityRef.current,
              cash: cashRef.current,
            };
            const qualifying = EVENT_DEFS.filter(e => e.condition(ctx));
            if (qualifying.length > 0 && Math.random() < 0.035) {
              // Weighted random pick
              const totalWeight = qualifying.reduce((s, e) => s + e.weight, 0);
              let r = Math.random() * totalWeight;
              let picked = qualifying[qualifying.length - 1];
              for (const e of qualifying) { r -= e.weight; if (r <= 0) { picked = e; break; } }

              lastEventDayRef.current = today;

              // Resolve target machine for messages
              const placed = machinesRef.current.filter(
                m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0
              );
              let machineName = placed.length > 0 ? placed[0].name : 'a machine';

              // Apply effect
              if (picked.effect === 'machine_damage' || picked.effect === 'all_machine_damage') {
                let targets;
                if (picked.effect === 'all_machine_damage') {
                  targets = placed.map(m => ({ id: m.id, amount: picked.effectValue }));
                  machineName = 'your machines';
                } else if (picked.target === 'random') {
                  const t = placed[Math.floor(Math.random() * placed.length)];
                  targets = t ? [{ id: t.id, amount: picked.effectValue }] : [];
                  if (t) machineName = t.name;
                } else {
                  // weakest
                  const t = placed.reduce((a, b) => (a.durability < b.durability ? a : b), placed[0]);
                  targets = t ? [{ id: t.id, amount: picked.effectValue }] : [];
                  if (t) machineName = t.name;
                }
                if (targets.length > 0) {
                  setMachines(prev => prev.map(m => {
                    const hit = targets.find(t => t.id === m.id);
                    return hit ? { ...m, durability: Math.max(0, m.durability - hit.amount) } : m;
                  }));
                  setDailyReport(r => {
                    const damageMap = new Map(r.damage.map(d => [d.id, { ...d }]));
                    for (const hit of targets) {
                      const m = machinesRef.current.find(mac => mac.id === hit.id);
                      if (!m) continue;
                      const newDur = Math.max(0, m.durability - hit.amount);
                      if (damageMap.has(hit.id)) {
                        damageMap.get(hit.id).damageTaken += hit.amount;
                        damageMap.get(hit.id).currentDurability = newDur;
                      } else {
                        damageMap.set(hit.id, { id: hit.id, name: m.name, damageTaken: hit.amount, currentDurability: newDur });
                      }
                    }
                    return { ...r, damage: Array.from(damageMap.values()) };
                  });
                }
              }

              if (picked.effect === 'income_delta') {
                setCash(c => c + picked.effectValue);
              }

              if (picked.effect === 'popularity_delta') {
                setDailyReport(r => ({
                  ...r,
                  eventPopularityDelta: (r.eventPopularityDelta ?? 0) + picked.effectValue,
                }));
              }

              // Notify App
              const message = picked.getMessage({ machineName });
              setDailyReport(r => ({
                ...r,
                events: [...(r.events ?? []), { id: picked.id, label: picked.label, severity: picked.severity, message }],
              }));
              onEventRef.current?.({ id: picked.id, label: picked.label, severity: picked.severity, message });
            }
          }

        } else {
          // Day timer expired — wait for all customers to leave
          if (customersRef.current.length === 0) {
            // Repairman overnight maintenance — runs before REPORT so results appear in the modal
            if (upgradeValuesRef.current.repairmanActive) {
              const repairs = [];
              const repairedMachines = machinesRef.current.map(m => {
                const isMainFloor = (m.room === 'main' || !m.room) && m.x !== null;
                const isPinball = m.type === 'pinball' || !m.type;
                if (isPinball && isMainFloor && m.durability > 0 && m.durability < 100) {
                  const gain = Math.min(3, 100 - m.durability);
                  repairs.push({ id: m.id, name: m.name, gain });
                  return { ...m, durability: m.durability + gain };
                }
                return m;
              });
              if (repairs.length > 0) {
                setMachines(repairedMachines);
                setDailyReport(r => ({ ...r, repairmanRepairs: repairs }));
              }
            }
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
        let satisfiedCount = 0;
        let unsatisfiedCount = 0;
        const unsatisfiedReasons = {};
        const machinesToDegrade = [];
        const updated = [];

        // Returns true if the charm upgrade forgives this unsatisfied instance
        // (customer already had ≥1 need met, and forgiveness budget isn't spent)
        const tryForgive = (nextC) => {
          const charmLevel = upgradeValuesRef.current.charm ?? 0;
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
              // All needs met — walk to door
              if (!sendToExit(nextC)) continue; // trapped — teleport out
            } else if (dayTimerRef.current >= DAY_LENGTH_SECONDS) {
              // Bar is closed — abandon remaining needs and leave angry
              for (const n of nextC.needs) {
                if (!tryForgive(nextC)) {
                  unsatisfiedCount++;
                  const key = n === 'pinball' ? 'bar_closed_pinball' : n === 'drink' ? 'bar_closed_drink' : 'bar_closed_bathroom';
                  unsatisfiedReasons[key] = (unsatisfiedReasons[key] ?? 0) + 1;
                }
              }
              nextC.needs = [];
              nextC.angry = true;
              if (!sendToExit(nextC)) continue;
            } else {
              const need = nextC.needs[0];
              const targetType = need === 'pinball' ? 'pinball' : need === 'bathroom' ? 'bathroom' : 'bartop';

              // If a bathroom is needed but none exist in the main room, skip it immediately
              if (need === 'bathroom') {
                const hasBathroom = machinesRef.current.some(m => m.type === 'bathroom' && m.x !== null && (m.room === 'main' || !m.room));
                if (!hasBathroom) {
                  if (!tryForgive(nextC)) {
                    unsatisfiedCount++;
                    unsatisfiedReasons.no_bathroom = (unsatisfiedReasons.no_bathroom ?? 0) + 1;
                  }
                  nextC.needs.shift();
                  if (nextC.needs.length === 0) {
                    nextC.angry = true;
                    if (!sendToExit(nextC)) continue;
                  } else {
                    nextC.status = 'evaluating_needs';
                  }
                  updated.push(nextC);
                  continue;
                }
              }

              const assigned = tryAssignTarget(nextC, targetType, prev, updated);
              if (!assigned) {
                // Nothing available — walk towards machines to wait nearby
                const waitType = targetType;
                nextC.waitingFor = waitType;
                if (nextC.patienceTicks === undefined) {
                  nextC.patienceTicks = upgradeValuesRef.current.patienceTicks ?? PATIENCE_TICKS;
                }
                const foundSpot = findWaitingSpot(nextC, waitType, prev, updated);
                if (!foundSpot) {
                  // Can't even get near — just wait in place
                  nextC.status = need === 'pinball' ? 'waiting_for_pinball' : need === 'bathroom' ? 'waiting_for_bathroom' : 'waiting_for_bartop';
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
              nextC.status = waitType === 'pinball' ? 'waiting_for_pinball' : waitType === 'bathroom' ? 'waiting_for_bathroom' : 'waiting_for_bartop';
            }
            // While walking, also check if a spot opened up
            const walkWaitType = nextC.waitingFor || 'pinball';
            const earlyAssign = tryAssignTarget(nextC, walkWaitType, prev, updated);
            if (earlyAssign) {
              // Grabbed a spot while walking — great!
            }

          } else if (c.status === 'waiting_for_pinball' || c.status === 'waiting_for_bartop' || c.status === 'waiting_for_bathroom') {
            // Decrement patience
            if (nextC.patienceTicks !== undefined) {
              nextC.patienceTicks--;
            }

            if (nextC.patienceTicks <= 0) {
              // Out of patience — skip this need
              if (!tryForgive(nextC)) {
                unsatisfiedCount++;
                const pReason = c.status === 'waiting_for_pinball' ? 'patience_pinball'
                  : c.status === 'waiting_for_bathroom' ? 'patience_bathroom'
                  : 'patience_bartop';
                unsatisfiedReasons[pReason] = (unsatisfiedReasons[pReason] ?? 0) + 1;
              }
              nextC.needs.shift();
              nextC.patienceTicks = undefined;
              nextC.waitingFor = undefined;
              if (nextC.needs.length === 0) {
                // No more needs — leave angry
                nextC.angry = true;
                if (!sendToExit(nextC)) continue;
              } else {
                // Try evaluating the next need
                nextC.status = 'evaluating_needs';
              }
            } else {
              // Still patient — try to find a spot again
              const targetType = c.status === 'waiting_for_pinball' ? 'pinball' : c.status === 'waiting_for_bathroom' ? 'bathroom' : 'bartop';
              tryAssignTarget(nextC, targetType, prev, updated);
              // Otherwise stay waiting
            }

          } else if (c.status === 'walking_in' || c.status === 'walking_to_bar' || c.status === 'walking_to_bathroom') {
            if (c.pathIndex < c.path.length - 1) {
              nextC.pathIndex++;
              nextC.x = c.path[nextC.pathIndex][0];
              nextC.y = c.path[nextC.pathIndex][1];
            } else if (c.status === 'walking_to_bar') {
              nextC.status = 'waiting_for_drink';
              nextC.drinkPatienceTicks = Math.round(DRINK_PATIENCE_TICKS * (upgradeValuesRef.current.drinkPatienceMult ?? 1));
            } else if (c.status === 'walking_to_bathroom') {
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
                if (!sendToExit(nextC)) continue;
              } else {
                nextC.status = 'evaluating_needs';
              }
            }
          } else if (c.status === 'drinking') {
            if (nextC.playTicks === undefined) nextC.playTicks = 15;
            if (nextC.playTicks > 0) {
              nextC.playTicks--;
            } else {
              moneyEarned += upgradeValuesRef.current.drinkRevenue ?? 15;
              satisfiedCount++;
              nextC.satisfiedNeeds = (nextC.satisfiedNeeds ?? 0) + 1;
              nextC.machineId = null;
              nextC.playTicks = undefined;
              nextC.status = 'evaluating_needs';
            }
          } else if (c.status === 'using_bathroom') {
            if (nextC.bathroomTicks > 0) {
              nextC.bathroomTicks--;
            } else {
              satisfiedCount++;
              nextC.satisfiedNeeds = (nextC.satisfiedNeeds ?? 0) + 1;
              nextC.machineId = null;
              nextC.bathroomTicks = undefined;
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

        // ── Bar staff AI (bartender + servers share the same logic) ──
        const hasKeg = machinesRef.current.some(m => m.type === 'kegerator' && m.x !== null);
        const hasBartop = machinesRef.current.some(m => m.type === 'bartop' && m.x !== null);

        const runBarStaff = (entity) => {
          if (!hasKeg || !hasBartop) return entity;
          const next = { ...entity };
          if (next.x === null) {
            const keg = machinesRef.current.find(m => m.type === 'kegerator' && m.x !== null);
            if (keg) { next.x = keg.x; next.y = keg.y; }
            return next;
          }
          if (next.status === 'idle') {
            const waitingCust = updated.find(c => c.status === 'waiting_for_drink' && !c.beingServed);
            if (waitingCust) {
              waitingCust.beingServed = true;
              next.status = 'walking_to_kegerator';
              next.targetCustId = waitingCust.id;
              next.targetBartopId = waitingCust.machineId;
              const keg = machinesRef.current.find(m => m.type === 'kegerator' && m.x !== null);
              const grid = buildGrid(machinesRef.current);
              grid.setWalkableAt(keg.x, keg.y, true);
              const finder = new PF.AStarFinder();
              const path = finder.findPath(next.x, next.y, keg.x, keg.y, grid);
              if (path && path.length > 0) {
                next.path = path; next.pathIndex = 0;
              } else {
                next.status = 'idle'; waitingCust.beingServed = false;
              }
            }
          } else if (next.status === 'walking_to_kegerator') {
            if (next.pathIndex < next.path.length - 1) {
              next.pathIndex++;
              next.x = next.path[next.pathIndex][0];
              next.y = next.path[next.pathIndex][1];
            } else {
              next.status = 'pouring';
              next.timer = Math.max(1, Math.round(5 / (upgradeValuesRef.current.bartenderSpeed ?? 1)));
              next.timerMax = next.timer;
            }
          } else if (next.status === 'pouring') {
            next.timer--;
            if (next.timer <= 0) {
              next.status = 'walking_to_bartop';
              const bartop = machinesRef.current.find(m => m.id === next.targetBartopId);
              if (bartop) {
                const backCell = getBackCell(bartop.type, bartop.x, bartop.y, bartop.orientation);
                const grid = buildGrid(machinesRef.current);
                if (backCell) {
                  const finder = new PF.AStarFinder();
                  const path = finder.findPath(next.x, next.y, backCell.x, backCell.y, grid);
                  if (path && path.length > 0) {
                    next.path = path; next.pathIndex = 0;
                  } else { next.status = 'idle'; }
                } else { next.status = 'idle'; }
              } else { next.status = 'idle'; }
            }
          } else if (next.status === 'walking_to_bartop') {
            if (next.pathIndex < next.path.length - 1) {
              next.pathIndex++;
              next.x = next.path[next.pathIndex][0];
              next.y = next.path[next.pathIndex][1];
            } else {
              next.status = 'serving';
              next.timer = Math.max(1, Math.round(3 / (upgradeValuesRef.current.bartenderSpeed ?? 1)));
              next.timerMax = next.timer;
            }
          } else if (next.status === 'serving') {
            next.timer--;
            if (next.timer <= 0) {
              const cust = updated.find(c => c.id === next.targetCustId && c.status === 'waiting_for_drink');
              if (cust) { cust.status = 'drinking'; cust.beingServed = false; }
              next.status = 'idle'; next.targetCustId = null; next.targetBartopId = null;
            }
          }
          return next;
        };

        setBartender(runBarStaff(bartenderRef.current));
        if (serversRef.current.length > 0) {
          setServers(serversRef.current.map(s => runBarStaff(s)));
        }

        // ── Income & damage processing ──
        const forgivenCount = updated.reduce((sum, c) => sum + (c.forgivenUnsatisfied ?? 0), 0)
          - prev.reduce((sum, c) => sum + (c.forgivenUnsatisfied ?? 0), 0);

        if (moneyEarned > 0 || satisfiedCount > 0 || unsatisfiedCount > 0 || forgivenCount > 0) {
          if (moneyEarned > 0) setCash(c => c + moneyEarned);
          setDailyReport(r => {
            const merged = { ...(r.unsatisfiedReasons ?? {}) };
            for (const [k, v] of Object.entries(unsatisfiedReasons)) {
              merged[k] = (merged[k] ?? 0) + v;
            }
            return {
              ...r,
              income: r.income + moneyEarned,
              satisfied: (r.satisfied ?? 0) + satisfiedCount,
              unsatisfied: (r.unsatisfied ?? 0) + unsatisfiedCount,
              forgiven: (r.forgiven ?? 0) + Math.max(0, forgivenCount),
              unsatisfiedReasons: merged,
            };
          });
        }

        if (machinesToDegrade.length > 0) {
          const coverage = upgradeValuesRef.current.repairmanCoverage ?? 0;
          const coveredIds = coverage > 0
            ? new Set(
                machinesRef.current
                  .filter(m => (m.type === 'pinball' || !m.type) && (m.room === 'main' || !m.room) && m.x !== null)
                  .slice(0, coverage)
                  .map(m => m.id)
              )
            : new Set();

          const damageEvents = [];
          for (const mId of machinesToDegrade) {
            const machine = machinesRef.current.find(m => m.id === mId);
            if (!machine) continue;

            const age = Math.max(0, timeRef.current.year - machine.year);
            const damageReduction = upgradeValuesRef.current.damageReduction ?? 0;
            const repairmanMult = coveredIds.has(mId) ? 0.6 : 1;
            const damageChance = Math.min(0.60, 0.20 + (age * 0.02)) * (1 - damageReduction) * repairmanMult;

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
