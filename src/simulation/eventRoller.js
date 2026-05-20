import { EVENT_DEFS } from '../data/events';
import { DECISION_DEFS } from '../data/decisions';

function toLinDay({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}

/**
 * Attempt to roll a passive event or player decision for the current day.
 * Only one event fires per in-game day (guarded by lastEventDay).
 * Decisions take priority over passive events when both would qualify.
 *
 * @returns {{ type: 'decision'|'event', payload, today }} or null
 */
export function rollDayEvent({ timer, time, machines, popularity, cash, decisions, lastEventDay }) {
  const today = toLinDay(time);
  if (timer < 3 || lastEventDay === today) return null;

  const placed = machines.filter(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0 && (m.room === 'main' || !m.room));
  const machineName = placed.length > 0
    ? placed[Math.floor(Math.random() * placed.length)].name
    : 'a machine';

  // Decision roll (takes priority)
  if (Math.random() < 0.025) {
    const ctx = { machines, decisions, popularity, cash, time };
    const eligible = DECISION_DEFS.filter(d => {
      const alreadyFired = !d.repeatable && d.choices.some(c => decisions[c.flagId]);
      return !alreadyFired && d.condition(ctx);
    });
    if (eligible.length > 0) {
      const totalWeight = eligible.reduce((s, d) => s + d.weight, 0);
      let r = Math.random() * totalWeight;
      let picked = eligible[eligible.length - 1];
      for (const d of eligible) { r -= d.weight; if (r <= 0) { picked = d; break; } }
      return { type: 'decision', payload: { decision: picked, machineName }, today };
    }
  }

  // Passive event roll
  const ctx = { machines, time, popularity, cash };
  const qualifying = EVENT_DEFS.filter(e => e.condition(ctx));
  if (qualifying.length > 0 && Math.random() < 0.035) {
    const totalWeight = qualifying.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * totalWeight;
    let picked = qualifying[qualifying.length - 1];
    for (const e of qualifying) { r -= e.weight; if (r <= 0) { picked = e; break; } }
    return { type: 'event', payload: { event: picked, placed, machineName }, today };
  }

  return null;
}
