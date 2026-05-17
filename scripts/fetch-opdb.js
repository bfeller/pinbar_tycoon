/**
 * Fetches all pinball machines from OPDB and writes them to src/data/pinball_machines.json.
 * Run with: npm run fetch-opdb
 *
 * Uses OPDB export API if VITE_OPDB_KEY is set in .env, otherwise falls back to typeahead.
 * Also enriches each machine with a locationCount from Pinball Map as a popularity signal.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../src/data/pinball_machines.json');

// Parse .env manually — no dotenv dependency needed
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => l.split('=').map(s => s.trim()))
  );
}

function extractYear(supplementary = '') {
  const match = supplementary.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : null;
}

function pickImage(images = []) {
  for (const preferredType of ['backglass', 'playfield', 'cabinet']) {
    const img = images.find(i => i.type === preferredType && i.urls?.small);
    if (img) return img.urls.small;
  }
  return null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchViaExport(apiKey) {
  console.log('Fetching from OPDB export API...');
  const res = await fetch('https://opdb.org/api/export', {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!res.ok) throw new Error(`Export API returned ${res.status}`);
  const data = await res.json();
  return data
    .map(m => {
      const parsedYear = m.manufacture_date
        ? parseInt(m.manufacture_date.substring(0, 4))
        : null;
      const machine = {
        id: m.opdb_id,
        name: m.name,
        supplementary: m.manufacturer?.name || 'Unknown Manufacturer',
        parsedYear,
        imageUrl: pickImage(m.images) || null,
      };
      if (m.description) machine.description = m.description;
      return machine;
    })
    .filter(m => m.parsedYear && m.parsedYear >= 1970);
}

async function fetchViaTypeahead() {
  console.log('Fetching from OPDB typeahead (no API key)...');
  const queries = [
    'pinball', 'star', 'bally', 'stern', 'williams', 'gottlieb',
    'data', 'a', 'e', 's', 't', 'm', 'p', 'space', 'monster', 'attack', 'trek'
  ];
  const seen = new Set();
  const machines = [];

  for (const q of queries) {
    try {
      const res = await fetch(`https://opdb.org/api/search/typeahead?q=${q}`);
      if (!res.ok) continue;
      const data = await res.json();
      for (const m of data) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          const parsedYear = extractYear(m.supplementary);
          if (parsedYear && parsedYear >= 1970) machines.push({ id: m.id, name: m.name, supplementary: m.supplementary, parsedYear, imageUrl: null });
        }
      }
    } catch (e) {
      console.warn(`  Typeahead query "${q}" failed:`, e.message);
    }
  }
  return machines;
}

/**
 * Fetches location counts from Pinball Map for each machine.
 * Pinball Map is a free public API — no auth required.
 * Location count = how many venues worldwide currently have this machine on route.
 * This is a strong proxy for real-world popularity.
 */
async function enrichWithPopularity(machines) {
  console.log('Fetching Pinball Map machine list for popularity data...');
  const pmRes = await fetch('https://pinballmap.com/api/v1/machines.json?no_details=1');
  if (!pmRes.ok) {
    console.warn('Pinball Map unavailable — skipping popularity enrichment.');
    return machines.map(m => ({ ...m, locationCount: 0 }));
  }
  const pmData = await pmRes.json();

  // Build opdb_id → pinball_map_id lookup
  const opdbToPmId = {};
  for (const m of pmData.machines) {
    if (m.opdb_id) opdbToPmId[m.opdb_id] = m.id;
  }

  const matched = machines.filter(m => opdbToPmId[m.id]);
  const unmatched = machines.filter(m => !opdbToPmId[m.id]);
  console.log(`  ${matched.length} machines matched on Pinball Map, ${unmatched.length} unmatched (locationCount=0)`);

  const enriched = [...unmatched.map(m => ({ ...m, locationCount: 0 }))];
  let done = 0;

  for (const machine of matched) {
    const pmId = opdbToPmId[machine.id];
    try {
      const r = await fetch(`https://pinballmap.com/api/v1/locations.json?by_machine_id=${pmId}&no_details=1`);
      const d = await r.json();
      enriched.push({ ...machine, locationCount: d.locations?.length ?? 0 });
    } catch {
      enriched.push({ ...machine, locationCount: 0 });
    }
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${matched.length} location counts fetched...`);
    await sleep(150); // be polite to the API
  }

  return enriched;
}

async function main() {
  const env = loadEnv();
  const apiKey = env.VITE_OPDB_KEY;

  let machines;
  try {
    machines = apiKey ? await fetchViaExport(apiKey) : await fetchViaTypeahead();
  } catch (e) {
    if (e.message.includes('429')) {
      console.error('OPDB rate limit hit. Wait a few minutes and try again.');
      process.exit(1);
    }
    console.warn('Export failed, falling back to typeahead:', e.message);
    machines = await fetchViaTypeahead();
  }

  machines = await enrichWithPopularity(machines);
  machines.sort((a, b) => a.parsedYear - b.parsedYear || a.name.localeCompare(b.name));

  fs.writeFileSync(OUT_PATH, JSON.stringify(machines, null, 2));
  console.log(`Wrote ${machines.length} machines to ${OUT_PATH}`);

  // Print top 10 by popularity for a sanity check
  const top10 = [...machines].sort((a, b) => b.locationCount - a.locationCount).slice(0, 10);
  console.log('\nTop 10 by location count:');
  top10.forEach((m, i) => console.log(`  ${i + 1}. ${m.name} (${m.parsedYear}) — ${m.locationCount} locations`));
}

main().catch(err => { console.error(err); process.exit(1); });
