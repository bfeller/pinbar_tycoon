import React from 'react';
import './TopBar.css';

export default function TopBar({
  time, cash, repairsRemaining, placementMachine, dayState, startDay, setIsComputerOpen
}) {
  return (
    <div className="topbar">
      <div className="topbar-brand">
        <i className="fa-solid fa-gamepad" style={{color: '#38bdf8', fontSize: '1.5rem'}}></i>
        <h2>Pinbar Tycoon</h2>
      </div>

      <div className="topbar-stats">
        <div className="stat-pill">
          <i className="fa-regular fa-calendar" style={{color: '#94a3b8'}}></i>
          <span>Y: {time.year} | W: {time.week} | D: {time.day}</span>
        </div>
        <div className="stat-pill" style={{color: '#10b981'}}>
          <i className="fa-solid fa-sack-dollar"></i>
          <span>${cash}</span>
        </div>
        <div className="stat-pill" style={{color: '#f59e0b'}}>
          <i className="fa-solid fa-wrench"></i>
          <span>{repairsRemaining} / 5%</span>
        </div>
      </div>

      {placementMachine && dayState !== 'REPORT' && (
        <div className="placement-indicator">
          <i className="fa-solid fa-arrows-up-down-left-right"></i>
          <span>Placing Machine (Press 'R' to Rotate)</span>
        </div>
      )}
      
      <div className="topbar-actions">
        <button 
          className="start-day-btn" 
          onClick={startDay} 
          disabled={dayState !== 'BUILD'}
          title={dayState === 'BUILD' ? 'Open Doors (Start Day)' : dayState === 'RUNNING' ? 'Running...' : 'Review Report'}
        >
          {dayState === 'BUILD' ? <i className="fa-solid fa-sun"></i> : dayState === 'RUNNING' ? <i className="fa-solid fa-play"></i> : <i className="fa-solid fa-clipboard-check"></i>}
        </button>

        {dayState === 'BUILD' && (
          <button 
            className="computer-btn" 
            onClick={() => setIsComputerOpen(true)}
            title="Open Computer"
          >
            <i className="fa-solid fa-computer"></i>
          </button>
        )}
      </div>
    </div>
  );
}
