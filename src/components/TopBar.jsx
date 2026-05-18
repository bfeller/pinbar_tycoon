import React from 'react';
import './TopBar.css';
import { DAY_LENGTH_SECONDS } from '../constants';

export default function TopBar({
  pinbarName, time, cash, repairsRemaining, repairCapacity, popularity, placementMachine, dayState, dayTimer, startDay, setIsComputerOpen, unreadEmails
}) {
  const remaining = Math.max(0, DAY_LENGTH_SECONDS - dayTimer);
  const pct = remaining / DAY_LENGTH_SECONDS;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const ringColor = remaining <= 3 ? '#ef4444' : remaining <= 7 ? '#f59e0b' : '#10b981';
  const urgent = remaining <= 3 && dayState === 'RUNNING';
  return (
    <div className="topbar">
      <div className="topbar-brand">
        <i className="fa-solid fa-gamepad" style={{color: '#38bdf8', fontSize: '1.5rem'}}></i>
        <div>
          <h2 style={{margin: 0, lineHeight: 1}}>{pinbarName}</h2>
          <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>Pinbar Tycoon</span>
        </div>
      </div>

      <div className="topbar-stats" style={{ alignItems: 'center' }}>
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
          <span>{repairsRemaining} / {repairCapacity}%</span>
        </div>
        <div className="stat-pill" style={{color: '#a78bfa'}}>
          <i className="fa-solid fa-star"></i>
          <span>{popularity}</span>
        </div>

        {dayState === 'RUNNING' && (
          <div className={`day-clock${urgent ? ' urgent' : ''}`} title={`${remaining}s remaining`}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="22" cy="22" r={r}
                fill="none"
                stroke={ringColor}
                strokeWidth="4"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s' }}
              />
            </svg>
            <span className="day-clock-label" style={{ color: ringColor }}>{remaining}s</span>
          </div>
        )}
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
            style={{ position: 'relative' }}
          >
            <i className="fa-solid fa-computer"></i>
            {unreadEmails > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', pointerEvents: 'none' }}>
                {unreadEmails}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
