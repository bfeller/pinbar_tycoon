import { useState, useEffect } from 'react';
import { extractYear } from '../utils/economy';

/**
 * Manages the OPDB database seeding and daily marketplace generation.
 * Fetches all machines from OPDB on mount (using API key if available),
 * then generates a daily market of new + used machines whenever the in-game date changes.
 */
export default function useMarketplace(time) {
  const [opdbDatabase, setOpdbDatabase] = useState([]);
  const [dailyMarket, setDailyMarket] = useState([]);

  // Seed local DB from OPDB
  useEffect(() => {
    const seedDatabase = async () => {
      const apiKey = import.meta.env.VITE_OPDB_KEY;
      if (apiKey) {
        try {
          const res = await fetch('https://opdb.org/api/export', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const data = await res.json();
          const allMachines = data.map(m => {
            let parsedYear = 2020;
            if (m.manufacture_date) {
              parsedYear = parseInt(m.manufacture_date.substring(0, 4));
            }
            return {
              id: m.opdb_id,
              name: m.name,
              supplementary: m.manufacturer?.name || 'Unknown Manufacturer',
              parsedYear
            };
          });
          setOpdbDatabase(allMachines);
          return;
        } catch (e) {
          console.error("Export API failed, falling back to typeahead", e);
        }
      }

      // Fallback: scrape via typeahead
      const queries = ['pinball', 'star', 'bally', 'stern', 'williams', 'gottlieb', 'data', 'a', 'e', 's', 't', 'm', 'p', 'space', 'monster', 'attack', 'trek'];
      const allMachines = [];
      const seenIds = new Set();

      for (const q of queries) {
        try {
          const res = await fetch(`https://opdb.org/api/search/typeahead?q=${q}`);
          const data = await res.json();
          for (const m of data) {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id);
              allMachines.push({ ...m, parsedYear: extractYear(m.supplementary) });
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setOpdbDatabase(allMachines);
    };
    seedDatabase();
  }, []);

  // Regenerate the daily market whenever the date or database changes
  useEffect(() => {
    if (opdbDatabase.length === 0) return;

    const newGames = opdbDatabase.filter(m => m.parsedYear === time.year);
    const olderGames = opdbDatabase.filter(m => m.parsedYear < time.year);
    const usedGamesCount = Math.floor(Math.random() * 5) + 1;
    const shuffledOlder = [...olderGames].sort(() => 0.5 - Math.random());
    const selectedUsed = shuffledOlder.slice(0, usedGamesCount);

    setDailyMarket([...newGames, ...selectedUsed]);
  }, [time.year, time.week, time.day, opdbDatabase]);

  return { opdbDatabase, dailyMarket };
}
