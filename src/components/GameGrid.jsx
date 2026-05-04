import React from 'react';
import './GameGrid.css';
import { CELL_SIZE, GRID_COLS, GRID_ROWS, DOOR_POS } from '../constants';
import { getMachineCells } from '../utils/grid';

export default function GameGrid({
  machines, customers = [], bartender = null, hoveredCell, placementMachine, placementRotation,
  handleCellClick, setHoveredCell, cols = GRID_COLS, rows = GRID_ROWS, showDoor = true,
  gridId = 'main', placementMachineType = null
}) {
  const placedMachines = machines.filter(m => m.x !== null && m.y !== null);

  const renderCells = () => {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const isDoor = showDoor && x === DOOR_POS.x && y === DOOR_POS.y;
        cells.push(
          <div 
            key={`${x}-${y}`} 
            className={`grid-cell ${isDoor ? 'door' : ''}`}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => setHoveredCell({ x, y, gridId })}
            style={{ 
              left: x * CELL_SIZE, 
              top: y * CELL_SIZE, 
              width: CELL_SIZE, 
              height: CELL_SIZE 
            }}
          >
            {isDoor && <div style={{fontSize: '10px', textAlign: 'center', marginTop: '15px'}}>DOOR</div>}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="bar-grid" style={{ width: cols * CELL_SIZE, height: rows * CELL_SIZE }}>
      {renderCells()}
      
      {/* Placement preview ghost */}
      {placementMachine && hoveredCell && hoveredCell.gridId === gridId && (() => {
        const type = placementMachineType;
        const mCells = getMachineCells(type, hoveredCell.x, hoveredCell.y, placementRotation);
        
        const isOOB = mCells.some(c => c.x < 0 || c.x >= cols || c.y < 0 || c.y >= rows);
        const isOccupied = !isOOB && mCells.some(c => placedMachines.some(pm => {
          const pmCells = getMachineCells(pm.type, pm.x, pm.y, pm.orientation);
          return pmCells.some(pc => pc.x === c.x && pc.y === c.y);
        }));

        if (isOOB) return null;

        const minX = Math.min(mCells[0].x, mCells[1]?.x ?? mCells[0].x);
        const minY = Math.min(mCells[0].y, mCells[1]?.y ?? mCells[0].y);
        const isVertical = placementRotation === 'N' || placementRotation === 'S';
        const wCells = mCells.length === 2 && !isVertical ? 2 : 1;
        const hCells = mCells.length === 2 && isVertical ? 2 : 1;
        
        const frontSideStyle = {
          position: 'absolute',
          [placementRotation === 'N' ? 'bottom' : placementRotation === 'S' ? 'top' : placementRotation === 'E' ? 'left' : 'right']: 0,
          width: isVertical ? '100%' : '50%',
          height: isVertical ? '50%' : '100%',
          background: 'rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#fff'
        };

        return (
          <div 
            style={{ 
              position: 'absolute',
              left: minX * CELL_SIZE, 
              top: minY * CELL_SIZE, 
              width: wCells * CELL_SIZE, 
              height: hCells * CELL_SIZE,
              background: isOccupied ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)',
              border: `2px dashed ${isOccupied ? '#ef4444' : '#60a5fa'}`,
              pointerEvents: 'none',
              zIndex: 30,
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          >
             {(!type || type === 'pinball' || type === 'bartop') && <div style={frontSideStyle}>PLAY SIDE</div>}
          </div>
        )
      })()}

      {/* Placed machines */}
      {placedMachines.map(m => {
        const mCells = getMachineCells(m.type, m.x, m.y, m.orientation);
        const minX = Math.min(mCells[0].x, mCells[1]?.x ?? mCells[0].x);
        const minY = Math.min(mCells[0].y, mCells[1]?.y ?? mCells[0].y);
        const isVertical = m.orientation === 'N' || m.orientation === 'S';
        const wCells = mCells.length === 2 && !isVertical ? 2 : 1;
        const hCells = mCells.length === 2 && isVertical ? 2 : 1;
        
        const frontSideStyle = {
          position: 'absolute',
          [m.orientation === 'N' ? 'bottom' : m.orientation === 'S' ? 'top' : m.orientation === 'E' ? 'left' : 'right']: 0,
          width: isVertical ? '100%' : '50%',
          height: isVertical ? '50%' : '100%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#fff',
          pointerEvents: 'none'
        };

        return (
          <div 
            key={m.id} 
            className={`machine-placed ${m.durability <= 20 ? 'broken' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleCellClick(m.x, m.y); }}
            style={{ 
              left: minX * CELL_SIZE, 
              top: minY * CELL_SIZE, 
              width: wCells * CELL_SIZE, 
              height: hCells * CELL_SIZE 
            }}
            title={`${m.name} - ${m.durability}% Durability`}
          >
             {(!m.type || m.type === 'pinball' || m.type === 'bartop') && <div style={frontSideStyle}>PLAY SIDE</div>}
             {m.type !== 'kegerator' && m.type !== 'bartop' && <div className="durability-mini-bar" style={{height: `${m.durability}%`, background: m.durability > 50 ? '#10b981' : '#ef4444'}}></div>}
          </div>
        )
      })}

      {/* Customers */}
      {customers.map(c => {
        const isWaiting = c.status === 'waiting_for_pinball' || c.status === 'waiting_for_bartop' || c.status === 'walking_to_wait_area';
        const patiencePct = c.patienceTicks !== undefined ? (c.patienceTicks / 30) * 100 : 100;
        const isImpatient = isWaiting && patiencePct < 33;
        const statusClass = c.status === 'drinking' ? 'drinking' : isImpatient ? 'impatient' : isWaiting ? 'waiting' : '';

        return (
          <div 
            key={c.id} 
            className={`customer-entity ${statusClass}`}
            style={{
              left: c.x * CELL_SIZE,
              top: c.y * CELL_SIZE
            }}
            title={isWaiting ? `Waiting (${Math.ceil(patiencePct)}% patience)` : c.status}
          >
            {isWaiting && (
              <div style={{
                position: 'absolute',
                bottom: -4,
                left: 2,
                width: 26,
                height: 3,
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${patiencePct}%`,
                  height: '100%',
                  background: isImpatient ? '#ef4444' : '#fbbf24',
                  transition: 'width 0.2s',
                  borderRadius: 2
                }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Bartender */}
      {bartender && bartender.x !== null && (
        <div 
          className="bartender-entity"
          style={{
            left: bartender.x * CELL_SIZE,
            top: bartender.y * CELL_SIZE
          }}
        ></div>
      )}
    </div>
  );
}
