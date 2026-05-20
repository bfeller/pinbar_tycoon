import { useEffect, useRef } from 'react';
import { DOOR_POS, resolveDayLengthSeconds } from '../constants';
import { getSpawnThreshold } from '../utils/popularity';
import { buildSpawnNeedPool, rollSpawnNeeds, COCKTAIL_UNLOCK_YEAR } from '../utils/patronNeeds';
import { tickCustomers } from '../simulation/customerAI';
import { tickStaff } from '../simulation/staffAI';
import { rollDayEvent } from '../simulation/eventRoller';
import { rollMachineDamage } from '../simulation/machineDamage';

/**
 * Core game simulation loop. Orchestrates:
 *   - Macro tick (1s): day timer, customer spawning, event/decision rolls
 *   - Micro tick (200ms): customer AI, staff AI, damage, income
 *
 * Simulation logic lives in src/simulation/. This hook is only
 * responsible for refs, state sync, and wiring the loops together.
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
  decisions = {},
  isPausedRef,
  fastForward = false,
  onEvent,
  onDecision,
  onCustomerSpend,
}) {
  // Refs give interval callbacks stable access to current state without
  // needing them in dependency arrays (which would restart the intervals).
  const machinesRef        = useRef(machines);
  const customersRef       = useRef(customers);
  const cashRef            = useRef(cash);
  const dayStateRef        = useRef(dayState);
  const dayTimerRef        = useRef(dayTimer);
  const timeRef            = useRef(time);
  const bartenderRef       = useRef(bartender);
  const serversRef         = useRef(servers);
  const upgradeValuesRef   = useRef(upgradeValues);
  const popularityRef      = useRef(popularity);
  const onEventRef         = useRef(onEvent);
  const onDecisionRef      = useRef(onDecision);
  const onCustomerSpendRef = useRef(onCustomerSpend);
  const decisionsRef       = useRef(decisions);
  const lastEventDayRef    = useRef(-1); // lin-day of last fired event, prevents >1 per day
  const prevDayStateRef    = useRef(dayState);

  const trySpawnPatronRef = useRef(() => false);

  useEffect(() => { machinesRef.current        = machines;       }, [machines]);
  useEffect(() => { customersRef.current       = customers;      }, [customers]);
  useEffect(() => { cashRef.current            = cash;           }, [cash]);
  useEffect(() => { dayStateRef.current        = dayState;       }, [dayState]);
  useEffect(() => { dayTimerRef.current        = dayTimer;       }, [dayTimer]);
  useEffect(() => { timeRef.current            = time;           }, [time]);
  useEffect(() => { bartenderRef.current       = bartender;      }, [bartender]);
  useEffect(() => { serversRef.current         = servers;        }, [servers]);
  useEffect(() => { upgradeValuesRef.current   = upgradeValues;  }, [upgradeValues]);
  useEffect(() => { popularityRef.current      = popularity;     }, [popularity]);
  useEffect(() => { onEventRef.current         = onEvent;        }, [onEvent]);
  useEffect(() => { onDecisionRef.current      = onDecision;     }, [onDecision]);
  useEffect(() => { onCustomerSpendRef.current = onCustomerSpend;}, [onCustomerSpend]);
  useEffect(() => { decisionsRef.current       = decisions;      }, [decisions]);

  trySpawnPatronRef.current = ({ guaranteed = false, openingRush = false } = {}) => {
    if (isPausedRef?.current || dayStateRef.current !== 'RUNNING') return false;

    const currentMachines = machinesRef.current;
    const needPool = buildSpawnNeedPool({
      hasPinball:  currentMachines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0 && (m.room === 'main' || !m.room)),
      hasDrink:    currentMachines.some(m => m.type === 'bartop'    && m.x !== null) &&
                   currentMachines.some(m => m.type === 'kegerator' && m.x !== null),
      hasCocktail: timeRef.current.year >= COCKTAIL_UNLOCK_YEAR &&
                   currentMachines.some(m => m.type === 'bartop'    && m.x !== null) &&
                   currentMachines.some(m => m.type === 'speed_well' && m.x !== null),
    });
    if (needPool.length === 0) return false;

    const spawnThreshold = getSpawnThreshold(popularityRef.current, {
      spawnBoost: upgradeValuesRef.current.spawnBoost ?? 0,
      openingRush,
    });

    if (!guaranteed && Math.random() <= spawnThreshold) return false;

    setCustomers(prev => [...prev, {
      id: 'cust-' + Date.now() + Math.random(),
      machineId: null,
      path: [],
      pathIndex: 0,
      status: 'evaluating_needs',
      x: DOOR_POS.x,
      y: DOOR_POS.y,
      needs: rollSpawnNeeds(needPool),
      playTimeLeft: 0,
      patienceTicks: undefined,
      drinksHad: 0,
      bathroomQueued: false,
    }]);
    return true;
  };

  // Doors open — at least one patron right away when the bar can serve anyone.
  useEffect(() => {
    if (dayState === 'RUNNING' && prevDayStateRef.current === 'BUILD') {
      trySpawnPatronRef.current({ guaranteed: true });
    }
    prevDayStateRef.current = dayState;
  }, [dayState]);

  // ── Macro Loop: day timer · spawning · event/decision rolls ─────────────
  useEffect(() => {
    const macroTick = setInterval(() => {
      if (isPausedRef?.current || dayStateRef.current !== 'RUNNING') return;

      const dayLen = resolveDayLengthSeconds(upgradeValuesRef.current);
      const nextTimer = dayTimerRef.current + 1;
      dayTimerRef.current = nextTimer;
      setDayTimer(nextTimer);

      // ── Day-end: wait for all customers to leave, then run overnight pass ──
      if (nextTimer >= dayLen) {
        if (customersRef.current.length === 0) {
          if (upgradeValuesRef.current.repairmanActive) {
            const repairs = [];
            const repairedMachines = machinesRef.current.map(m => {
              const isMainFloor = (m.room === 'main' || !m.room) && m.x !== null;
              const isPinball   = m.type === 'pinball' || !m.type;
              if (isPinball && isMainFloor && m.durability > 0 && m.durability < 100) {
                const gain = Math.min(upgradeValuesRef.current.repairPower ?? 3, 100 - m.durability);
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
        return;
      }

      // ── Spawn customers (busier in the first few seconds after opening) ──
      trySpawnPatronRef.current({ openingRush: nextTimer <= 3 });

      // ── Event / decision roll ────────────────────────────────────────────
      const rolled = rollDayEvent({
        timer: nextTimer,
        time:         timeRef.current,
        machines:     machinesRef.current,
        popularity:   popularityRef.current,
        cash:         cashRef.current,
        decisions:    decisionsRef.current,
        lastEventDay: lastEventDayRef.current,
      });

      if (!rolled) return;
      lastEventDayRef.current = rolled.today;

      if (rolled.type === 'decision') {
        const { decision, machineName } = rolled.payload;
        if (isPausedRef) isPausedRef.current = true;
        onDecisionRef.current?.(decision, { machineName });
        return;
      }

      // Passive event
      const { event, placed, machineName } = rolled.payload;
      let eventMachineName = machineName;

      if (event.effect === 'machine_damage' || event.effect === 'all_machine_damage') {
        let targets;
        if (event.effect === 'all_machine_damage') {
          targets = placed.map(m => ({ id: m.id, amount: event.effectValue }));
          eventMachineName = 'your machines';
        } else if (event.target === 'random') {
          const t = placed[Math.floor(Math.random() * placed.length)];
          targets = t ? [{ id: t.id, amount: event.effectValue }] : [];
          if (t) eventMachineName = t.name;
        } else {
          // weakest machine
          const t = placed.reduce((a, b) => (a.durability < b.durability ? a : b), placed[0]);
          targets = t ? [{ id: t.id, amount: event.effectValue }] : [];
          if (t) eventMachineName = t.name;
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

      if (event.effect === 'income_delta') {
        setCash(c => c + event.effectValue);
      }
      if (event.effect === 'popularity_delta') {
        setDailyReport(r => ({ ...r, eventPopularityDelta: (r.eventPopularityDelta ?? 0) + event.effectValue }));
      }

      const message = event.getMessage({ machineName: eventMachineName });
      setDailyReport(r => ({
        ...r,
        events: [...(r.events ?? []), { id: event.id, label: event.label, severity: event.severity, message }],
      }));
      onEventRef.current?.({
        id: event.id, label: event.label, severity: event.severity,
        message, effect: event.effect, effectValue: event.effectValue,
      });
    }, fastForward ? 500 : 1000);
    return () => clearInterval(macroTick);
  }, [fastForward]);

  // ── Micro Loop: customer AI · staff AI · damage · income ─────────────────
  useEffect(() => {
    const moveTick = setInterval(() => {
      if (dayStateRef.current !== 'RUNNING' || isPausedRef?.current) return;

      setCustomers(prev => {
        // 1. Advance customer state machine
        const result = tickCustomers(prev, {
          machines:       machinesRef.current,
          dayTimer:       dayTimerRef.current,
          upgradeValues:  upgradeValuesRef.current,
          time:           timeRef.current,
          onCustomerSpend: onCustomerSpendRef.current,
        });

        // 2. Advance staff state machine (mutates result.next in-place for drink handoffs)
        const dayLen = resolveDayLengthSeconds(upgradeValuesRef.current);
        const barClosed = dayTimerRef.current >= dayLen;

        const { nextBartender, nextServers } = tickStaff(
          bartenderRef.current,
          serversRef.current,
          result.next,
          { machines: machinesRef.current, upgradeValues: upgradeValuesRef.current, barClosed }
        );
        // Synchronously update refs so the next tick sees current staff state even if
        // React hasn't re-rendered yet (useEffect updates run after paint, not immediately).
        // Without this, a second tick firing before the render can see stale idle state,
        // overwrite the queued_for_station transition, and leave a patron stuck with
        // beingServed=true but no staff assigned — causing them to time out unserved.
        bartenderRef.current = nextBartender;
        setBartender(nextBartender);
        if (nextServers.length > 0) {
          // Merge tick results by ID rather than replacing the array wholesale.
          // A value-replacement setServers(nextServers) would drop any server just
          // hired between when serversRef was read and when this updater runs —
          // because the stale ref only knew about the previous count.
          const tickServerMap = new Map(nextServers.map(s => [s.id, s]));
          serversRef.current = serversRef.current.map(s => tickServerMap.get(s.id) ?? s);
          setServers(prev => prev.length > 0 ? prev.map(s => tickServerMap.get(s.id) ?? s) : prev);
        }

        // 3. Accumulate income and satisfaction counts
        const { moneyEarned, satisfiedCount, unsatisfiedCount, unsatisfiedReasons, machinesToDegrade, forgivenCount } = result;
        if (moneyEarned > 0 || satisfiedCount > 0 || unsatisfiedCount > 0 || forgivenCount > 0) {
          if (moneyEarned > 0) setCash(c => c + moneyEarned);
          setDailyReport(r => {
            const merged = { ...(r.unsatisfiedReasons ?? {}) };
            for (const [k, v] of Object.entries(unsatisfiedReasons)) {
              merged[k] = (merged[k] ?? 0) + v;
            }
            return {
              ...r,
              income:            r.income + moneyEarned,
              satisfied:         (r.satisfied   ?? 0) + satisfiedCount,
              unsatisfied:       (r.unsatisfied ?? 0) + unsatisfiedCount,
              forgiven:          (r.forgiven    ?? 0) + forgivenCount,
              unsatisfiedReasons: merged,
            };
          });
        }

        // 4. Roll wear damage for machines that were played this tick
        if (machinesToDegrade.length > 0) {
          const damageEvents = rollMachineDamage(machinesToDegrade, {
            machines:      machinesRef.current,
            time:          timeRef.current,
            upgradeValues: upgradeValuesRef.current,
          });
          if (damageEvents.length > 0) {
            setMachines(currentMachines => {
              const newMachines = currentMachines.map(m => {
                const ev = damageEvents.find(d => d.id === m.id);
                return ev ? { ...m, durability: Math.max(0, m.durability - ev.amount) } : m;
              });
              setDailyReport(r => {
                const damageMap = new Map(r.damage.map(d => [d.id, d]));
                for (const ev of damageEvents) {
                  const m    = currentMachines.find(mac => mac.id === ev.id);
                  const newM = newMachines.find(mac => mac.id === ev.id);
                  if (!m || !newM) continue;
                  if (damageMap.has(ev.id)) {
                    const entry = damageMap.get(ev.id);
                    entry.damageTaken += ev.amount;
                    entry.currentDurability = newM.durability;
                  } else {
                    damageMap.set(ev.id, { id: ev.id, name: m.name, damageTaken: ev.amount, currentDurability: newM.durability });
                  }
                }
                return { ...r, damage: Array.from(damageMap.values()) };
              });
              return newMachines;
            });
          }
        }

        return result.next;
      });
    }, fastForward ? 100 : 200);
    return () => clearInterval(moveTick);
  }, [fastForward]);
}
