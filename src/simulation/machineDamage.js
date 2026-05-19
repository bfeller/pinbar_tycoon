/**
 * For each machine that was played this tick, roll for wear damage.
 *
 * Damage chance scales with machine age and is reduced by electronics/repairman upgrades.
 * Returns an array of { id, amount } — caller applies these to machine state.
 */
export function rollMachineDamage(machinesToDegrade, { machines, time, upgradeValues }) {
  const coverage = upgradeValues.repairmanCoverage ?? 0;
  const coveredIds = coverage > 0
    ? new Set(
        machines
          .filter(m => (m.type === 'pinball' || !m.type) && (m.room === 'main' || !m.room) && m.x !== null)
          .slice(0, coverage)
          .map(m => m.id)
      )
    : new Set();

  const events = [];
  for (const mId of machinesToDegrade) {
    const machine = machines.find(m => m.id === mId);
    if (!machine) continue;

    const age = Math.max(0, time.year - machine.year);
    const damageReduction = upgradeValues.damageReduction ?? 0;
    const repairmanMult  = coveredIds.has(mId) ? 0.6 : 1;
    const damageChance   = Math.min(0.60, 0.20 + age * 0.02) * (1 - damageReduction) * repairmanMult;

    if (Math.random() < damageChance) {
      events.push({ id: mId, amount: Math.floor(Math.random() * 5) + 1 });
    }
  }
  return events;
}
