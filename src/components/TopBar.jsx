import React from 'react';
import './TopBar.css';

export default function TopBar({
  pinbarName, time, cash, repairsRemaining, repairCapacity, popularity,
}) {
  return (
    <div className="topbar">
      <div className="topbar-center">
        <div className="topbar-brand">
          <img src="/favicon.svg" alt="Pinbar Tycoon" style={{width: '28px', height: '28px'}} />
          <div>
            <h2 style={{margin: 0, lineHeight: 1}}>{pinbarName}</h2>
            <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>Pinbar Tycoon</span>
          </div>
        </div>

        <div className="topbar-stats">
          <div className="stat-pill">
            <i className="fa-regular fa-calendar" style={{color: '#444444'}}></i>
            <span>Y: {time.year} | W: {time.week} | D: {time.day}</span>
          </div>
          <div className="stat-pill" style={{color: '#006400'}}>
            <i className="fa-solid fa-sack-dollar"></i>
            <span>${cash}</span>
          </div>
          <div className="stat-pill" style={{color: '#b35900'}}>
            <i className="fa-solid fa-wrench"></i>
            <span>{repairsRemaining} / {repairCapacity}%</span>
          </div>
          <div className="stat-pill" style={{color: '#5b21b6'}}>
            <i className="fa-solid fa-star"></i>
            <span>{popularity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
