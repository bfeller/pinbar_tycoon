import React, { useState } from 'react';
import { INVESTMENT_DEFS, LOAN_DEF, LOAN_PRESETS } from '../data/banking';

function toLinDay({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}

export default function BankWindow({ cash, dayState, time, activeInvestment, activeLoan, onInvest, onTakeLoan, onClose }) {
  const [amounts, setAmounts] = useState(
    Object.fromEntries(INVESTMENT_DEFS.map(d => [d.id, String(d.minAmount)]))
  );

  const currentLinDay = toLinDay(time);
  const busy = dayState === 'REPORT';

  return (
    <div className="win95-window">
      <div className="win95-titlebar">
        <div className="title">🏦 First Pinbar Bank — Online Banking</div>
        <button className="win95-close" onClick={onClose}>X</button>
      </div>
      <div className="win95-toolbar">
        <span>Address: http://www.firstpinbarbank.co.uk</span>
      </div>
      <div className="win95-content">
        <div className="browser-page">
          <h1 style={{ color: 'blue', textDecoration: 'underline' }}>
            First Pinbar Bank — {time.year}
          </h1>
          <p style={{ fontStyle: 'italic', color: '#555', fontSize: '0.85rem', marginBottom: '4px' }}>
            Fixed-term deposits and government bonds for the discerning bar operator.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#8b0000', marginBottom: '8px' }}>
            ⚠ Funds are locked until maturity. If your bar closes before the term ends, locked deposits are forfeited.
          </p>
          <hr />

          {/* ── Investments ── */}
          <h2 style={{ fontSize: '1rem', margin: '12px 0 8px' }}>💰 Fixed-Term Deposits</h2>

          {activeInvestment ? (
            <div className="win95-card" style={{ marginBottom: '12px', background: '#f0fff0', borderColor: '#006400' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                {activeInvestment.productName} — In Progress
              </div>
              <div style={{ fontSize: '0.82rem', color: '#333' }}>
                Deposited: <strong>${activeInvestment.amount.toLocaleString()}</strong>
                {' → '}
                Returns: <strong style={{ color: '#006400' }}>${activeInvestment.returnAmount.toLocaleString()}</strong>
                {' '}(+${(activeInvestment.returnAmount - activeInvestment.amount).toLocaleString()})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#000080', marginTop: '6px' }}>
                {(() => {
                  const daysLeft = activeInvestment.maturesAt - currentLinDay;
                  if (daysLeft <= 0) return '✅ Matured — payout on next day advance';
                  const w = Math.floor(daysLeft / 3);
                  const d = daysLeft % 3;
                  return `⏳ Matures in ${[w > 0 && `${w}w`, d > 0 && `${d}d`].filter(Boolean).join(' ')}`;
                })()}
              </div>
            </div>
          ) : (
            <div className="marketplace-grid" style={{ marginBottom: '12px' }}>
              {INVESTMENT_DEFS.map(def => {
                const raw = parseInt(amounts[def.id], 10);
                const amount = Number.isFinite(raw) ? raw : 0;
                const returnAmt = Math.round(amount * (1 + def.interestRate));
                const profit = returnAmt - amount;
                const meetsMin = amount >= def.minAmount;
                const canAfford = cash >= amount && amount > 0;
                const canInvest = meetsMin && canAfford && !busy;
                return (
                  <div key={def.id} className="win95-card">
                    <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{def.icon}</div>
                    <div><strong>{def.name}</strong></div>
                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#555', margin: '4px 0 8px' }}>
                      {def.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#333', marginBottom: '8px' }}>
                      <div>Term: <strong>{def.durationWeeks} weeks</strong></div>
                      <div>Return: <strong style={{ color: '#006400' }}>+{Math.round(def.interestRate * 100)}%</strong></div>
                      <div>Minimum: ${def.minAmount.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>$</span>
                      <input
                        type="number"
                        value={amounts[def.id]}
                        min={def.minAmount}
                        max={cash}
                        step={100}
                        onChange={e => setAmounts(prev => ({ ...prev, [def.id]: e.target.value }))}
                        style={{ width: '90px', fontFamily: 'inherit', fontSize: '0.82rem', padding: '2px 4px', border: '2px inset #808080' }}
                      />
                    </div>
                    {meetsMin && canAfford && (
                      <div style={{ fontSize: '0.75rem', color: '#006400', marginBottom: '6px' }}>
                        +${profit.toLocaleString()} profit after {def.durationWeeks} weeks
                      </div>
                    )}
                    {!canAfford && amount > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#c00', marginBottom: '6px' }}>
                        Insufficient funds
                      </div>
                    )}
                    <button
                      className="win95-btn"
                      disabled={!canInvest}
                      onClick={() => onInvest(def.id, amount)}
                    >
                      {!meetsMin ? `Min $${def.minAmount.toLocaleString()}` : `Invest $${amount.toLocaleString()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <hr />

          {/* ── Loans ── */}
          <h2 style={{ fontSize: '1rem', margin: '12px 0 8px' }}>💸 Small Business Loans</h2>
          <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '10px' }}>
            Fixed-term · Equal weekly payments · No early repayment.
          </p>

          {activeLoan ? (
            <div className="win95-card" style={{ background: '#fff8f0', borderColor: '#c00' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                {LOAN_DEF.name} — Outstanding
              </div>
              <div style={{ fontSize: '0.82rem', color: '#c00', fontWeight: 'bold' }}>
                ${activeLoan.weeklyPayment.toLocaleString()} / week
              </div>
              <div style={{ fontSize: '0.8rem', color: '#444', marginTop: '4px' }}>
                {activeLoan.weeksRemaining} payment{activeLoan.weeksRemaining !== 1 ? 's' : ''} remaining
                {' · '}
                Total still owed: ${(activeLoan.weeklyPayment * activeLoan.weeksRemaining).toLocaleString()}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {LOAN_PRESETS.map(preset => {
                const total = Math.round(preset.amount * (1 + preset.totalInterestRate));
                const weekly = Math.round(total / preset.durationWeeks);
                return (
                  <div key={preset.amount} className="win95-card" style={{ minWidth: '140px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
                      ${preset.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#444', marginBottom: '2px' }}>
                      ${weekly.toLocaleString()} / week
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#c00', marginBottom: '8px' }}>
                      {preset.durationWeeks} weeks · ${total.toLocaleString()} total
                    </div>
                    <button
                      className="win95-btn"
                      disabled={busy}
                      onClick={() => onTakeLoan(preset)}
                    >
                      Borrow
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '14px', fontStyle: 'italic' }}>
            Loan payments are deducted automatically each week alongside operating expenses.
            Insufficient funds to cover a payment will result in insolvency proceedings.
          </p>
        </div>
      </div>
    </div>
  );
}
