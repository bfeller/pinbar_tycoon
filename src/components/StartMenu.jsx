import React, { useState } from 'react';
import './StartMenu.css';
import Leaderboard from './Leaderboard';

export default function StartMenu({ savedGame, onNewGame, onContinue }) {
  const [view, setView] = useState('main');
  const [pinbarName, setPinbarName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [error, setError] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    const bar = pinbarName.trim();
    const char = characterName.trim();
    if (!bar) { setError('Give your bar a name.'); return; }
    if (!char) { setError("What's your name?"); return; }
    onNewGame(bar, char);
  };

  const goToNewGame = () => {
    setPinbarName('');
    setCharacterName('');
    setError('');
    setView('newgame');
  };

  return (
    <div className="startmenu-screen">
      <div className="startmenu-modal">
        <div className="startmenu-titlebar">🎰 Pinbar Tycoon</div>
        <div className="startmenu-body">
        {view === 'main' && (
          <>
            <div className="startmenu-header">
              <img src="/favicon.svg" alt="Pinbar Tycoon" className="startmenu-icon" style={{width: '64px', height: '64px'}} />
              <div>
                <h1 className="startmenu-title">Pinbar Tycoon</h1>
                <p className="startmenu-tagline">1975. You have a space and some machines. Make it work.</p>
              </div>
            </div>

            <div className="startmenu-buttons">
              <button className="startmenu-btn primary" onClick={goToNewGame}>
                New Game
              </button>
              {savedGame ? (
                <button className="startmenu-btn" onClick={onContinue}>
                  <span>Continue</span>
                  <span className="startmenu-save-info">
                    {savedGame.pinbarName} &mdash; {savedGame.time?.year ?? '?'}
                  </span>
                </button>
              ) : (
                <button className="startmenu-btn" disabled>
                  <span>Continue</span>
                  <span className="startmenu-save-info muted">No saved game</span>
                </button>
              )}
              <button className="startmenu-btn" onClick={() => setView('scores')}>
                🏆 High Scores
              </button>
            </div>
          </>
        )}

        {view === 'scores' && (
          <>
            <h2 className="startmenu-form-title">🏆 Hall of Fame</h2>
            <Leaderboard defaultCategory="value" defaultScope="all" />
            <div className="startmenu-form-actions" style={{ justifyContent: 'flex-start', marginTop: '12px' }}>
              <button
                type="button"
                className="startmenu-btn small secondary"
                onClick={() => setView('main')}
              >
                ← Back
              </button>
            </div>
          </>
        )}

        {view === 'newgame' && (
          <>
            <h2 className="startmenu-form-title">New Game</h2>
            <form className="startmenu-form" onSubmit={handleStart}>
              <label className="startmenu-label">
                <span>Bar name</span>
                <input
                  autoFocus
                  type="text"
                  maxLength={32}
                  placeholder="e.g. The Rusty Flipper"
                  value={pinbarName}
                  onChange={e => { setPinbarName(e.target.value); setError(''); }}
                />
              </label>
              <label className="startmenu-label">
                <span>Your name</span>
                <input
                  type="text"
                  maxLength={24}
                  placeholder="e.g. Alex"
                  value={characterName}
                  onChange={e => { setCharacterName(e.target.value); setError(''); }}
                />
              </label>
              {error && <p className="startmenu-error">{error}</p>}
              <div className="startmenu-form-actions">
                <button
                  type="button"
                  className="startmenu-btn small secondary"
                  onClick={() => { setView('main'); setError(''); }}
                >
                  ← Back
                </button>
                <button type="submit" className="startmenu-btn small primary">
                  Start Game →
                </button>
              </div>
            </form>
          </>
        )}
        </div>{/* end startmenu-body */}
      </div>
    </div>
  );
}
