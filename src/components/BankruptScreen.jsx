import React from 'react';
import './BankruptScreen.css';

export default function BankruptScreen({ stats, onRestart }) {
  const { pinbarName, characterName, time, cash, popularity } = stats;
  const yearsRun = time.year - 1975;
  const deficit = Math.abs(cash);

  return (
    <div className="bankrupt-overlay">
      <div className="bankrupt-window">
        <div className="bankrupt-titlebar">
          <span>⚠ Notice of Insolvency — {pinbarName}</span>
        </div>
        <div className="bankrupt-body">
          <div className="bankrupt-icon">📋</div>
          <h2 className="bankrupt-headline">YOUR BAR HAS CLOSED</h2>
          <p className="bankrupt-message">
            {time.year >= 2020
              ? `${pinbarName} could no longer cover the mounting medical bills. The bar has closed its doors.`
              : `${pinbarName} was unable to meet its weekly operating costs and has been permanently shut down.`
            }
          </p>

          <div className="bankrupt-stats">
            <div className="bankrupt-stat-row">
              <span>Operator</span><span>{characterName}</span>
            </div>
            <div className="bankrupt-stat-row">
              <span>Operated</span>
              <span>
                1975 – {time.year}, Week {time.week}
                {yearsRun > 0 ? ` (${yearsRun} year${yearsRun !== 1 ? 's' : ''})` : ' (less than one year)'}
              </span>
            </div>
            <div className="bankrupt-stat-row">
              <span>Final cash deficit</span>
              <span className="deficit">-${deficit.toLocaleString()}</span>
            </div>
            <div className="bankrupt-stat-row">
              <span>Popularity at closure</span>
              <span>{popularity}</span>
            </div>
          </div>

          <blockquote className="bankrupt-quill">
            {time.year >= 2020 ? (
              <p>
                "You made it further than most. The illness takes nearly everyone before they reach the end.
                I am sorry I could not prepare you better. The paperwork on my end is, as always, significant.
                Please try again. You know now what is coming — use that."
              </p>
            ) : (
              <p>
                "I am sorry. I had hoped this timeline would hold. The paperwork on my end is considerable.
                Please try again — and this time, watch the expenses more carefully.
                The rent does not stop because business is slow. This is something I should have emphasised earlier."
              </p>
            )}
            <cite>— Dr. H. Quill, Senior Analyst, Temporal Continuity Office, Dept. 7</cite>
          </blockquote>

          <button className="bankrupt-btn" onClick={onRestart}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
