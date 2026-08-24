import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import { fetchScores } from '../utils/scores';

const MEDALS = ['🥇', '🥈', '🥉'];

export const CATEGORIES = [
  { key: 'value', label: 'Net Worth', col: 'Net Worth', metric: s => `$${Number(s.score).toLocaleString()}` },
  { key: 'franchises', label: 'Franchises', col: 'Franchises', metric: s => Number(s.franchiseCount).toLocaleString() },
  { key: 'popularity', label: 'Popularity', col: 'Popularity', metric: s => Number(s.popularity).toLocaleString() },
];

const SCOPES = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

export default function Leaderboard({
  highlightId = null,
  defaultCategory = 'value',
  defaultScope = 'all',
  // bump this to force a refetch (e.g. after the win screen submits a new score)
  refreshKey = 0,
}) {
  const [category, setCategory] = useState(defaultCategory);
  const [scope, setScope] = useState(defaultScope);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetchScores({ category, scope, limit: 20 }).then(result => {
      if (cancelled) return;
      setScores(result.scores ?? []);
      setFetchError(result.ok ? null : (result.error || 'Could not load scores.'));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [category, scope, refreshKey]);

  const cat = CATEGORIES.find(c => c.key === category) ?? CATEGORIES[0];

  return (
    <div className="lb">
      <div className="lb-tabs" role="tablist" aria-label="Category">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`lb-tab${c.key === category ? ' active' : ''}`}
            onClick={() => setCategory(c.key)}
            role="tab"
            aria-selected={c.key === category}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="lb-tabs lb-tabs-scope" role="tablist" aria-label="Time period">
        {SCOPES.map(sc => (
          <button
            key={sc.key}
            className={`lb-tab scope${sc.key === scope ? ' active' : ''}`}
            onClick={() => setScope(sc.key)}
            role="tab"
            aria-selected={sc.key === scope}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="lb-status">Loading high scores…</div>
      ) : fetchError ? (
        <div className="lb-status lb-error">{fetchError}</div>
      ) : scores.length === 0 ? (
        <div className="lb-status">No scores yet — be the first.</div>
      ) : (
        <div className="lb-table" role="table" aria-label={`${cat.label} high scores`}>
          <div className="lb-row lb-head" role="row">
            <span className="lb-rank">#</span>
            <span className="lb-name">Operator</span>
            <span className="lb-score">{cat.col}</span>
          </div>
          {scores.map((s, i) => (
            <div
              key={s.id ?? i}
              className={`lb-row${s.id != null && s.id === highlightId ? ' lb-you' : ''}`}
              role="row"
            >
              <span className="lb-rank">{MEDALS[i] ?? i + 1}</span>
              <span className="lb-name">
                <span className="lb-char">{s.characterName}</span>
                <span className="lb-bar">{s.barName}</span>
              </span>
              <span className="lb-score">{cat.metric(s)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
