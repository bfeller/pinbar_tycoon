import React from 'react';
import './GameGrid.css';
import { CELL_SIZE, GRID_COLS, GRID_ROWS, DOOR_POS } from '../constants';
import { getMachineCells } from '../utils/grid';

export default function GameGrid({
  machines, customers = [], bartender = null, servers = [], hoveredCell, placementMachine, placementRotation,
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

        const allX = mCells.map(c => c.x);
        const allY = mCells.map(c => c.y);
        const minX = Math.min(...allX);
        const minY = Math.min(...allY);
        const wCells = Math.max(...allX) - minX + 1;
        const hCells = Math.max(...allY) - minY + 1;
        const isVertical = placementRotation === 'N' || placementRotation === 'S';

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
             {type === 'bathroom' && <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'1.8rem'}}>🚻</div>}
          </div>
        )
      })()}

      {/* Placed machines */}
      {placedMachines.map(m => {
        const mCells = getMachineCells(m.type, m.x, m.y, m.orientation);
        const allX = mCells.map(c => c.x);
        const allY = mCells.map(c => c.y);
        const minX = Math.min(...allX);
        const minY = Math.min(...allY);
        const wCells = Math.max(...allX) - minX + 1;
        const hCells = Math.max(...allY) - minY + 1;
        const isVertical = m.orientation === 'N' || m.orientation === 'S';

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

        const backSide = {
          position: 'absolute',
          [m.orientation === 'N' ? 'top' : m.orientation === 'S' ? 'bottom' : m.orientation === 'E' ? 'right' : 'left']: 0,
          width: isVertical ? '100%' : '50%',
          height: isVertical ? '50%' : '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
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
            title={m.type === 'bathroom' ? m.name : `${m.name} - ${m.durability}% Durability`}
          >
            {(!m.type || m.type === 'pinball' || m.type === 'bartop') && <div style={frontSideStyle}>PLAY SIDE</div>}
            {(m.type === 'pinball' || !m.type) && m.imageUrl && (() => {
              const backglassTransform = {
                N: { transform: 'perspective(60px) rotateX(42deg)', transformOrigin: 'bottom center' },
                S: { transform: 'perspective(60px) rotateX(-42deg)', transformOrigin: 'top center' },
                E: { transform: 'perspective(60px) rotateY(-42deg)', transformOrigin: 'left center' },
                W: { transform: 'perspective(60px) rotateY(42deg)', transformOrigin: 'right center' },
              }[m.orientation] ?? { transform: 'perspective(60px) rotateX(42deg)', transformOrigin: 'bottom center' };
              return (
                <div style={backSide}>
                  <img
                    src={m.imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, ...backglassTransform }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              );
            })()}
            {m.type === 'bathroom' && <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'2rem',pointerEvents:'none'}}>🚻</div>}
            {m.type !== 'kegerator' && m.type !== 'bartop' && m.type !== 'bathroom' && <div className="durability-mini-bar" style={{height: `${m.durability}%`, background: m.durability > 50 ? '#10b981' : '#ef4444'}}></div>}
          </div>
        )
      })}

      {/* Customers */}
      {customers.map(c => {
        const isWaiting = c.status === 'waiting_for_pinball' || c.status === 'waiting_for_bartop' || c.status === 'waiting_for_bathroom' || c.status === 'walking_to_wait_area';
        const isWaitingForDrink = c.status === 'waiting_for_drink';
        const patiencePct = c.patienceTicks !== undefined ? (c.patienceTicks / 30) * 100 : 100;
        const drinkPatiencePct = c.drinkPatienceTicks !== undefined ? (c.drinkPatienceTicks / 75) * 100 : 100;
        const isImpatient = (isWaiting && patiencePct < 33) || (isWaitingForDrink && drinkPatiencePct < 33);
        const statusClass = c.angry ? 'angry'
          : c.status === 'drinking' ? 'drinking'
          : isImpatient ? 'impatient'
          : isWaiting || isWaitingForDrink ? 'waiting'
          : '';
        const showBar = isWaiting || isWaitingForDrink;
        const barPct = isWaitingForDrink ? drinkPatiencePct : patiencePct;

        // Thought bubble icon
        let thought = null;
        if (c.status === 'playing') {
          thought = { icon: 'fa-gamepad', color: '#10b981' };
        } else if (c.status === 'drinking') {
          thought = { icon: 'fa-beer-mug-empty', color: '#60a5fa' };
        } else if (c.status === 'using_bathroom') {
          thought = { icon: 'fa-toilet', color: '#10b981' };
        } else if (c.status === 'walking_in') {
          thought = { icon: 'fa-gamepad', color: '#fcd34d' };
        } else if (c.status === 'walking_to_bar' || c.status === 'waiting_for_drink') {
          thought = { icon: 'fa-beer-mug-empty', color: isImpatient ? '#ef4444' : '#fcd34d' };
        } else if (c.status === 'walking_to_bathroom' || c.status === 'waiting_for_bathroom') {
          thought = { icon: 'fa-toilet', color: isImpatient ? '#ef4444' : '#fcd34d' };
        } else if (c.status === 'waiting_for_pinball') {
          thought = { icon: 'fa-gamepad', color: isImpatient ? '#ef4444' : '#fcd34d' };
        } else if (c.status === 'waiting_for_bartop' || (c.status === 'walking_to_wait_area' && c.waitingFor === 'bartop')) {
          thought = { icon: 'fa-beer-mug-empty', color: isImpatient ? '#ef4444' : '#fcd34d' };
        } else if (c.status === 'walking_to_wait_area' && c.waitingFor === 'bathroom') {
          thought = { icon: 'fa-toilet', color: '#fcd34d' };
        } else if (c.status === 'walking_to_wait_area') {
          thought = { icon: 'fa-gamepad', color: '#fcd34d' };
        } else if (c.status === 'evaluating_needs') {
          const need = c.needs?.[0];
          if (need === 'pinball') thought = { icon: 'fa-gamepad', color: '#fcd34d' };
          else if (need === 'drink') thought = { icon: 'fa-beer-mug-empty', color: '#fcd34d' };
          else if (need === 'bathroom') thought = { icon: 'fa-toilet', color: '#fcd34d' };
        }
        // walking_out / angry: no thought bubble

        return (
          <div
            key={c.id}
            className={`customer-entity ${statusClass}`}
            style={{
              left: c.x * CELL_SIZE,
              top: c.y * CELL_SIZE
            }}
            title={showBar ? `Waiting (${Math.ceil(barPct)}%)` : c.status}
          >
            {thought && (
              <div className="thought-bubble">
                <i className={`fa-solid ${thought.icon}`} style={{ color: thought.color }} />
              </div>
            )}
            {showBar && (
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
                  width: `${barPct}%`,
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
        <StaffDot entity={bartender} className="bartender-entity" label="Bartender" />
      )}

      {/* Servers */}
      {servers.filter(s => s.x !== null).map(s => (
        <StaffDot key={s.id} entity={s} className="server-entity" label="Server" />
      ))}
    </div>
  );
}

function StaffDot({ entity, className, label }) {
  const { status, timer, timerMax } = entity;
  const holdingDrink = status === 'pouring' || status === 'walking_to_bartop' || status === 'serving';
  const showProgress = (status === 'pouring' || status === 'serving') && timerMax > 0;
  const pct = showProgress ? Math.max(0, (timer / timerMax) * 100) : 0;

  return (
    <div
      className={className}
      style={{ left: entity.x * CELL_SIZE, top: entity.y * CELL_SIZE }}
      title={label}
    >
      {holdingDrink && (
        <span style={{
          position: 'absolute', top: -14, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px', lineHeight: 1, pointerEvents: 'none'
        }}>🍺</span>
      )}
      {showProgress && (
        <div style={{
          position: 'absolute', bottom: -6, left: -7,
          width: 34, height: 3,
          background: 'rgba(0,0,0,0.35)', borderRadius: 2, overflow: 'hidden'
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: '#fbbf24', borderRadius: 2,
            transition: 'width 0.2s linear'
          }} />
        </div>
      )}
    </div>
  );
}
