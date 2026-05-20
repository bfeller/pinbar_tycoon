# Medical Billing System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the auto-deducted medical expense with an invoice-based billing portal where the player pays voluntarily, with 5% weekly interest and automatic force-collection after 5 weeks.

**Architecture:** Medical bills live as an array of invoice objects in App.jsx state. `nextDay()` creates invoices on week starts (year ≥ 2020) and ages existing ones, pushing collections emails and forcing deductions into the existing weekly expense pipeline at week 5. The Computer renders a new Medical portal window with a Win95-styled table.

**Tech Stack:** React 18 hooks, Vite, localStorage persistence, no test runner (verify manually in `npm run dev`).

---

## File Map

| File | Change |
|------|--------|
| `src/data/expenses.js` | Export `medicalExpenseAmount(time)` helper; remove medical entry from `EXPENSE_DEFS` |
| `src/App.jsx` | Add `medicalBills` state; wire save/load/reset; extend `nextDay()` with creation + aging logic; add `payMedicalBill` + `payAllMedicalBills` handlers; pass all to Computer |
| `src/components/Computer.jsx` | Accept new props; add ⚕ desktop icon; add `activeWindow === 'medical'` window block; add taskbar entry |
| `src/data/emails/quill.js` | Add `quill_medical_billing` email |

---

## Task 1: Extract medical formula and remove from EXPENSE_DEFS

**Files:**
- Modify: `src/data/expenses.js`

The `medical` entry is currently in `EXPENSE_DEFS` and auto-deducts. We need its amount formula as a standalone export so `nextDay()` can use it when creating invoices. Then we remove the entry entirely so it no longer auto-deducts.

- [ ] **Step 1: Open `src/data/expenses.js`**

Read it to see the current `medical` entry. It looks like:
```js
{
  id: 'medical',
  name: 'Medical Treatment',
  icon: '🏥',
  description: 'Ongoing treatment costs',
  frequencyWeeks: 1,
  startYear: 2020,
  amount: (time) => {
    const weeksFrom2020 = (time.year - 2020) * 10 + (time.week - 1);
    return Math.round(Math.pow(1.085, weeksFrom2020) * 300 / 10) * 10;
  },
},
```

- [ ] **Step 2: Rewrite `src/data/expenses.js`**

Replace the entire file with the formula exported separately and the medical entry removed:

```js
// Expense definitions.
//
// amount: flat number, or a function (time) => number for expenses that change over time.
// frequencyWeeks: 1 = every week, 2 = every other week, 4 = roughly monthly, etc.
//
// To add a new expense, append an entry here — no other files need to change.

// Medical bill amount for a given time. Used by the invoice system (not EXPENSE_DEFS).
// Grows at 8.5% per game-week from 2020-W1. By 2025-W10 (week 59) ~$37,000 — deliberately brutal.
export function medicalExpenseAmount(time) {
  const weeksFrom2020 = (time.year - 2020) * 10 + (time.week - 1);
  return Math.round(Math.pow(1.085, weeksFrom2020) * 300 / 10) * 10;
}

export const EXPENSE_DEFS = [
  {
    id: 'rent',
    name: 'Rent',
    icon: '🏢',
    description: 'Building lease',
    frequencyWeeks: 1,
    amount: (time) => {
      if (time.year < 1980) return 200;
      if (time.year < 1990) return 350;
      if (time.year < 2000) return 550;
      if (time.year < 2010) return 800;
      return 1100;
    },
  },
];
```

- [ ] **Step 3: Verify the app still builds**

```bash
npm run build
```

Expected: build succeeds with no errors. (The `medical` expense disappears from the report until Task 3 re-introduces it as an invoice.)

- [ ] **Step 4: Commit**

```bash
git add src/data/expenses.js
git commit -m "refactor: extract medicalExpenseAmount and remove medical from EXPENSE_DEFS"
```

---

## Task 2: Add `medicalBills` state and wire save/load/reset

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add the import for `medicalExpenseAmount` in App.jsx**

Find the existing import of `EXPENSE_DEFS` near the top of `src/App.jsx` (currently line 13):

```js
import { EXPENSE_DEFS } from './data/expenses';
```

Change it to:

```js
import { EXPENSE_DEFS, medicalExpenseAmount } from './data/expenses';
```

- [ ] **Step 2: Add `medicalBills` state**

Find the `// ── Banking ──` state block (~line 108). Add `medicalBills` directly after `activeLoan`:

```js
const [activeLoan, setActiveLoan] = useState(null);
const [medicalBills, setMedicalBills] = useState([]);
```

- [ ] **Step 3: Add `medicalBills` to the auto-save effect**

Find the `useEffect` auto-save block (~line 246). The `save` object currently ends with `activeInvestment, activeLoan`. Add `medicalBills`:

```js
const save = {
  version: 1,
  pinbarName, characterName, time, cash, machines, popularity,
  repairsRemaining, upgrades, enrolledCourses, inbox,
  firedArcEventIds: [...firedArcEventIds],
  popGainMult, liquidationLot, liquidationExpiryDay, staff,
  serverCount: staff.server,
  financialHistory, decisions,
  activeInvestment, activeLoan, medicalBills,
};
```

- [ ] **Step 4: Initialise `medicalBills` in `handleNewGame`**

Find `handleNewGame` (~line 262). After `setActiveLoan(null)`:

```js
setMedicalBills([]);
```

- [ ] **Step 5: Restore `medicalBills` in `handleContinue`**

Find `handleContinue` (~line 293). After `setActiveLoan(s.activeLoan ?? null)`:

```js
setMedicalBills(s.medicalBills ?? []);
```

- [ ] **Step 6: Verify save/load round-trips correctly**

```bash
npm run dev
```

Start a new game, open DevTools → Application → localStorage → `pinbar_tycoon_save`. Verify `medicalBills` key exists and is `[]`. Refresh and continue — verify `medicalBills` is restored as `[]`.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add medicalBills state with save/load"
```

---

## Task 3: Weekly bill creation and aging in `nextDay()`

**Files:**
- Modify: `src/App.jsx`

This is the core logic. All of it lives inside the `if (newTime.day === 1)` block in `nextDay()`, after the existing loan-payment block and before `const totalExpenses = ...`.

- [ ] **Step 1: Locate the insertion point**

In `nextDay()`, find this section (~line 760):

```js
      // Loan payment
      if (activeLoan) {
        weeklyExpenses.push({ id: 'loan_payment', name: 'Loan Payment', icon: '💸', amount: activeLoan.weeklyPayment });
        if (activeLoan.weeksRemaining <= 1) {
          setActiveLoan(null);
        } else {
          setActiveLoan(al => al ? { ...al, weeksRemaining: al.weeksRemaining - 1 } : null);
        }
      }
      const totalExpenses = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
```

- [ ] **Step 2: Insert the medical billing block between loan and totalExpenses**

```js
      // Loan payment
      if (activeLoan) {
        weeklyExpenses.push({ id: 'loan_payment', name: 'Loan Payment', icon: '💸', amount: activeLoan.weeklyPayment });
        if (activeLoan.weeksRemaining <= 1) {
          setActiveLoan(null);
        } else {
          setActiveLoan(al => al ? { ...al, weeksRemaining: al.weeksRemaining - 1 } : null);
        }
      }

      // ── Medical billing ─────────────────────────────────────────────────────
      if (newTime.year >= 2020) {
        // 1. Create this week's invoice
        const newBill = {
          id: `medical_${newTime.year}_w${newTime.week}`,
          originalAmount: medicalExpenseAmount(newTime),
          issuedLinearDay: newLinear,
          paid: false,
          autoDeducted: false,
          collectionsSent: false,
        };

        // 2. Age all existing bills (closure read is safe — new bill has weeksUnpaid=0)
        const collectionsEmails = [];
        const updatedBills = [...medicalBills, newBill].map(bill => {
          if (bill.paid || bill.autoDeducted) return bill;
          const weeksUnpaid = Math.floor((newLinear - bill.issuedLinearDay) / 3);
          const currentAmount = Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
          const updated = { ...bill };

          if (weeksUnpaid >= 4 && !bill.collectionsSent) {
            updated.collectionsSent = true;
            collectionsEmails.push({
              id: `collections_${bill.id}`,
              from: "St. Agatha's Billing Dept.",
              address: 'billing@stagatha-clinic.nhs.uk',
              subject: 'Overdue Invoice — Final Notice',
              body:
`This is a final notice regarding invoice ${bill.id.replace(/_/g, ' ').replace('medical ', '').toUpperCase()}.

Original amount: $${bill.originalAmount.toLocaleString()}
Interest accrued (${weeksUnpaid} weeks at 5%/week): $${(currentAmount - bill.originalAmount).toLocaleString()}
Total now due: $${currentAmount.toLocaleString()}

If this invoice is not paid within one week, the outstanding balance will be deducted automatically from your account.

Please log into the Medical Billing section of your computer to make a payment.

St. Agatha's Billing Department`,
              read: false,
              choiceMade: false,
              deliveredAt: newLinear,
            });
          }

          if (weeksUnpaid >= 5) {
            updated.autoDeducted = true;
            weeklyExpenses.push({
              id: `medical_auto_${bill.id}`,
              name: `Medical Bill (Auto-collected, ${weeksUnpaid} wks overdue)`,
              icon: '⚕',
              amount: currentAmount,
            });
          }

          return updated;
        });

        setMedicalBills(updatedBills);
        if (collectionsEmails.length > 0) {
          setInbox(prev => [...prev, ...collectionsEmails]);
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      const totalExpenses = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
```

- [ ] **Step 3: Verify bill creation in-game**

```bash
npm run dev
```

Use browser DevTools console to hack time: after the game is running, find a save, edit it to set `time: { year: 2020, week: 1, day: 3 }` (day 3 so next day advance crosses into week 2 day 1). Reload and continue. Click "Next Day". Open localStorage — verify `medicalBills` now has one entry with `originalAmount: 300` (the week-1 amount) and `issuedLinearDay` matching 2020-W1-D1.

- [ ] **Step 4: Verify interest accrual**

Edit save to have one existing bill with `issuedLinearDay` set 15 days (5 weeks) before `newLinear` of the next day advance. Verify on next advance: bill gains `autoDeducted: true` and its computed amount appears in the weekly report's expenses list.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: create medical invoices weekly and auto-collect after 5 weeks"
```

---

## Task 4: Pay handlers and Computer prop wiring

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add `payMedicalBill` handler**

Find the `const nextDay = () => {` function. Just before it, add:

```js
const payMedicalBill = (id) => {
  if (dayState === 'REPORT') return;
  const bill = medicalBills.find(b => b.id === id);
  if (!bill || bill.paid || bill.autoDeducted) return;
  const weeksUnpaid = Math.floor((toLinearDay(time) - bill.issuedLinearDay) / 3);
  const currentAmount = Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
  if (cash < currentAmount) return;
  setCash(c => c - currentAmount);
  setMedicalBills(prev => prev.map(b => b.id === id ? { ...b, paid: true } : b));
};

const payAllMedicalBills = () => {
  if (dayState === 'REPORT') return;
  const linearNow = toLinearDay(time);
  const unpaid = medicalBills.filter(b => !b.paid && !b.autoDeducted);
  const total = unpaid.reduce((sum, bill) => {
    const weeksUnpaid = Math.floor((linearNow - bill.issuedLinearDay) / 3);
    return sum + Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
  }, 0);
  if (total === 0 || cash < total) return;
  setCash(c => c - total);
  setMedicalBills(prev => prev.map(b =>
    (!b.paid && !b.autoDeducted) ? { ...b, paid: true } : b
  ));
};
```

- [ ] **Step 2: Pass new props to `<Computer>`**

Find the `<Computer ... />` JSX block (~line 1085). Add three new props:

```jsx
<Computer
  ...existing props...
  medicalBills={medicalBills}
  onPayMedicalBill={payMedicalBill}
  onPayAllMedicalBills={payAllMedicalBills}
/>
```

- [ ] **Step 3: Verify handlers don't crash**

```bash
npm run dev
```

Open DevTools console. Start a game, open the computer. No errors in console. (The portal UI doesn't exist yet — that's Task 5.)

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add payMedicalBill and payAllMedicalBills handlers"
```

---

## Task 5: Medical Billing portal UI in Computer.jsx

**Files:**
- Modify: `src/components/Computer.jsx`

- [ ] **Step 1: Accept the new props**

Find the destructured props list at the top of the `Computer` function (~line 23):

```js
export default function Computer({
  time, cash, dayState, marketTab, setMarketTab,
  ...
  fastForward, setFastForward,
  closeComputer
}) {
```

Add the three new props:

```js
export default function Computer({
  time, cash, dayState, marketTab, setMarketTab,
  dailyMarket, soldOutIds, buyMachine, buySupply,
  upgrades, enrolledCourses, purchaseUpgrade, purchaseDiscount,
  inbox, onEmailChoice, onEmailRead,
  characterName,
  liquidationLot, buyLiquidationMachine,
  staff, onHireStaff, onFireStaff,
  financialHistory = [],
  activeInvestment, activeLoan, onInvest, onTakeLoan,
  fastForward, setFastForward,
  closeComputer,
  medicalBills = [],
  onPayMedicalBill,
  onPayAllMedicalBills,
}) {
```

- [ ] **Step 2: Add the desktop icon**

Find the bank icon block (~line 123):

```jsx
          <div className="win95-icon" onClick={() => setActiveWindow('bank')}>
            <div className="icon-img">🏦</div>
            <span>Bank</span>
          </div>
```

Insert the medical icon directly after it:

```jsx
          <div className="win95-icon" onClick={() => setActiveWindow('medical')}>
            <div className="icon-img" style={{ position: 'relative' }}>
              ⚕
              {medicalBills.some(b => !b.paid && !b.autoDeducted && Math.floor((toLinearDay(time) - b.issuedLinearDay) / 3) >= 4) && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>!</span>
              )}
            </div>
            <span>Medical</span>
          </div>
```

- [ ] **Step 3: Add the Medical window block**

Find the bank window block (~line 511):

```jsx
        {activeWindow === 'bank' && (
```

Insert the medical window block directly before it:

```jsx
        {activeWindow === 'medical' && (() => {
          const linearNow = toLinearDay(time);
          const unpaidBills = medicalBills.filter(b => !b.paid && !b.autoDeducted);
          const billsWithAmounts = unpaidBills.map(bill => {
            const weeksUnpaid = Math.floor((linearNow - bill.issuedLinearDay) / 3);
            const currentAmount = Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
            const inCollections = weeksUnpaid >= 4;
            return { ...bill, weeksUnpaid, currentAmount, inCollections };
          });
          const totalDue = billsWithAmounts.reduce((s, b) => s + b.currentAmount, 0);
          const collectionsCount = billsWithAmounts.filter(b => b.inCollections).length;
          const canPayAll = totalDue > 0 && cash >= totalDue && dayState !== 'REPORT';

          return (
            <div className="win95-window">
              <div className="win95-titlebar">
                <div className="title">⚕ Medical Billing — St. Agatha's Clinic</div>
                <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
              </div>
              <div className="win95-toolbar">
                <span>Address: http://www.stagatha-billing.nhs.uk</span>
              </div>
              <div className="win95-content">
                <div className="browser-page">
                  {time.year < 2020 ? (
                    <p style={{ color: '#555', fontStyle: 'italic' }}>Medical billing begins in 2020. No invoices yet.</p>
                  ) : billsWithAmounts.length === 0 ? (
                    <p style={{ color: '#006600' }}>✓ No outstanding invoices. You're all caught up.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                        <div>
                          <strong>Outstanding Invoices</strong>
                          {collectionsCount > 0 && (
                            <div style={{ color: '#800000', fontSize: '0.8rem', marginTop: '2px' }}>
                              ⚠ {collectionsCount} invoice{collectionsCount > 1 ? 's' : ''} in collections
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem' }}>Total outstanding: <strong>${totalDue.toLocaleString()}</strong></div>
                          <button
                            className="win95-btn"
                            disabled={!canPayAll}
                            onClick={onPayAllMedicalBills}
                            style={{ marginTop: '4px', fontSize: '0.75rem' }}
                          >
                            Pay All (${totalDue.toLocaleString()})
                          </button>
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#000080', color: 'white' }}>
                            <th style={{ padding: '3px 6px', textAlign: 'left' }}>Invoice</th>
                            <th style={{ padding: '3px 6px', textAlign: 'right' }}>Original</th>
                            <th style={{ padding: '3px 6px', textAlign: 'right' }}>Due Now</th>
                            <th style={{ padding: '3px 6px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '3px 6px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {billsWithAmounts.map(bill => {
                            const canPay = cash >= bill.currentAmount && dayState !== 'REPORT';
                            const label = bill.id.replace(/^medical_/, '').replace(/_w/, '-W').toUpperCase();
                            let statusEl;
                            if (bill.inCollections) {
                              statusEl = <span style={{ color: '#800000', fontWeight: 'bold' }}>🚨 Collections</span>;
                            } else if (bill.weeksUnpaid === 0) {
                              statusEl = <span style={{ color: '#006600' }}>✓ New</span>;
                            } else {
                              statusEl = <span style={{ color: '#555' }}>{bill.weeksUnpaid} wk{bill.weeksUnpaid > 1 ? 's' : ''} old</span>;
                            }
                            return (
                              <tr
                                key={bill.id}
                                style={{ background: bill.inCollections ? '#fff0f0' : 'white', borderBottom: '1px solid #ddd' }}
                              >
                                <td style={{ padding: '4px 6px' }}><strong>{label}</strong></td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>${bill.originalAmount.toLocaleString()}</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                                  <strong style={{ color: bill.inCollections ? '#800000' : 'inherit' }}>
                                    ${bill.currentAmount.toLocaleString()}
                                  </strong>
                                </td>
                                <td style={{ padding: '4px 6px' }}>{statusEl}</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                                  <button
                                    className="win95-btn"
                                    disabled={!canPay}
                                    onClick={() => onPayMedicalBill(bill.id)}
                                    style={{ fontSize: '0.75rem', padding: '1px 6px' }}
                                  >
                                    Pay
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={{ fontSize: '0.72rem', color: '#555', marginTop: '6px', fontStyle: 'italic' }}>
                        Interest: 5% per week unpaid · Auto-collected after 5 weeks
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

```

- [ ] **Step 4: Add the taskbar entry**

Find the bank taskbar item (~line 632):

```jsx
          {activeWindow === 'bank' && (
            <div className="taskbar-item active">First Pinbar Bank</div>
          )}
```

Insert directly after it:

```jsx
          {activeWindow === 'medical' && (
            <div className="taskbar-item active">St. Agatha's Billing</div>
          )}
```

- [ ] **Step 5: Verify the portal renders correctly**

```bash
npm run dev
```

1. Start a new game. Open Computer → click ⚕ Medical icon. Verify "Medical billing begins in 2020. No invoices yet." appears.
2. Edit localStorage to set `time: { year: 2020, week: 3, day: 1 }` and add a bill:
   ```json
   "medicalBills": [
     { "id": "medical_2020_w1", "originalAmount": 300, "issuedLinearDay": 1351, "paid": false, "autoDeducted": false, "collectionsSent": false },
     { "id": "medical_2020_w2", "originalAmount": 325, "issuedLinearDay": 1354, "paid": false, "autoDeducted": false, "collectionsSent": false }
   ]
   ```
   (issuedLinearDay for 2020-W1-D1: `(2020-1975)*30 + (1-1)*3 + 1 = 1351`. W2-D1: 1354.)
3. Continue saved game. Set current time to 2020-W3-D1 (linearDay=1357). Open Medical portal. Verify:
   - W1 shows "2 wks old", amount = `round(300 * 1.05^2)` = $331
   - W2 shows "1 wk old", amount = `round(325 * 1.05^1)` = $341
   - Pay All button shows correct total
4. Click Pay on W1 row. Verify cash decreases by $331 and row disappears. Verify Pay All updates.
5. Verify Pay buttons are disabled when `dayState === 'REPORT'` (open report modal, try to open computer if possible, or force via localStorage).

- [ ] **Step 6: Commit**

```bash
git add src/components/Computer.jsx
git commit -m "feat: add Medical Billing portal to Computer with table view"
```

---

## Task 6: Dr. Quill billing intro email

**Files:**
- Modify: `src/data/emails/quill.js`

- [ ] **Step 1: Add the email at the end of `quillEmails` array in `src/data/emails/quill.js`**

Find the closing `];` of the `quillEmails` array. Insert before it:

```js
  {
    id: 'quill_medical_billing',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Regarding Your Medical Bills — Practical Information',
    body:
`Following my previous note about your health: I want to give you the practical information I withheld, because I think you have absorbed the other part and it is time.

The bills are going to arrive through your computer. There is a section called Medical — you will find the icon on the desktop. It connects to something called St. Agatha's Billing Department, which in your timeline will not exist for several more decades but which I have had to, for reasons I cannot fully explain without forms, instantiate in advance.

Here is how it works.

Each week, starting in 2020, an invoice will appear in that section. If you pay it immediately, you pay the stated amount. If you do not pay it, five percent interest is added to that invoice each week it remains outstanding. The invoices are individual — each one ages on its own. You can pay them one at a time or all at once.

If an invoice reaches four weeks without payment, you will receive a formal notice from the billing department. This is not a threat. It is a notice. The threat — and I am sorry to use that word but I want to be accurate — is what happens at week five: if an invoice is still unpaid at that point, the amount is taken automatically from your account, with the accumulated interest.

I want to be transparent with you: the amounts grow. Considerably. The treatment costs more as time goes on, at a rate I found difficult to look at when I first ran the projections. The best strategy, if you can manage it, is to pay each invoice promptly. Interest is not your friend in this situation.

The bar needs to be able to sustain this. That is not a metaphor. That is arithmetic.

I am sorry the situation requires a spreadsheet.

Dr. Quill`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('quill_illness') &&
      !sentIds.has('quill_medical_billing') &&
      ((time.year === 2019 && time.week >= 9) || time.year >= 2020),
    choices: null,
  },
```

- [ ] **Step 2: Verify the email triggers correctly**

```bash
npm run dev
```

Edit localStorage to set `time: { year: 2019, week: 9, day: 1 }` and add `quill_illness` to the inbox (mark it read, so `sentIds` includes it). Advance the day. Open Outlook Express — verify `quill_medical_billing` appears with the correct subject and body.

Also verify it does NOT appear before week 9 of 2019: set time to 2019-W8 and confirm the email is absent.

- [ ] **Step 3: Commit**

```bash
git add src/data/emails/quill.js
git commit -m "feat: add Dr. Quill medical billing intro email"
```

---

## Task 7: End-to-end verification and final commit

- [ ] **Step 1: Full flow test — new game path**

```bash
npm run dev
```

Play through from scratch. Verify:
- ⚕ Medical icon appears in Computer from game start
- Before 2020: portal shows "No invoices yet" message
- At 2020-W1: first invoice appears in portal (original amount ~$300)
- Quill billing email arrives at 2019-W9 (or whenever `quill_illness` has been sent)
- Paying an invoice immediately reduces cash and removes the row
- Leaving an invoice for 4 weeks: collections email arrives in Outlook Express
- Leaving an invoice for 5 weeks: it disappears from portal and appears as a forced expense in the next daily report

- [ ] **Step 2: Full flow test — load game path**

Start a game, advance to 2020, save (by advancing the day). Close the tab. Reload. Continue. Verify all `medicalBills` in localStorage are correctly restored and still display in the portal.

- [ ] **Step 3: Red icon badge test**

Leave a bill unpaid until week 4. Verify the ⚕ icon on the desktop gains a red `!` badge. Pay the bill. Verify badge disappears.

- [ ] **Step 4: Final commit**

```bash
git add -p  # review any lingering unstaged changes
git commit -m "feat: complete medical billing system with invoices, interest, and collections"
```
