import React from 'react';
import './ReportModal.css';

export default function ReportModal({
  dailyReport, machines, repairsRemaining, cash, repairMachine, nextDay
}) {
  return (
    <div className="report-modal-overlay">
       <div className="report-modal">
         <h2>End of Day Report</h2>
         <p style={{fontSize: '1.2rem', color: '#10b981'}}>Daily Income: <strong>+${dailyReport.income}</strong></p>
         <p style={{marginTop: '1.5rem', color: '#94a3b8'}}>Machines Damaged:</p>
         <ul>
           {dailyReport.damage.length === 0 ? <li>No damage today!</li> : dailyReport.damage.map((d, i) => {
             const machineState = machines.find(m => m.id === d.id);
             const currentDur = machineState ? machineState.durability : d.currentDurability;
             const isRepaired = currentDur === 100;
             const damageToFix = Math.min(repairsRemaining, 100 - currentDur);
             const cost = damageToFix * 10;
             const canRepair = !isRepaired && repairsRemaining > 0 && cash >= cost;

             return (
               <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                 <div style={{textAlign: 'left'}}>
                   <div style={{color: '#f8fafc', fontWeight: 'bold'}}>{d.name}</div>
                   <div style={{fontSize: '0.8rem', color: isRepaired ? '#10b981' : '#f87171'}}>
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
         <button className="start-day-btn" onClick={nextDay}>Next Day</button>
       </div>
     </div>
  );
}
