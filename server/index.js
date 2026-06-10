import express from 'express';
import Database from 'better-sqlite3';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3000);
const DB_PATH = process.env.DB_PATH ?? '/data/highscores.sqlite';
const MAX_ROWS = 100; // most scores we ever return / keep visible

// Mirrors the client-side economy so the server can sanity-check submissions.
// Keep in sync with src/constants.js + src/utils/economy.js.
const NEW_MACHINE_PRICE = 10000;
const MAX_MACHINE_FACTOR = 1.20; // economy.js caps resale at 1.2× new price

// Total sell multiplier across the flagship + `franchiseCount` franchises —
// duplicate of franchiseSellMultiplier() in src/utils/economy.js.
function franchiseSellMultiplier(franchiseCount = 0) {
  let total = 1;
  let locationFactor = 1;
  for (let i = 1; i <= franchiseCount; i++) {
    locationFactor *= i <= 10 ? 0.9 : 0.8;
    total += locationFactor;
  }
  return total;
}

// ── Database ────────────────────────────────────────────────────────────────
mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    character_name  TEXT    NOT NULL,
    bar_name        TEXT    NOT NULL,
    score           INTEGER NOT NULL,
    cash            INTEGER NOT NULL DEFAULT 0,
    machine_count   INTEGER NOT NULL DEFAULT 0,
    franchise_count INTEGER NOT NULL DEFAULT 0,
    popularity      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
`);

const insertStmt = db.prepare(`
  INSERT INTO scores (character_name, bar_name, score, cash, machine_count, franchise_count, popularity)
  VALUES (@characterName, @barName, @score, @cash, @machineCount, @franchiseCount, @popularity)
`);

// Ranking categories → the column they sort on. (Whitelisted; never interpolate raw input.)
const CATEGORY_COLUMN = {
  value: 'score',
  franchises: 'franchise_count',
  popularity: 'popularity',
};

// Date scopes → a SQL predicate on created_at (UTC). 'week' = since Monday 00:00 of the
// current week, 'month' = since the 1st, 'all' = no filter.
const SCOPE_WHERE = {
  all: '',
  week: "WHERE created_at >= date('now', '-' || ((strftime('%w','now') + 6) % 7) || ' days')",
  month: "WHERE created_at >= date('now', 'start of month')",
};

// Prepared statements are cached per (category, scope) combo so we compile each once.
const topCache = new Map();
const topStmtFor = (category, scope) => {
  const key = `${category}:${scope}`;
  if (!topCache.has(key)) {
    topCache.set(key, db.prepare(`
      SELECT id, character_name AS characterName, bar_name AS barName, score,
             machine_count AS machineCount, franchise_count AS franchiseCount,
             popularity, created_at AS createdAt
      FROM scores ${SCOPE_WHERE[scope]}
      ORDER BY ${CATEGORY_COLUMN[category]} DESC, created_at ASC LIMIT ?
    `));
  }
  return topCache.get(key);
};

const rankCache = new Map();
const rankStmtFor = (category) => {
  if (!rankCache.has(category)) {
    rankCache.set(category, db.prepare(`SELECT COUNT(*) + 1 AS rank FROM scores WHERE ${CATEGORY_COLUMN[category]} > ?`));
  }
  return rankCache.get(category);
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const clampInt = (v, min, max) => {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
};

// Drop control characters, trim, and cap length.
const cleanName = (v, max) =>
  String(v ?? '')
    .split('')
    .filter(ch => { const c = ch.charCodeAt(0); return c >= 0x20 && c !== 0x7f; })
    .join('')
    .trim()
    .slice(0, max);

// Light anti-cheat: reject scores that exceed what the submitted game state
// could plausibly produce. Not bulletproof — stops casual tampering, not a
// determined attacker forging a self-consistent payload.
function isPlausible({ score, cash, machineCount, franchiseCount }) {
  const maxMachineValue = NEW_MACHINE_PRICE * MAX_MACHINE_FACTOR; // per location, mint + popular
  const maxAssets = cash + machineCount * maxMachineValue * franchiseSellMultiplier(franchiseCount);
  // small epsilon for rounding; score must also at least cover cash on hand
  return score >= cash && score <= Math.ceil(maxAssets) + 1;
}

// Crude in-memory rate limit: N submissions per IP per window.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map(); // ip -> number[] (timestamps)
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// ── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '8kb' }));
app.set('trust proxy', true); // honour X-Forwarded-For from nginx

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/scores', (req, res) => {
  const category = CATEGORY_COLUMN[req.query.category] ? req.query.category : 'value';
  const scope = SCOPE_WHERE[req.query.scope] !== undefined ? req.query.scope : 'all';
  const limit = clampInt(req.query.limit, 1, MAX_ROWS) ?? 20;
  res.json(topStmtFor(category, scope).all(limit));
});

app.post('/api/scores', (req, res) => {
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: 'Too many submissions, slow down.' });
  }

  const body = req.body ?? {};
  const entry = {
    characterName: cleanName(body.characterName, 24) || 'Anonymous',
    barName: cleanName(body.barName, 32) || 'Unnamed Bar',
    score: clampInt(body.score, 0, 1e12),
    cash: clampInt(body.cash, 0, 1e12),
    machineCount: clampInt(body.machineCount, 0, 100000),
    franchiseCount: clampInt(body.franchiseCount, 0, 100000),
    popularity: clampInt(body.popularity, 0, 10000000),
  };

  if ([entry.score, entry.cash, entry.machineCount, entry.franchiseCount, entry.popularity].some(v => v === null)) {
    return res.status(400).json({ error: 'Invalid score payload.' });
  }
  if (!isPlausible(entry)) {
    return res.status(422).json({ error: 'Score is not consistent with submitted game stats.' });
  }

  const { lastInsertRowid } = insertStmt.run(entry);
  const ranks = {
    value: rankStmtFor('value').get(entry.score).rank,
    franchises: rankStmtFor('franchises').get(entry.franchiseCount).rank,
    popularity: rankStmtFor('popularity').get(entry.popularity).rank,
  };
  res.status(201).json({ id: Number(lastInsertRowid), ranks });
});

app.listen(PORT, () => console.log(`Pinbar Tycoon scores API listening on :${PORT} (db: ${DB_PATH})`));
