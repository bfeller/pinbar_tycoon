import React from 'react';
import './PlayActions.css';
import { DAY_LENGTH_SECONDS } from '../constants';

function DayClock({ dayTimer }) {
  const remaining = Math.max(0, DAY_LENGTH_SECONDS - dayTimer);
  const pct = remaining / DAY_LENGTH_SECONDS;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const ringColor = remaining <= 3 ? '#ef4444' : remaining <= 7 ? '#f59e0b' : '#10b981';
  const urgent = remaining <= 3;

  return (
    <div className={`day-clock${urgent ? ' urgent' : ''}`} title={`${remaining}s remaining`}>
      <svg width="36" height="36" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#505050" strokeWidth="4" />
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
  );
}

export default function PlayActions({ dayState, dayTimer, startDay, setIsComputerOpen, unreadEmails }) {
  return (
    <div className="play-actions">
      <button
        className={`start-day-btn${dayState === 'RUNNING' ? ' running' : ''}`}
        onClick={startDay}
        disabled={dayState !== 'BUILD'}
        title={dayState === 'BUILD' ? 'Open Doors (Start Day)' : dayState === 'RUNNING' ? 'Day in progress' : 'Review Report'}
      >
        {dayState === 'BUILD' && <i className="fa-solid fa-sun" />}
        {dayState === 'REPORT' && <i className="fa-solid fa-clipboard-check" />}
        <span>
          {dayState === 'BUILD' ? 'Start Day' : dayState === 'RUNNING' ? 'Day Running' : 'View Report'}
        </span>
        {dayState === 'RUNNING' && <DayClock dayTimer={dayTimer} />}
      </button>

      {dayState === 'BUILD' && (
        <button
          className="computer-btn"
          onClick={() => setIsComputerOpen(true)}
          title="Open Computer"
        >
          <i className="fa-solid fa-computer" />
          <span>Computer</span>
          {unreadEmails > 0 && (
            <span className="computer-btn-badge">{unreadEmails}</span>
          )}
        </button>
      )}
    </div>
  );
}
