// Client for the high-score backend (see server/index.js). All calls fail soft:
// the leaderboard is a nice-to-have, never block or crash the game on a network error.
const API = '/api/scores';

export async function fetchScores({ category = 'value', scope = 'all', limit = 20 } = {}) {
  try {
    const params = new URLSearchParams({ category, scope, limit: String(limit) });
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Submit a finished game. Returns { id, ranks: { value, franchises, popularity } }
 * (all-time ranks) on success, or null on failure (offline, rejected as
 * implausible, rate-limited, etc).
 */
export async function submitScore(entry) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
