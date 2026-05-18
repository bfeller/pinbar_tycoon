# Performance Reports — Design Spec

**Date:** 2026-05-18
**Status:** Approved

## Overview

Add a "Reports" app to the in-game Win95 computer that lets the player review their full financial history as a scrollable spreadsheet. The report covers every day from the start of the game, showing daily income, expenses, and net profit in a Win95-themed table.

---

## Data Model

### New state: `financialHistory`

Added to `App.jsx`:

```js
const [financialHistory, setFinancialHistory] = useState([]);
```

Each entry is a plain object:

```js
{
  year: number,       // in-game year (e.g. 1975)
  week: number,       // in-game week (1–10)
  day: number,        // in-game day within week (1–3)
  income: number,     // token earnings from customers that day
  totalExpenses: number, // sum of all expenses charged that day (0 on non-expense days)
  net: number,        // income - totalExpenses
}
```

### Where entries are created

Inside `nextDay()` in `App.jsx`, after `dailyReport.income` is known and `weeklyExpenses` is computed (already happens synchronously in that function), push a new entry:

```js
setFinancialHistory(prev => [...prev, {
  year: time.year,
  week: time.week,
  day: time.day,
  income: dailyReport.income,
  totalExpenses: weeklyExpenses.reduce((s, e) => s + e.amount, 0),
  net: dailyReport.income - weeklyExpenses.reduce((s, e) => s + e.amount, 0),
}]);
```

Note: `weeklyExpenses` is already a local variable computed before the state updates in `nextDay()`. On non-expense days it is an empty array, so `totalExpenses` is 0.

### Persistence

`financialHistory` is added to the save object in the auto-save `useEffect` and restored in `handleContinue`. New games start with an empty array.

---

## Computer UI

### New desktop icon

Added to the Win95 icon grid in `Computer.jsx`:

```jsx
<div className="win95-icon" onClick={() => setActiveWindow('reports')}>
  <div className="icon-img">📊</div>
  <span>Reports</span>
</div>
```

### New window: `activeWindow === 'reports'`

A standard `win95-window` panel with a title bar "Performance Reports" and a close button.

**Layout:**

```
| Day          | Income    | Expenses  | Net       |
|--------------|-----------|-----------|-----------|
| 1975 W1 D1   | $240      | $200      | +$40      |
| 1975 W1 D2   | $180      | $0        | +$180     |
| ...          |           |           |           |
|--------------|-----------|-----------|-----------|
| TOTAL        | $420      | $200      | +$220     |
```

- Rows are sorted newest-first (reverse chronological).
- Net column text is green (`#10b981`) when positive, red (`#f87171`) when negative, grey when zero.
- A sticky footer row shows all-time totals across all columns.
- The table body scrolls; header and footer are fixed.
- If `financialHistory` is empty, show a placeholder: *"No data yet — complete your first day to see your report."*

### Styling

Uses existing `win95-window`, `win95-titlebar`, `win95-content`, and `win95-close` classes for consistency. The table uses inline styles or a small new CSS block in `Computer.css` to achieve the spreadsheet look (fixed column widths, alternating row shading, monospace font for numbers).

---

## Props Threading

`Computer` receives two new props:

| Prop | Type | Description |
|---|---|---|
| `financialHistory` | `Array` | Read-only array of daily ledger entries |

No setter is needed — the report is read-only.

`App.jsx` passes it:

```jsx
<Computer
  ...existing props...
  financialHistory={financialHistory}
/>
```

---

## Save / Load

### Auto-save (`useEffect` on `time`)

```js
const save = {
  ...existing fields,
  financialHistory,
};
```

### `handleContinue`

```js
setFinancialHistory(s.financialHistory ?? []);
```

### `handleNewGame`

```js
setFinancialHistory([]);
```

---

## Constraints & Edge Cases

- **Day 1 with no customers:** Income will be 0. Entry still recorded so the row appears.
- **Expense days:** Weekly expenses only fire on `day === 1` of each new week. All other days have `totalExpenses: 0`.
- **Game restart:** History is cleared. History from a loaded save is preserved.
- **Large history:** At max ~1530 entries (51 years × 10 weeks × 3 days), each entry is ~6 numbers ≈ ~75KB serialised — well within localStorage limits.
- **Bankrupt / win screen:** History is not written after those transitions since `nextDay()` returns early before the push.
