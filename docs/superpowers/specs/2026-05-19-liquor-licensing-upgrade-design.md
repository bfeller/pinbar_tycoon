# Liquor Licensing Upgrade — Design Spec

**Date:** 2026-05-19  
**Feature:** University upgrade that extends operating hours from 15s → 20s → 25s → 30s per day

---

## Overview

Add a three-tier "Liquor Licensing" upgrade to the Pineview CC university system. Each tier extends the in-game day length by 5 seconds, giving more time to serve customers and earn revenue. At max level, operating time doubles.

---

## Upgrade Definition (`src/data/upgrades.js`)

New entry appended to `UPGRADE_DEFS`:

| Field      | Value |
|------------|-------|
| `id`       | `'liquor_licensing'` |
| `name`     | `'Liquor Licensing'` |
| `icon`     | `'📋'` |
| `flavor`   | Bureaucratic flavor text referencing permits, zoning, and operating windows |
| `maxLevel` | `3` |
| `costs`    | `[800, 2000, 4500]` |
| `duration` | `6` (days to complete each tier) |
| `effect`   | `level => \`Operating hours: ${15 + level * 5}s per day\`` |

---

## Derived Value (`src/App.jsx`)

Add to the `upgradeValues` object:

```js
dayLengthSeconds: DAY_LENGTH_SECONDS + upgrades.liquor_licensing * 5,
```

`DAY_LENGTH_SECONDS` remains 15 in `constants.js` as the baseline. This expression evaluates to 15 / 20 / 25 / 30 at levels 0–3.

---

## Game Engine (`src/hooks/useGameEngine.js`)

`DAY_LENGTH_SECONDS` is imported as a constant and used in one place in the macro tick:

- **Day-end detection:** `if (timer >= DAY_LENGTH_SECONDS)`

Replace with:
```js
const dayLen = upgradeValuesRef.current.dayLengthSeconds ?? DAY_LENGTH_SECONDS;
// ...
if (timer >= dayLen) {
```

The `DAY_LENGTH_SECONDS` import stays as the fallback default.

---

## Customer AI (`src/simulation/customerAI.js`)

`DAY_LENGTH_SECONDS` is imported and used in the closing-time check inside `tickCustomers`:

```js
} else if (dayTimer >= DAY_LENGTH_SECONDS) {
```

`tickCustomers` already receives a context object that includes `upgradeValues`. Add `dayLengthSeconds` to that destructure and replace the constant:

```js
const dayLen = upgradeValues.dayLengthSeconds ?? DAY_LENGTH_SECONDS;
// ...
} else if (dayTimer >= dayLen) {
```

The import of `DAY_LENGTH_SECONDS` in `customerAI.js` stays as fallback.

---

## Completion Email (`src/data/emails/university.js`)

New entry with Pineview CC's bureaucratic tone. Trigger: `completedCourseIds.has('liquor_licensing') && !sentIds.has('uni_liquor_licensing')`.

Tone: dry, proud of the paperwork, mentions the license arrives by post in 6–8 weeks, suggests follow-up courses in zoning law and fire code compliance.

---

## What Does Not Change

- `constants.js` — `DAY_LENGTH_SECONDS = 15` stays as the baseline / fallback
- The `upgrades` state shape in `App.jsx` — new key `liquor_licensing` initialises to `0` alongside all other upgrade keys
- No UI changes needed — the upgrade card and email render automatically from the existing `UPGRADE_DEFS` and `universityEmails` arrays
- **`upgrades` initial state** (`App.jsx` line ~88) — add `liquor_licensing: 0` alongside the other 8 keys. Note: the existing `charm` upgrade is absent from this initializer (existing oversight); do not fix that as part of this change.

---

## Scope

This spec covers exactly: upgrade definition, derived value, two engine usages, one customer AI usage, and one completion email. No other systems are affected.
