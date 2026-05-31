import React from 'react';
import './Inventory.css';
import { calculatePrice } from '../utils/economy';
import GameGrid from './GameGrid';
import { BACKROOM_COLS } from '../constants';

export default function Inventory({
  backroomMachines, backroomRows, dayState, cash, repairsRemaining, time, hoveredCell,
  placementMachine, placementRotation, repairMachine, sellMachine, handleCellClick, setHoveredCell,
  placementMachineType, pinballPopularity = 100,
}) {
  return (
    <div className="inventory-panel" style={{opacity: dayState === 'REPORT' ? 0.5 : 1}}>
       <h3 style={{ margin: '0 0 10px 0', color: '#000000' }}>Back Room (Storage)</h3>
       <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
         <GameGrid
            machines={backroomMachines}
            hoveredCell={hoveredCell}
            placementMachine={placementMachine}
            placementRotation={placementRotation}
            handleCellClick={handleCellClick}
            setHoveredCell={setHoveredCell}
            cols={BACKROOM_COLS}
            rows={backroomRows}
            showDoor={false}
            gridId="backroom"
            placementMachineType={placementMachineType}
         />
         <div style={{ flex: 1 }}>
           <h4 style={{marginTop: 0}}>Machine Actions</h4>
           <div className="inventory-list" style={{ marginTop: 0 }}>
             {backroomMachines.map(m => {
               const rawSellValue = calculatePrice(m.year, time.year, m.durability, m.locationCount ?? 0, m.type);
               const locationCount = m.locationCount ?? 0;
               const isPinball = m.type === 'pinball' || !m.type;
               const sellValue = isPinball ? Math.floor(rawSellValue * (pinballPopularity / 100)) : rawSellValue;
               const machineEquiv = isPinball
                 ? +(1 + (Math.log1p(locationCount) / Math.log1p(1200)) * 4).toFixed(1)
                 : null;
               return (
               <div key={m.id} className="inventory-item" style={{ width: '100%', marginBottom: '10px' }}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                   <div style={{fontWeight: 'bold'}}>{m.name}</div>
                   <a href={`https://opdb.org/machines/${m.id}`} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.72rem', color: '#000080', textDecoration: 'underline'}}>OPDB ↗</a>
                 </div>
                 <div style={{fontSize: '0.8rem'}}>{m.durability}% Durability</div>
                 <div style={{fontSize: '0.8rem', color: '#333', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                   <span>
                     Market Value: ${sellValue.toLocaleString()}
                     {isPinball && pinballPopularity < 100 && (
                       <span style={{ color: '#8b0000', fontSize: '0.75rem', marginLeft: '4px' }}>
                         ({pinballPopularity}% pinball market)
                       </span>
                     )}
                   </span>
                   {isPinball && <span>{locationCount.toLocaleString()} locations</span>}
                   {machineEquiv !== null && <span>Pop. weight: {machineEquiv}×</span>}
                 </div>
                 <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                    {m.durability < 100 && (() => {
                      const damageToFix = Math.min(repairsRemaining, 100 - m.durability);
                      const cost = damageToFix * 10;
                      return (
                        <button className="repair-btn" disabled={cash < cost || dayState === 'RUNNING' || repairsRemaining === 0} onClick={() => repairMachine(m.id)}>
                          {repairsRemaining === 0 ? 'No Capacity' : `Repair +${damageToFix}% ($${cost})`}
                        </button>
                      );
                    })()}
                    <button className="repair-btn" style={{background: '#ef4444'}} disabled={dayState === 'REPORT'} onClick={() => sellMachine(m)}>Sell (${sellValue})</button>
                 </div>
               </div>
               );
             })}
             {backroomMachines.length === 0 && <div style={{color: '#444444', fontStyle: 'italic'}}>Storage empty.</div>}
           </div>
         </div>
       </div>
    </div>
  );
}
