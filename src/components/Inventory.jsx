import React from 'react';
import './Inventory.css';
import { calculatePrice } from '../utils/economy';
import GameGrid from './GameGrid';
import { BACKROOM_COLS } from '../constants';

export default function Inventory({
  backroomMachines, backroomRows, dayState, cash, repairsRemaining, time, hoveredCell,
  placementMachine, placementRotation, repairMachine, sellMachine, handleCellClick, setHoveredCell,
  placementMachineType
}) {
  return (
    <div className="inventory-panel" style={{opacity: dayState === 'REPORT' ? 0.5 : 1}}>
       <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Back Room (Storage)</h3>
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
             {backroomMachines.map(m => (
               <div key={m.id} className="inventory-item" style={{ width: '100%', marginBottom: '10px' }}>
                 <div style={{fontWeight: 'bold'}}>{m.name}</div>
                 <div style={{fontSize: '0.8rem'}}>{m.durability}% Durability</div>
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
                    <button className="repair-btn" style={{background: '#ef4444'}} disabled={dayState === 'REPORT'} onClick={() => sellMachine(m)}>Sell (${calculatePrice(m.year, time.year, m.durability, m.locationCount ?? 0)})</button>
                 </div>
               </div>
             ))}
             {backroomMachines.length === 0 && <div style={{color: '#94a3b8', fontStyle: 'italic'}}>Storage empty.</div>}
           </div>
         </div>
       </div>
    </div>
  );
}
