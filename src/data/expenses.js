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
