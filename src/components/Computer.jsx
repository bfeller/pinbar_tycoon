import React, { useState, useEffect } from 'react';
import './Computer.css';
import { calculatePrice } from '../utils/economy';
import { getUsedBlurb } from '../data/used_blurbs';
import { UPGRADE_DEFS } from '../data/upgrades';
import { STAFF_DEFS } from '../data/staff';
import EmailClient from './EmailClient';
import BankWindow from './BankWindow';

function conditionLabel(durability) {
  if (durability >= 95) return { label: 'Mint',      color: '#006400' };
  if (durability >= 80) return { label: 'Excellent', color: '#2e7d32' };
  if (durability >= 65) return { label: 'Good',      color: '#827717' };
  if (durability >= 45) return { label: 'Playable',  color: '#e65100' };
  if (durability >= 25) return { label: 'Rough',     color: '#b71c1c' };
  return                       { label: 'Project',   color: '#7b1fa2' };
}

function toLinearDay({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}

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
  popularity = 0,
  franchises = [],
  franchiseMultiplier = 1,
  franchiseTotalEquipCost = 0,
  franchiseUnlockPop = 1500,
  franchiseSetupFee = 0.20,
  onOpenFranchise,
  onCloseFranchise,
  pinballPopularity = 60,
}) {
  const footTrafficMult = Math.max(0.05, Math.min(1.0, pinballPopularity / 100));
  const [booting, setBooting] = useState(true);
  const [activeWindow, setActiveWindow] = useState(null); // 'browser' | 'university' | 'email' | 'bank' | null
  const [purchasedItems, setPurchasedItems] = useState({});
  const [enrolledId, setEnrolledId] = useState(null);

  useEffect(() => {
    const audio = new Audio('/win31.mp3');
    audio.play().catch(() => {}); // silently ignore autoplay blocks
    const t = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const openBrowser = (tab) => {
    setMarketTab(tab);
    setActiveWindow('browser');
  };

  const handleEnroll = (def) => {
    const level = upgrades[def.id];
    const cost = def.costs[level];
    const ok = purchaseUpgrade(def.id, cost);
    if (ok) {
      setEnrolledId(def.id);
      setTimeout(() => setEnrolledId(null), 1500);
    }
  };

  const handlePurchaseMachine = (machine) => {
    buyMachine(machine);
    setPurchasedItems(prev => ({ ...prev, [machine.id]: true }));
    setTimeout(() => {
      setPurchasedItems(prev => ({ ...prev, [machine.id]: false }));
    }, 1500);
  };

  const handlePurchaseSupply = (type) => {
    buySupply(type);
    setPurchasedItems(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setPurchasedItems(prev => ({ ...prev, [type]: false }));
    }, 1500);
  };

  if (booting) {
    return (
      <div className="computer-overlay" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/microsoft-windows95.gif" alt="Starting Windows 95..." style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
      </div>
    );
  }

  return (
    <div className="computer-overlay">
      <div className="win95-desktop">
        <div className="win95-icons-wrap">
        <div className="win95-icons">
          <div className="win95-icon" onClick={() => openBrowser('pinball')}>
            <div className="icon-img">💻</div>
            <span>Pinball Net</span>
          </div>
          <div className="win95-icon" onClick={() => openBrowser('supplies')}>
            <div className="icon-img">🍺</div>
            <span>Bar Supplies</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('university')}>
            <div className="icon-img">🎓</div>
            <span>Open University</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('email')}>
            <div className="icon-img" style={{ position: 'relative' }}>
              📧
              {inbox.some(e => !e.read) && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {inbox.filter(e => !e.read).length}
                </span>
              )}
            </div>
            <span>Outlook Express</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('staff')}>
            <div className="icon-img">👥</div>
            <span>Staff</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('reports')}>
            <div className="icon-img">📊</div>
            <span>Reports</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('bank')}>
            <div className="icon-img">🏦</div>
            <span>Bank</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('medical')}>
            <div className="icon-img" style={{ position: 'relative' }}>
              ⚕
              {medicalBills.some(b => !b.paid && !b.autoDeducted && Math.floor((toLinearDay(time) - b.issuedLinearDay) / 3) >= 4) && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>!</span>
              )}
            </div>
            <span>Medical</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('credits')}>
            <div className="icon-img">ℹ️</div>
            <span>About</span>
          </div>
          <div className="win95-icon" onClick={() => setActiveWindow('settings')}>
            <div className="icon-img">⚙️</div>
            <span>Settings</span>
          </div>
          {popularity >= franchiseUnlockPop && (
            <div className="win95-icon" onClick={() => setActiveWindow('franchises')}>
              <div className="icon-img">🏪</div>
              <span>Franchises</span>
            </div>
          )}
        </div>
        </div>

        {activeWindow === 'browser' && (
          <div className="win95-window">
            <div className="win95-titlebar">
              <div className="title">Netscape Navigator - {marketTab === 'pinball' ? 'Pinball Net' : 'Bar Supplies'}</div>
              <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
            </div>
            <div className="win95-toolbar">
              <span>Address: http://www.{marketTab === 'pinball' ? 'pinball-net.com' : 'barsupplies.com'}</span>
              {franchiseMultiplier > 1 && (
                <span style={{ marginLeft: '12px', color: '#8b0000', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  ×{franchiseMultiplier} — buying for {franchiseMultiplier} location{franchiseMultiplier > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="win95-content">
              <div className="browser-page">
                <h1 style={{ color: 'blue', textDecoration: 'underline' }}>Welcome to {marketTab === 'pinball' ? 'Pinball Net' : 'Bar Supplies'}</h1>
                <hr />
                {marketTab === 'pinball' && (
                  <>
                    {dailyMarket.some(m => m.parsedYear === time.year) && (
                      <div className="market-section">
                        <h2 className="market-section-heading new-machines-heading">✦ New Machines</h2>
                        <div className="marketplace-grid">
                          {dailyMarket.filter(m => m.parsedYear === time.year).map(machine => {
                            const rawPrice = calculatePrice(machine.parsedYear, time.year, 100);
                            const basePrice = rawPrice ? Math.floor(rawPrice * (1 - purchaseDiscount)) : rawPrice;
                            const price = basePrice != null ? basePrice * franchiseMultiplier : null;
                            const isSoldOut = soldOutIds?.has(machine.id);
                            return (
                              <MachineCard
                                key={machine.id}
                                machine={machine}
                                price={price}
                                isNew={true}
                                isUsed={false}
                                isSoldOut={isSoldOut}
                                canAfford={price && cash >= price}
                                dayState={dayState}
                                purchased={purchasedItems[machine.id]}
                                onBuy={() => handlePurchaseMachine(machine)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {dailyMarket.some(m => m.parsedYear < time.year) && (
                      <div className="market-section">
                        <h2 className="market-section-heading used-machines-heading">◈ Used Machines</h2>
                        <div className="marketplace-grid">
                          {dailyMarket.filter(m => m.parsedYear < time.year).map(machine => {
                            const rawPrice = calculatePrice(machine.parsedYear, time.year, machine.durability ?? 100, machine.locationCount ?? 0);
                            const basePrice = rawPrice ? Math.floor(rawPrice * (1 - purchaseDiscount)) : rawPrice;
                            const price = basePrice != null ? basePrice * franchiseMultiplier : null;
                            const isSoldOut = soldOutIds?.has(machine.id);
                            return (
                              <MachineCard
                                key={machine.id}
                                machine={machine}
                                price={price}
                                isNew={false}
                                isUsed={true}
                                isSoldOut={isSoldOut}
                                canAfford={price && cash >= price}
                                dayState={dayState}
                                purchased={purchasedItems[machine.id]}
                                onBuy={() => handlePurchaseMachine(machine)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {liquidationLot && liquidationLot.length > 0 && (
                      <div className="market-section">
                        <h2 className="market-section-heading liquidation-heading">⚠ Bumper Zone Liquidation Sale</h2>
                        <p style={{ fontSize: '0.85rem', color: '#8b0000', marginBottom: '8px', fontStyle: 'italic' }}>
                          Reg Nutter is selling everything. 60% off market price. Stock won't last.
                        </p>
                        <div className="marketplace-grid">
                          {liquidationLot.map(machine => {
                            const rawPrice = calculatePrice(machine.parsedYear, time.year, machine.durability, machine.locationCount ?? 0);
                            const price = rawPrice ? Math.floor(rawPrice * 0.40 * franchiseMultiplier) : null;
                            return (
                              <MachineCard
                                key={machine.id}
                                machine={machine}
                                price={price}
                                isNew={false}
                                isUsed={true}
                                isSoldOut={false}
                                canAfford={price && cash >= price}
                                dayState={dayState}
                                purchased={purchasedItems[machine.id]}
                                onBuy={() => {
                                  if (buyLiquidationMachine(machine)) {
                                    setPurchasedItems(prev => ({ ...prev, [machine.id]: true }));
                                    setTimeout(() => setPurchasedItems(prev => ({ ...prev, [machine.id]: false })), 1500);
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {marketTab === 'supplies' && (
                  <div className="marketplace-grid">
                    {[
                      { type: 'kegerator', name: 'Kegerator',  base: 1000, desc: 'Essential for serving drinks.' },
                      { type: 'speed_well', name: 'Speed Well', base: 1500, desc: 'Makes cocktails. Slower than beer, but higher revenue. Cocktail demand starts in 1980.' },
                      { type: 'bartop',    name: 'Bartop',     base: 500,  desc: 'Where patrons order drinks.' },
                      { type: 'bathroom',  name: 'Bathroom',   base: 2000, desc: '2×2. Expected by patrons from 1976.' },
                    ].map(({ type, name, base, desc }) => {
                      const supplyPrice = base * franchiseMultiplier;
                      return (
                        <div key={type} className="win95-card">
                          <div><strong>{name}</strong></div>
                          <div style={{fontSize:'0.8rem'}}>{desc}</div>
                          <div style={{marginTop:'0.5rem'}}>Price: ${supplyPrice.toLocaleString()}</div>
                          <button
                            className="win95-btn"
                            disabled={cash < supplyPrice || dayState === 'REPORT'}
                            onClick={() => handlePurchaseSupply(type)}
                          >
                            {purchasedItems[type] ? 'Purchased!' : 'Order Now'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeWindow === 'university' && (
          <div className="win95-window">
            <div className="win95-titlebar">
              <div className="title">Netscape Navigator - Open University Online</div>
              <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
            </div>
            <div className="win95-toolbar">
              <span>Address: http://www.open-university.edu</span>
            </div>
            <div className="win95-content">
              <div className="browser-page">
                <h1 style={{ color: 'blue', textDecoration: 'underline' }}>Open University Online</h1>
                <p style={{ fontStyle: 'italic', color: '#555' }}>
                  Accredited distance learning for the modern bar operator. All courses self-paced. Tuition due on enrollment.
                </p>
                {purchaseDiscount > 0 && (
                  <p style={{ color: 'green', fontWeight: 'bold' }}>
                    ✓ Supply Chain discount active: {Math.round(purchaseDiscount * 100)}% off all machine purchases
                  </p>
                )}
                <hr />
                <div className="marketplace-grid">
                  {UPGRADE_DEFS.map(def => {
                    const level = upgrades[def.id] ?? 0;
                    const maxed = level >= def.maxLevel;
                    const anyEnrolled = enrolledCourses.length > 0;
                    const enrolled = enrolledCourses.find(c => c.id === def.id);
                    const cost = maxed ? null : def.costs[level];
                    const canAfford = cost && cash >= cost;
                    const justEnrolled = enrolledId === def.id;
                    const daysLeft = enrolled
                      ? toLinearDay(enrolled.completesAt) - toLinearDay(time)
                      : null;
                    return (
                      <div key={def.id} className="win95-card university-card">
                        <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{def.icon}</div>
                        <div><strong>{def.name}</strong></div>
                        <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#555', margin: '4px 0' }}>{def.flavor}</div>
                        <div className="upgrade-pips">
                          {Array.from({ length: def.maxLevel }).map((_, i) => (
                            <span key={i} className={`upgrade-pip ${i < level ? 'filled' : ''}`} />
                          ))}
                        </div>
                        {!maxed && !enrolled && (
                          <div style={{ fontSize: '0.75rem', color: '#333', margin: '4px 0' }}>
                            Next: {def.effect(level + 1)}
                          </div>
                        )}
                        {enrolled ? (
                          <div style={{ fontSize: '0.75rem', color: '#000080', margin: '4px 0', fontWeight: 'bold' }}>
                            📚 In progress — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                          </div>
                        ) : (
                          <button
                            className="win95-btn"
                            disabled={maxed || !canAfford || anyEnrolled || dayState === 'REPORT'}
                            onClick={() => handleEnroll(def)}
                          >
                            {justEnrolled ? 'Enrolled!' : maxed ? 'Completed' : `Enroll ($${cost?.toLocaleString()})`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeWindow === 'staff' && (() => {
          const effectiveSalary = (def) => def.id === 'repairman'
            ? def.weeklySalary + (upgrades?.tech_training ?? 0) * 100
            : def.weeklySalary;
          const weeklyPayroll = STAFF_DEFS.reduce((total, d) => {
            const val = staff?.[d.id] ?? 0;
            const count = typeof val === 'number' ? val : (val ? 1 : 0);
            return total + count * effectiveSalary(d);
          }, 0);
          return (
            <div className="win95-window">
              <div className="win95-titlebar">
                <div className="title">Staff Management</div>
                <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
              </div>
              <div className="win95-content">
                <div className="browser-page">
                  <h1 style={{ color: '#333', textDecoration: 'none', fontSize: '1.1rem', marginBottom: '4px' }}>Staff</h1>
                  <p style={{ fontSize: '0.82rem', color: '#555', marginBottom: '4px' }}>
                    Hire staff to automate operations. Salaries are deducted weekly.
                  </p>
                  {weeklyPayroll > 0 && (
                    <p style={{ fontSize: '0.82rem', color: '#c00', marginBottom: '12px', fontWeight: 'bold' }}>
                      Weekly payroll: ${weeklyPayroll.toLocaleString()}
                    </p>
                  )}
                  <hr />
                  <div className="marketplace-grid" style={{ marginTop: '12px' }}>
                    {STAFF_DEFS.map(def => {
                      const isCountable = def.maxCount !== undefined;
                      const count = isCountable ? (staff?.[def.id] ?? 0) : 0;
                      const hired = isCountable ? count > 0 : (staff?.[def.id] ?? false);
                      const maxCount = def.maxCount ?? 1;
                      const atMax = isCountable ? count >= maxCount : hired;
                      const salary = effectiveSalary(def);
                      const weeklyTotal = isCountable ? count * salary : (hired ? salary : 0);
                      return (
                        <div key={def.id} className="win95-card" style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{def.icon} {def.name}</div>
                            <span style={{
                              fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px',
                              background: hired ? '#006400' : '#888', color: '#fff', letterSpacing: '0.05em'
                            }}>
                              {isCountable ? `${count} / ${maxCount}` : (hired ? 'EMPLOYED' : 'VACANT')}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#444', margin: '0 0 6px 0', fontStyle: 'italic' }}>{def.description}</p>
                          <ul style={{ margin: '0 0 8px 0', paddingLeft: '18px', fontSize: '0.78rem', color: '#333' }}>
                            {def.effects.map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                          <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '8px' }}>
                            ${salary.toLocaleString()}/week each
                            {weeklyTotal > 0 && <span style={{ color: '#c00', marginLeft: '6px' }}>— ${weeklyTotal.toLocaleString()}/week total</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {hired && (
                              <button
                                className="win95-btn"
                                style={{ background: '#c0c0c0', color: '#333' }}
                                disabled={dayState === 'RUNNING'}
                                onClick={() => onFireStaff(def.id)}
                              >
                                {isCountable ? 'Let One Go' : 'Let Go'}
                              </button>
                            )}
                            {!atMax && (
                              <button
                                className="win95-btn"
                                disabled={dayState === 'RUNNING'}
                                onClick={() => onHireStaff(def.id)}
                              >
                                {isCountable && count > 0 ? 'Hire Another' : 'Hire'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {activeWindow === 'reports' && (() => {
          const sorted = [...financialHistory].reverse();
          const totalIncome = financialHistory.reduce((s, r) => s + r.income, 0);
          const totalExpenses = financialHistory.reduce((s, r) => s + r.totalExpenses, 0);
          const totalNet = totalIncome - totalExpenses;
          return (
            <div className="win95-window">
              <div className="win95-titlebar">
                <div className="title">📊 Performance Reports</div>
                <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
              </div>
              <div className="win95-toolbar">
                <span>Financial history — all time</span>
              </div>
              <div className="win95-content" style={{ padding: 0 }}>
                {financialHistory.length === 0 ? (
                  <p style={{ padding: '16px', fontFamily: 'MS Sans Serif, sans-serif', color: '#555', fontStyle: 'italic' }}>
                    No data yet — complete your first day to see your report.
                  </p>
                ) : (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Income</th>
                        <th>Expenses</th>
                        <th>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'reports-row-even' : ''}>
                          <td>{row.year} W{row.week} D{row.day}</td>
                          <td className="reports-num">${row.income.toLocaleString()}</td>
                          <td className="reports-num">{row.totalExpenses > 0 ? `-$${row.totalExpenses.toLocaleString()}` : '—'}</td>
                          <td className="reports-num" style={{ color: row.net > 0 ? '#006400' : row.net < 0 ? '#8b0000' : '#555', fontWeight: 'bold' }}>
                            {row.net >= 0 ? '+' : ''}${row.net.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="reports-total-row">
                        <td><strong>TOTAL</strong></td>
                        <td className="reports-num"><strong>${totalIncome.toLocaleString()}</strong></td>
                        <td className="reports-num"><strong>-${totalExpenses.toLocaleString()}</strong></td>
                        <td className="reports-num" style={{ color: totalNet >= 0 ? '#006400' : '#8b0000' }}>
                          <strong>{totalNet >= 0 ? '+' : ''}${totalNet.toLocaleString()}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          );
        })()}

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

        {activeWindow === 'bank' && (
          <BankWindow
            cash={cash}
            dayState={dayState}
            time={time}
            activeInvestment={activeInvestment}
            activeLoan={activeLoan}
            onInvest={onInvest}
            onTakeLoan={onTakeLoan}
            onClose={() => setActiveWindow(null)}
          />
        )}

        {activeWindow === 'credits' && (
          <div className="win95-window">
            <div className="win95-titlebar">
              <div className="title">ℹ️ About Pinbar Tycoon</div>
              <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
            </div>
            <div className="win95-content">
              <div className="browser-page">
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img src="/favicon.svg" alt="Pinbar Tycoon" style={{ width: '64px', height: '64px', display: 'block', margin: '0 auto 8px' }} />
                  <h1 style={{ color: '#000080', textDecoration: 'none', fontSize: '1.3rem', margin: 0 }}>Pinbar Tycoon</h1>
                  <p style={{ fontSize: '0.8rem', color: '#555', margin: '4px 0 0' }}>The pinball bar management simulation</p>
                </div>
                <hr />
                <h2 style={{ fontSize: '1rem', color: '#000080', marginBottom: '6px' }}>Credits &amp; Attribution</h2>
                <div className="marketplace-grid">
                  <div className="win95-card">
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
                      🎱 Pinball Machine Data
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#333', margin: '0 0 8px' }}>
                      All pinball machine names, manufacturers, release years, and images are sourced from the{' '}
                      <strong>Open Pinball Database (OPDB)</strong> — a community-maintained registry of pinball machines from around the world.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#333', margin: '0 0 8px' }}>
                      This game uses a static snapshot of OPDB data. No API calls are made at runtime.
                    </p>
                    <a
                      href="https://opdb.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.85rem', color: '#000080', textDecoration: 'underline', fontWeight: 'bold' }}
                    >
                      Visit opdb.org ↗
                    </a>
                  </div>
                  <div className="win95-card">
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
                      🛠️ Built With
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: '#333', margin: 0, paddingLeft: '18px' }}>
                      <li>React 18 + Vite</li>
                      <li>Claude Code — most of this was written by AI</li>
                      <li>OPDB for pinball machine data</li>
                    </ul>
                  </div>
                  <div className="win95-card">
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
                      🙏 Thank You
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#333', margin: 0 }}>
                      A huge thanks to the OPDB contributors and maintainers who keep the pinball database accurate,
                      comprehensive, and freely available. This game literally could not exist without their work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeWindow === 'settings' && (
          <div className="win95-window">
            <div className="win95-titlebar">
              <div className="title">⚙️ Settings</div>
              <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
            </div>
            <div className="win95-content">
              <div className="win95-card">
                <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px' }}>Gameplay</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={fastForward}
                    onChange={e => setFastForward(e.target.checked)}
                    style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span>Fast Forward — day runs at 2× speed</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeWindow === 'email' && (
          <EmailClient
            emails={inbox}
            onChoice={onEmailChoice}
            onRead={onEmailRead}
            characterName={characterName}
            onClose={() => setActiveWindow(null)}
          />
        )}

        {activeWindow === 'franchises' && (() => {
          const last6 = financialHistory.slice(-6);
          const avgDailyIncome = last6.length
            ? Math.round(last6.reduce((s, r) => s + r.income, 0) / last6.length)
            : 0;
          const setupFee = Math.floor(franchiseTotalEquipCost * franchiseSetupFee);
          const franchiseCost = franchiseTotalEquipCost + setupFee;
          const totalPassiveIncome = franchises.reduce((s, f) => s + f.templateDailyIncome, 0);
          const canOpen = franchiseTotalEquipCost > 0 && cash >= franchiseCost;
          return (
            <div className="win95-window">
              <div className="win95-titlebar">
                <div className="title">🏪 Franchise Manager</div>
                <button className="win95-close" onClick={() => setActiveWindow(null)}>X</button>
              </div>
              <div className="win95-content" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>

                <div className="win95-panel">
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Open New Franchise</div>
                  {franchiseTotalEquipCost === 0 ? (
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>Place machines on the main floor first.</div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.85rem' }}>Equipment value: ${franchiseTotalEquipCost.toLocaleString()}</div>
                      <div style={{ fontSize: '0.85rem' }}>Setup fee (20%): ${setupFee.toLocaleString()}</div>
                      <div style={{ marginTop: '4px' }}>Total cost: <strong>${franchiseCost.toLocaleString()}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#555', margin: '4px 0 6px' }}>
                        New franchise will earn ${avgDailyIncome.toLocaleString()}/day based on current bar performance.
                        All future machine purchases will cost ×{franchiseMultiplier + 1} (equipping {franchiseMultiplier + 1} locations).
                      </div>
                      <button
                        className="win95-btn"
                        disabled={!canOpen || dayState === 'REPORT'}
                        onClick={onOpenFranchise}
                      >
                        {cash < franchiseCost ? `Need $${(franchiseCost - cash).toLocaleString()} more` : 'Open Franchise'}
                      </button>
                    </>
                  )}
                </div>

                <div className="win95-panel">
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Bar Performance — last 6 days</div>
                  <div>Avg daily income: <strong>${avgDailyIncome.toLocaleString()}</strong></div>
                  <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px' }}>
                    Pinball popularity: <strong style={{ color: pinballPopularity >= 70 ? '#006400' : pinballPopularity >= 40 ? '#b35900' : '#8b0000' }}>{pinballPopularity}%</strong>
                    {franchises.length > 0 && (
                      <span> · Passive franchise income: <strong>${totalPassiveIncome.toLocaleString()}/day</strong></span>
                    )}
                  </div>
                </div>

                {franchises.length > 0 && (
                  <div className="win95-panel">
                    <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Active Franchises ({franchises.length})</div>
                    {franchises.map(f => {
                      const refund = Math.floor(f.openingCost * 0.50);
                      return (
                        <div key={f.id} style={{ borderBottom: '1px solid #999', padding: '5px 0', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{f.name}</div>
                          <div>Opened: {f.openedAt.year} · {f.machineCount} machine{f.machineCount !== 1 ? 's' : ''}</div>
                          <div>Daily income: <strong>${f.templateDailyIncome.toLocaleString()}</strong> · Opening cost: ${f.openingCost.toLocaleString()}</div>
                          <button
                            className="win95-btn"
                            style={{ marginTop: '4px', color: '#8b0000' }}
                            onClick={() => onCloseFranchise(f.id)}
                          >
                            Close — recover ${refund.toLocaleString()}
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: '6px', fontWeight: 'bold' }}>
                      Total passive income: ${totalPassiveIncome.toLocaleString()}/day
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })()}

        <div className="win95-taskbar">
          <button className="win95-start-btn" onClick={closeComputer}>
            <span style={{fontWeight: 'bold', marginRight: '5px'}}>Start</span> (Turn Off)
          </button>
          {(activeWindow === 'browser' || activeWindow === 'university') && (
            <div className="taskbar-item active">Netscape Navigator</div>
          )}
          {activeWindow === 'email' && (
            <div className="taskbar-item active">Outlook Express</div>
          )}
          {activeWindow === 'staff' && (
            <div className="taskbar-item active">Staff Management</div>
          )}
          {activeWindow === 'reports' && (
            <div className="taskbar-item active">Performance Reports</div>
          )}
          {activeWindow === 'bank' && (
            <div className="taskbar-item active">First Pinbar Bank</div>
          )}
          {activeWindow === 'medical' && (
            <div className="taskbar-item active">St. Agatha's Billing</div>
          )}
          {activeWindow === 'credits' && (
            <div className="taskbar-item active">About Pinbar Tycoon</div>
          )}
          {activeWindow === 'settings' && (
            <div className="taskbar-item active">Settings</div>
          )}
          {activeWindow === 'franchises' && (
            <div className="taskbar-item active">Franchise Manager</div>
          )}
          <div className="taskbar-tray">
            <div className="taskbar-cash">${cash.toLocaleString()}</div>
            <div className="taskbar-time">{time.year}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MachineCard({ machine, price, isNew, isUsed, isSoldOut, canAfford, dayState, purchased, onBuy }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`win95-card ${isUsed ? 'win95-card-used' : ''}`}>
      {machine.imageUrl && !imgError && (
        <img
          src={machine.imageUrl}
          alt={machine.name}
          className="machine-card-img"
          onError={() => setImgError(true)}
        />
      )}
      <div>
        <strong>{machine.name}</strong>
        {isNew && <span className="new-badge">NEW!</span>}
      </div>
      <div style={{fontSize:'0.8rem', color:'#555'}}>{machine.supplementary} · {machine.parsedYear}</div>
      {isUsed && (
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'3px'}}>
          {(() => {
            const { label, color } = conditionLabel(machine.durability ?? 100);
            return <span style={{fontSize:'0.75rem', fontWeight:'bold', color, border:`1px solid ${color}`, padding:'1px 5px'}}>{label}</span>;
          })()}
          {machine.locationCount > 0 && (
            <span style={{fontSize:'0.85rem', color:'#006400', letterSpacing:'1px'}}>
              {'★'.repeat(Math.min(5, Math.ceil(Math.log1p(machine.locationCount) / Math.log1p(1200) * 5)))}{'☆'.repeat(5 - Math.min(5, Math.ceil(Math.log1p(machine.locationCount) / Math.log1p(1200) * 5)))}
            </span>
          )}
        </div>
      )}
      {isUsed && (
        <div className="used-blurb">"{getUsedBlurb(machine.id)}"</div>
      )}
      {machine.description && (
        <div className="machine-description">{machine.description}</div>
      )}
      <div style={{marginTop:'0.5rem'}}>Price: ${price?.toLocaleString()}</div>
      <button
        className="win95-btn"
        disabled={isSoldOut || !canAfford || dayState === 'REPORT'}
        onClick={onBuy}
      >
        {isSoldOut ? 'Out of Stock' : purchased ? 'Purchased!' : 'Order Now'}
      </button>
    </div>
  );
}
