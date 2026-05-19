import React from 'react';
import './ReportModal.css';

const UNSATISFIED_REASONS = {
  patience_pinball:   'Gave up waiting for a machine',
  patience_bartop:    'Gave up waiting at the bar',
  patience_bathroom:  'Gave up waiting for the bathroom',
  drink_wait:         'Waited too long for a drink',
  no_bathroom:        'No bathroom in the bar',
  bar_closed_pinball: 'Bar closed — still wanted to play',
  bar_closed_drink:   'Bar closed — still wanted a drink',
  bar_closed_bathroom:'Bar closed — still needed the bathroom',
};

const LOG_MAX = Math.log1p(1200);

export default function ReportModal({
  dailyReport, machines, popularity, repairsRemaining, cash, repairMachine, nextDay, upcomingExpenses = []
}) {
  const machineScore = Math.floor(
    machines
      .filter(m => m.type === 'pinball' && m.room === 'main' && m.x !== null)
      .reduce((sum, m) => sum + 1 + (Math.log1p(m.locationCount ?? 0) / LOG_MAX) * 2, 0)
  );
  const customerDelta = (dailyReport.satisfied ?? 0) - (dailyReport.unsatisfied ?? 0);
  const popularityDelta = machineScore + customerDelta;
  return (
    <div className="report-modal-overlay">
       <div className="report-modal">
         <div className="report-modal-titlebar">📊 End of Day Report</div>
         <div className="report-modal-body">
         <p style={{fontSize: '1.2rem', color: '#006400'}}>Daily Income: <strong>+${dailyReport.income}</strong></p>
         <div style={{marginTop: '0.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
           <span style={{color: '#000000'}}>★ Popularity: {popularity} <span style={{fontSize:'0.85rem', color: popularityDelta >= 0 ? '#006400' : '#cc0000'}}>({popularityDelta >= 0 ? '+' : ''}{popularityDelta})</span></span>
           <span style={{fontSize: '0.85rem', color: '#444444'}}>
             {machineScore} machines · {dailyReport.satisfied ?? 0} satisfied · {dailyReport.unsatisfied ?? 0} unsatisfied
             {(dailyReport.forgiven ?? 0) > 0 && (
               <span style={{color: '#006400', marginLeft: '0.5rem'}}>· {dailyReport.forgiven} forgiven 🤝</span>
             )}
           </span>
         </div>
         {(dailyReport.unsatisfied ?? 0) > 0 && dailyReport.unsatisfiedReasons && (() => {
           const top3 = Object.entries(dailyReport.unsatisfiedReasons)
             .sort((a, b) => b[1] - a[1])
             .slice(0, 3);
           if (top3.length === 0) return null;
           return (
             <div style={{ marginTop: '6px', padding: '6px 8px', borderTop: '2px solid #808080', borderLeft: '2px solid #808080', borderBottom: '2px solid #ffffff', borderRight: '2px solid #ffffff', background: '#ffffff' }}>
               <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444444', marginBottom: '0.35rem' }}>Why they left unhappy</div>
               {top3.map(([key, count]) => (
                 <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: '#000000', marginBottom: '0.15rem' }}>
                   <span>{UNSATISFIED_REASONS[key] ?? key}</span>
                   <span style={{ color: '#cc0000', marginLeft: '1rem', flexShrink: 0 }}>{count}×</span>
                 </div>
               ))}
             </div>
           );
         })()}
         {dailyReport.completedCourses?.length > 0 && (
           <div style={{marginTop: '8px', padding: '6px 8px', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderBottom: '2px solid #808080', borderRight: '2px solid #808080', background: '#c0c0c0'}}>
             <div style={{color: '#006400', fontWeight: 'bold', marginBottom: '0.4rem'}}>🎓 Courses Completed</div>
             {dailyReport.completedCourses.map((c, i) => (
               <div key={i} style={{color: '#000000'}}>{c.icon} {c.name}</div>
             ))}
           </div>
         )}
         {dailyReport.events?.length > 0 && (
           <div style={{ marginTop: '1rem' }}>
             <p style={{ color: '#444444', marginBottom: '0.4rem' }}>Events:</p>
             {dailyReport.events.map((e, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem' }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: e.severity === 'good' ? '#006400' : e.severity === 'bad' ? '#cc0000' : '#444444', flexShrink: 0 }}>
                   {e.label}
                 </span>
                 <span style={{ fontSize: '0.85rem', color: '#000000' }}>{e.message}</span>
               </div>
             ))}
           </div>
         )}

         {dailyReport.expenses?.length > 0 && (
           <div style={{ marginTop: '1rem', padding: '0.75rem', borderTop: '2px solid #808080', borderLeft: '2px solid #808080', borderBottom: '2px solid #ffffff', borderRight: '2px solid #ffffff', background: '#ffffff' }}>
             <div style={{ color: '#cc0000', fontWeight: 'bold', marginBottom: '0.4rem' }}>
               Bills Due — <span style={{ fontWeight: 400 }}>-${dailyReport.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
             </div>
             {dailyReport.expenses.map((e, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#000000', marginBottom: '0.2rem' }}>
                 <span>{e.icon} {e.name}</span>
                 <span style={{ color: '#cc0000' }}>-${e.amount.toLocaleString()}</span>
               </div>
             ))}
           </div>
         )}

         <p style={{marginTop: '1.5rem', color: '#444444'}}>Machines Damaged:</p>
         <ul>
           {dailyReport.damage.length === 0 ? <li>No damage today!</li> : dailyReport.damage.map((d, i) => {
             const machineState = machines.find(m => m.id === d.id);
             const currentDur = machineState ? machineState.durability : d.currentDurability;
             const isRepaired = currentDur === 100;
             const damageToFix = Math.min(repairsRemaining, 100 - currentDur);
             const cost = damageToFix * 10;
             const canRepair = !isRepaired && repairsRemaining > 0 && cash >= cost;

             return (
               <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.5rem', background: '#c0c0c0', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderBottom: '2px solid #808080', borderRight: '2px solid #808080' }}>
                 <div style={{textAlign: 'left'}}>
                   <div style={{color: '#000000', fontWeight: 'bold'}}>{d.name}</div>
                   <div style={{fontSize: '0.8rem', color: isRepaired ? '#006400' : '#cc0000'}}>
                     {isRepaired ? '100% Intact' : `-${d.damageTaken}% (Now ${currentDur}%)`}
                   </div>
                 </div>
                 <button
                   className="repair-btn"
                   disabled={!canRepair}
                   onClick={() => repairMachine(d.id)}
                 >
                   {isRepaired ? '100%' : repairsRemaining === 0 ? 'No Capacity' : `Repair +${damageToFix}% ($${cost})`}
                 </button>
               </li>
             );
           })}
         </ul>
         {dailyReport.repairmanRepairs?.length > 0 && (
           <div style={{ marginTop: '1rem', padding: '0.75rem', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderBottom: '2px solid #808080', borderRight: '2px solid #808080', background: '#c0c0c0' }}>
             <div style={{ color: '#006400', fontWeight: 'bold', marginBottom: '0.4rem' }}>🔧 Overnight Repairs</div>
             {dailyReport.repairmanRepairs.map((r, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#000000', marginBottom: '0.2rem' }}>
                 <span>{r.name}</span>
                 <span style={{ color: '#006400' }}>+{r.gain}%</span>
               </div>
             ))}
           </div>
         )}
         {upcomingExpenses.length > 0 && (() => {
           const total = upcomingExpenses.reduce((s, e) => s + e.amount, 0);
           const cashAfter = cash - total;
           return (
             <div style={{ marginTop: '1rem', padding: '0.75rem', borderTop: '2px solid #808080', borderLeft: '2px solid #808080', borderBottom: '2px solid #ffffff', borderRight: '2px solid #ffffff', background: '#ffffff' }}>
               <div style={{ color: '#cc0000', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                 ⚠️ Bills Due Tomorrow — <span style={{ fontWeight: 400 }}>-${total.toLocaleString()}</span>
               </div>
               {upcomingExpenses.map((e, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#000000', marginBottom: '0.2rem' }}>
                   <span>{e.icon} {e.name}</span>
                   <span style={{ color: '#cc0000' }}>-${e.amount.toLocaleString()}</span>
                 </div>
               ))}
               <div style={{ marginTop: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: cashAfter < 0 ? '#cc0000' : '#006400' }}>
                 Cash after: ${cashAfter.toLocaleString()} {cashAfter < 0 ? '— You cannot cover these bills.' : ''}
               </div>
             </div>
           );
         })()}
         <button className="start-day-btn" onClick={nextDay}>
           {upcomingExpenses.length > 0 && (cash - upcomingExpenses.reduce((s, e) => s + e.amount, 0)) < 0
             ? '💀 Go Bankrupt'
             : 'Next Day'}
         </button>
         </div>{/* end report-modal-body */}
       </div>
     </div>
  );
}
