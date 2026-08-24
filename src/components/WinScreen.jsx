import React, { useEffect, useState } from 'react';
import './WinScreen.css';
import Leaderboard from './Leaderboard';
import { submitScore, savePendingScore, loadPendingScore, clearPendingScore } from '../utils/scores';

export default function WinScreen({ stats, onRestart }) {
  const {
    pinbarName: initialBar,
    characterName: initialChar,
    popularity,
    cash,
    machineCount,
    franchiseCount = 0,
    totalAssets = cash,
  } = stats ?? {};

  const [characterName, setCharacterName] = useState(initialChar ?? '');
  const [barName, setBarName] = useState(initialBar ?? '');
  const [phase, setPhase] = useState('confirm'); // confirm | submitting | done
  const [myId, setMyId] = useState(null);
  const [ranks, setRanks] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [lbRefresh, setLbRefresh] = useState(0);

  // Recover a pending submission if the player refreshed after a failed save.
  useEffect(() => {
    const pending = loadPendingScore();
    if (!pending) return;
    if (pending.score !== totalAssets) return; // different run
    setCharacterName(pending.characterName || initialChar || '');
    setBarName(pending.barName || initialBar || '');
  }, [totalAssets, initialChar, initialBar]);

  const buildEntry = () => ({
    characterName: characterName.trim() || 'Anonymous',
    barName: barName.trim() || 'Unnamed Bar',
    score: totalAssets,
    cash,
    machineCount,
    franchiseCount,
    popularity,
  });

  const handleSubmit = async () => {
    if (!characterName.trim() || !barName.trim()) {
      setSubmitError('Enter your name and bar name to claim your spot.');
      return;
    }
    const entry = buildEntry();
    savePendingScore(entry);
    setPhase('submitting');
    setSubmitError(null);

    const result = await submitScore(entry);
    if (result.ok) {
      clearPendingScore();
      setMyId(result.id);
      setRanks(result.ranks);
      setLbRefresh(k => k + 1);
      setPhase('done');
    } else {
      setSubmitError(result.error || 'Could not save your score.');
      setPhase('confirm');
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pinbartycoon.com';
  const shareText = `I kept ${barName || initialBar} trading for 51 years in Pinbar Tycoon — final net worth $${Number(totalAssets).toLocaleString()}. Can you beat my empire?`;

  const shareLinks = [
    { label: '𝕏', title: 'Share on X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { label: 'Facebook', title: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}` },
    { label: 'Reddit', title: 'Share on Reddit', href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}` },
    { label: 'Bluesky', title: 'Share on Bluesky', href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}` },
    { label: 'WhatsApp', title: 'Share on WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}` },
  ];

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Pinbar Tycoon', text: shareText, url: shareUrl });
        return;
      } catch { /* user dismissed — fall through to copy */ }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    }
  };

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

        <div className="win-bar-name">{barName || initialBar}</div>
        <div className="win-bar-dates">Est. 1975 &mdash; Still trading in 2026</div>

        <div className="win-divider" />

        <div className="win-narrative">
          <p><strong>{characterName || initialChar}</strong> made it.</p>
          <p>
            51 years. Weekly rent. Broken machines. A competitor who finally closed his doors.
            An illness that should have ended everything — and nearly did.
          </p>
          <p>
            In 2026, in a moment of desperation, {characterName || initialChar} discovered something remarkable.
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
            <span className="win-score-val">${Number(cash).toLocaleString()}</span>
          </div>
          <div className="win-score-row">
            <span className="win-score-key">Machines owned</span>
            <span className="win-score-dots" />
            <span className="win-score-val">{machineCount}</span>
          </div>
        </div>

        <div className="win-finalscore">
          <div className="win-finalscore-label">FINAL SCORE &middot; TOTAL ASSET VALUE</div>
          <div className="win-finalscore-val">${Number(totalAssets).toLocaleString()}</div>
          {ranks != null && (
            <>
              <div className="win-finalscore-rank">
                {ranks.value === 1 ? '👑 World #1 — richest operator alive!' : `Net worth ranked #${ranks.value.toLocaleString()} all-time`}
              </div>
              <div className="win-finalscore-subranks">
                Franchises #{ranks.franchises.toLocaleString()} &middot; Popularity #{ranks.popularity.toLocaleString()}
              </div>
            </>
          )}
        </div>

        {/* High-score claim — players must confirm before POST (was silent auto-submit) */}
        <div className="win-submit">
          <div className="win-score-label">CLAIM YOUR HIGH SCORE</div>
          {phase !== 'done' ? (
            <>
              <p className="win-submit-hint">
                Confirm how you want to appear on the Hall of Fame, then submit.
              </p>
              <div className="win-submit-fields">
                <label className="win-submit-label">
                  <span>Operator name</span>
                  <input
                    type="text"
                    maxLength={24}
                    value={characterName}
                    onChange={e => { setCharacterName(e.target.value); setSubmitError(null); }}
                    disabled={phase === 'submitting'}
                  />
                </label>
                <label className="win-submit-label">
                  <span>Bar name</span>
                  <input
                    type="text"
                    maxLength={32}
                    value={barName}
                    onChange={e => { setBarName(e.target.value); setSubmitError(null); }}
                    disabled={phase === 'submitting'}
                  />
                </label>
              </div>
              {submitError && <p className="win-submit-error">{submitError}</p>}
              <button
                type="button"
                className="win-btn win-submit-btn"
                onClick={handleSubmit}
                disabled={phase === 'submitting'}
              >
                {phase === 'submitting' ? 'Saving…' : submitError ? 'Retry Submit' : 'Submit High Score'}
              </button>
            </>
          ) : (
            <p className="win-submit-ok">Score saved to the Hall of Fame.</p>
          )}
        </div>

        <div className="win-leaderboard">
          <div className="win-score-label">HALL OF FAME</div>
          {phase === 'done'
            ? <Leaderboard highlightId={myId} defaultCategory="value" defaultScope="all" refreshKey={lbRefresh} />
            : <div className="lb-status">Submit your score to see the rankings.</div>}
        </div>

        <div className="win-share">
          <div className="win-share-label">Brag about it</div>
          <div className="win-share-row">
            <button className="win-share-btn win-share-native" onClick={handleNativeShare} title="Share or copy">Share / Copy</button>
            {shareLinks.map(s => (
              <a
                key={s.label}
                className="win-share-btn"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.title}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="win-divider" />

        <div className="win-quill-sig">
          — Dr. H. Quill, Senior Analyst, Temporal Continuity Office, Dept. 7<br />
          <span className="win-quill-formerly">(Formerly: {characterName || initialChar}, Bar Operator, {barName || initialBar})</span>
        </div>

        <button className="win-btn" onClick={onRestart}>
          Play Again
        </button>

        </div>{/* end win-body */}
      </div>
    </div>
  );
}
