// Fixed-term investment products and loan terms.
// All durations are in in-game weeks (1 week = 3 days).
//
// Investment rates are intentionally below loan rates on a per-week basis
// so borrowing to invest is never profitable.

export const INVESTMENT_DEFS = [
  {
    id: 'term_deposit',
    name: 'Term Deposit',
    icon: '🏦',
    description: 'Guaranteed return on a short commitment. Your money is locked in until maturity.',
    minAmount: 500,
    durationWeeks: 4,
    interestRate: 0.06, // +6% at maturity (~1.5%/week)
  },
  {
    id: 'gov_bond',
    name: 'Government Bond',
    icon: '📜',
    description: 'Higher return for a longer term. Backed by Her Majesty\'s Government.',
    minAmount: 1500,
    durationWeeks: 10,
    interestRate: 0.15, // +15% at maturity (~1.5%/week)
  },
];

export const LOAN_DEF = {
  name: 'Small Business Loan',
  icon: '💸',
};

// Each preset carries its own term and rate so larger loans have longer obligations.
// Rates run ~2–1.7%/week — always above investment returns, so arbitrage is impossible.
export const LOAN_PRESETS = [
  { amount: 1000,  durationWeeks: 10, totalInterestRate: 0.20 }, // $1,200 total · $120/wk
  { amount: 5000,  durationWeeks: 14, totalInterestRate: 0.25 }, // $6,250 total · $446/wk
  { amount: 10000, durationWeeks: 18, totalInterestRate: 0.30 }, // $13,000 total · $722/wk
];
