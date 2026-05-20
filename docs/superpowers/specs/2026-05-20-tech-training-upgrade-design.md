# Service Tech Training — University Upgrade Design

**Date:** 2026-05-20

## Summary

Add a 2-level "Advanced Technician Training" university course that upgrades the repairman's overnight repair power and machine coverage, with the repairman's weekly salary stepping up at each tier.

## Upgrade Definition

- **ID:** `tech_training`
- **Name:** Advanced Technician Training
- **Icon:** 🛠️
- **Flavor:** Advanced diagnostics, calibration, and repair techniques. A certified tech gets more done each night.
- **Max level:** 2
- **Costs:** [$1,200, $3,500]
- **Duration:** 6 in-game days per level

### Effect per level

| Level | Repair/machine/night | Coverage | Weekly salary |
|-------|----------------------|----------|---------------|
| 0 (base) | 3 | 10 machines | $250 |
| 1 | 4 | 15 machines | $350 |
| 2 | 5 | 25 machines | $450 |

## Implementation Touchpoints

### `src/data/upgrades.js`
Add a new entry to `UPGRADE_DEFS`:
```js
{
  id: 'tech_training',
  name: 'Advanced Technician Training',
  icon: '🛠️',
  flavor: 'Advanced diagnostics, calibration, and repair techniques. A certified tech gets more done each night.',
  effect: level => `Repairman: +${[3,4,5][level]} repair/machine, covers ${[10,15,25][level]} machines`,
  maxLevel: 2,
  costs: [1200, 3500],
  duration: 6,
}
```

### `src/App.jsx` — `upgradeValues`
Add two new fields:
- `repairPower: [3, 4, 5][upgrades.tech_training ?? 0]`
- Update `repairmanCoverage` to use `[10, 15, 25][upgrades.tech_training ?? 0]` (when repairman is hired)

### `src/App.jsx` — overnight repair loop (~line 132)
Change the hardcoded `+3` durability gain to `upgradeValues.repairPower`.

### `src/App.jsx` — payroll calculation (~line 748)
When computing the repairman's weekly salary, step up based on `upgrades.tech_training`:
- `weeklySalary + (upgrades.tech_training ?? 0) * 100`

No changes required in `Computer.jsx` — the university grid auto-renders from `UPGRADE_DEFS`, and the staff panel effects text is intentionally left as static copy.

## Constraints

- The upgrade has full effect whether or not the repairman is hired (consistent with how `mixology` works without requiring a bartender to be hired). The salary step is only applied when `staff.repairman === true`.
- No UI gating needed in the University panel.
