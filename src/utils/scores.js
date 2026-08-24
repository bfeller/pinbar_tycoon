// Client for the high-score backend (see server/index.js). Failures are returned
// as structured results so the win screen can show an error + retry — never throw.
const API = '/api/scores';

const PENDING_KEY = 'pinbar_tycoon_pending_score';

export async function fetchScores({ category = 'value', scope = 'all', limit = 20 } = {}) {
  try {
    const params = new URLSearchParams({ category, scope, limit: String(limit) });
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) return { ok: false, scores: [], error: `High-score server error (HTTP ${res.status}).` };
    return { ok: true, scores: await res.json() };
  } catch {
    return { ok: false, scores: [], error: 'High-score server is unreachable.' };
  }
}

/**
 * Submit a finished game.
 * @returns {{ ok: true, id: number, ranks: object } | { ok: false, status: number|null, error: string }}
 */
export async function submitScore(entry) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON error page */ }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: body?.error
          ?? (res.status === 502 || res.status === 503
            ? 'High-score server is unreachable.'
            : `Could not save score (HTTP ${res.status}).`),
      };
    }
    return { ok: true, id: body.id, ranks: body.ranks };
  } catch {
    return {
      ok: false,
      status: null,
      error: 'High-score server is unreachable. Is the scores API running?',
    };
  }
}

/** Stash a win payload so a refresh after a failed submit can still retry. */
export function savePendingScore(entry) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(entry)); } catch { /* private mode */ }
}

export function loadPendingScore() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingScore() {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
}
