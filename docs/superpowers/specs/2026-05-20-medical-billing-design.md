# Medical Billing System — Design Spec

**Date:** 2026-05-20  
**Status:** Awaiting user review

---

## Overview

Replace the current auto-deducted weekly medical expense (2020+) with an invoice-based billing system. Bills appear in a new Medical Billing portal inside the Computer. The player can pay immediately at face value; unpaid bills accrue 5% interest per week. Bills overdue by 4 weeks trigger a collections warning email; at 5 weeks they are force-deducted automatically.

A new Dr. Quill email (triggered before 2020) explains the system to the player before the first bill arrives.

---

## Data Model

New top-level state in `App.jsx`:

```js
const [medicalBills, setMedicalBills] = useState([]);
```

Each bill object:

```js
{
  id: string,              // e.g. "medical_2020_w1"
  originalAmount: number,  // base amount when issued
  issuedLinearDay: number, // lin(time) when created
  paid: boolean,           // player paid voluntarily
  autoDeducted: boolean,   // force-collected at week 5
  collectionsSent: boolean // collections email already sent
}
```

Derived at render time (not stored):
- `weeksUnpaid = floor((currentLinearDay - issuedLinearDay) / 3)`
- `currentAmount = Math.round(originalAmount * Math.pow(1.05, weeksUnpaid))`

Paid and auto-deducted bills are kept in state for save/load completeness but not shown in the portal UI.

---

## Weekly Bill Creation

`EXPENSE_DEFS` currently auto-deducts medical bills starting in 2020 (`startYear: 2020`). This entry is **removed**. Instead, `nextDay()` creates an invoice when `newTime.day === 1 && newTime.year >= 2020`:

```js
const medicalDef = /* the removed EXPENSE_DEFS entry logic */;
const amount = medicalDef.amount(newTime);
setMedicalBills(prev => [...prev, {
  id: `medical_${newTime.year}_w${newTime.week}`,
  originalAmount: amount,
  issuedLinearDay: newLinear,
  paid: false,
  autoDeducted: false,
  collectionsSent: false,
}]);
```

The amount formula stays identical to the current `EXPENSE_DEFS` medical entry (exponential growth from 2020).

---

## Interest & Collections Logic (in `nextDay`)

Run every week start (`newTime.day === 1`) after bills are created:

```
for each unpaid, non-autoDeducted bill:
  weeksUnpaid = floor((newLinear - bill.issuedLinearDay) / 3)
  currentAmount = round(originalAmount * 1.05^weeksUnpaid)

  if weeksUnpaid >= 4 and !collectionsSent:
    mark collectionsSent = true
    push collections email to inbox (see below)

  if weeksUnpaid >= 5 and !paid:
    mark autoDeducted = true
    add currentAmount to weeklyExpenses as a forced line item
    deduct from cash in the same block as other expenses
```

Interest is computed fresh each time from `issuedLinearDay` — no stored running total.

---

## Collections Email

Generated dynamically and pushed directly to `inbox` state (bypasses `EMAIL_DEFS` since it needs variable content):

```js
{
  id: `collections_${bill.id}`,
  from: "St. Agatha's Billing Dept.",
  address: 'billing@stagatha-clinic.nhs.uk',
  subject: 'Overdue Invoice — Final Notice',
  body: `...Invoice ${bill.id}, original $X, now $Y. Pay within 1 week or amount will be deducted automatically...`,
  read: false,
  choiceMade: false,
  deliveredAt: newLinear,
  // no choices
}
```

---

## Dr. Quill Intro Email

New entry in `src/data/emails/quill.js`:

- **id:** `quill_medical_billing`
- **Trigger:** `sentIds.has('quill_illness') && !sentIds.has('quill_medical_billing') && ((time.year === 2019 && time.week >= 9) || time.year >= 2020)`
- **Content:** Quill explains that medical invoices will appear in the computer under a new Medical Billing section. Bills can be paid immediately at cost; each week unpaid adds 5% interest. Bills ignored for 4 weeks receive a collections notice; at 5 weeks the amount is taken automatically. He frames this with his characteristic dry bureaucratic sympathy — the TCO has a form for this situation; he wishes it were not so.

Fires after `quill_illness` (which is the emotional gut-punch about the illness itself). This follow-up is practical — the how-to of the billing system.

---

## Computer UI — Medical Billing Portal

### Access

New icon/button in the Computer sidebar (alongside browser, university, staff, bank, finance): **"Medical"** (icon: ⚕).

### Window Structure

```
[Win95 titlebar: ⚕ Medical Billing — St. Agatha's Clinic   X]
[toolbar: Address: http://www.stagatha-billing.nhs.uk       ]
[content area]
  [header row]
    "Outstanding Invoices"          Total: $X   [Pay All ($X)]
    ⚠ N invoice(s) in collections   (red, if any)

  [table]
    | Invoice   | Original | Due Now | Status        |        |
    |-----------|----------|---------|---------------|--------|
    | 2020-W1   | $300     | $383    | 🚨 Collections | [Pay]  |
    | 2020-W2   | $325     | $341    | 2 wks old     | [Pay]  |
    | 2020-W3   | $352     | $352    | ✓ New         | [Pay]  |

  [footer] "Interest: 5% per week · Auto-collected after 5 weeks"
```

- Status column: `✓ New` (green, week 0), `N wks old` (grey), `⚠ Collections` (red, week 4+)
- Rows in collections highlighted with light red background
- Pay button deducts `currentAmount` from cash and marks bill paid
- Pay All deducts the sum of all `currentAmount` values for unpaid bills
- No unpaid bills → show "No outstanding invoices. You're all caught up."
- Before 2020: portal shows "Medical billing begins in 2020. No invoices yet." (icon visible but empty state, so player knows the feature exists)

### `dayState === 'REPORT'` guard

Pay buttons disabled during REPORT state (same pattern as other Computer purchase actions).

---

## Save / Load

`medicalBills` added to the save object in the `useEffect` auto-save block:

```js
const save = {
  ...,
  medicalBills,
};
```

In `handleContinue`:

```js
setMedicalBills(s.medicalBills ?? []);
```

In `handleNewGame`:

```js
setMedicalBills([]);
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.jsx` | Add `medicalBills` state; bill creation + aging logic in `nextDay()`; pass to Computer; save/load |
| `src/data/expenses.js` | Remove medical entry from `EXPENSE_DEFS` |
| `src/data/emails/quill.js` | Add `quill_medical_billing` email |
| `src/components/Computer.jsx` | Add Medical window with table view; pay/pay-all handlers |

---

## Out of Scope

- Partial payment of a single invoice
- Payment plans
- Interest on auto-deducted bills (force-collection clears the bill entirely)
- Medical bills before 2020
