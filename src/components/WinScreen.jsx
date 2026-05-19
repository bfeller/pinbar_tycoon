import React from 'react';
import './WinScreen.css';

export default function WinScreen({ stats, onRestart }) {
  const { pinbarName, characterName, popularity, cash, machineCount } = stats;

  return (
    <div className="win-overlay">
      <div className="win-card">
        <div className="win-titlebar">🏆 Pinbar Tycoon — Final Report</div>
        <div className="win-body">

        <div className="win-header">
          <img src="/favicon.svg" alt="Pinbar Tycoon" style={{width: '48px', height: '48px', display: 'block', margin: '0 auto 6px'}} />
          <span className="win-game-title">PINBAR TYCOON</span>
        </div>

        <div className="win-banner">
          <div className="win-banner-line">THE BAR IS STILL OPEN</div>
        </div>

        <div className="win-bar-name">{pinbarName}</div>
        <div className="win-bar-dates">Est. 1975 &mdash; Still trading in 2026</div>

        <div className="win-divider" />

        <div className="win-narrative">
          <p><strong>{characterName}</strong> made it.</p>
          <p>
            51 years. Weekly rent. Broken machines. A competitor who finally closed his doors.
            An illness that should have ended everything — and nearly did.
          </p>
          <p>
            In 2026, in a moment of desperation, {characterName} discovered something remarkable.
          </p>
          <p className="win-reveal">
            They invented time travel.<br />
            They became immortal.
          </p>
          <p>
            And then they sent a Windows 95 computer back to 1975 to help themselves succeed.
            Because they already knew what was coming.
          </p>
          <p className="win-twist">
            They wrote the emails.<br />
            They are Dr. H. Quill.<br />
            They always were.
          </p>
        </div>

        <div className="win-divider" />

        <div className="win-score-label">FINAL RECORD</div>
        <div className="win-scores">
          <div className="win-score-row">
            <span className="win-score-key">Popularity</span>
            <span className="win-score-dots" />
            <span className="win-score-val">{popularity}</span>
          </div>
          <div className="win-score-row">
            <span className="win-score-key">Cash remaining</span>
            <span className="win-score-dots" />
            <span className="win-score-val">${cash.toLocaleString()}</span>
          </div>
          <div className="win-score-row">
            <span className="win-score-key">Machines owned</span>
            <span className="win-score-dots" />
            <span className="win-score-val">{machineCount}</span>
          </div>
        </div>

        <div className="win-divider" />

        <div className="win-quill-sig">
          — Dr. H. Quill, Senior Analyst, Temporal Continuity Office, Dept. 7<br />
          <span className="win-quill-formerly">(Formerly: {characterName}, Bar Operator, {pinbarName})</span>
        </div>

        <button className="win-btn" onClick={onRestart}>
          Play Again
        </button>

        </div>{/* end win-body */}
      </div>
    </div>
  );
}
