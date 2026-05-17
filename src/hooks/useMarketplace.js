import { useState, useEffect } from 'react';
import opdbData from '../data/pinball_machines.json';

// Weighted random durability for used machines.
// Skewed toward better condition — most sellers aren't listing junkers.
function randomUsedDurability() {
  const r = Math.random();
  if (r < 0.20) return Math.floor(Math.random() * 6)  + 95; // 95–100  Mint
  if (r < 0.45) return Math.floor(Math.random() * 10) + 80; // 80–89   Excellent
  if (r < 0.65) return Math.floor(Math.random() * 15) + 65; // 65–79   Good
  if (r < 0.82) return Math.floor(Math.random() * 20) + 45; // 45–64   Playable
  if (r < 0.93) return Math.floor(Math.random() * 20) + 25; // 25–44   Rough
  return Math.floor(Math.random() * 25) + 1;                // 1–25    Project
}

/**
 * Manages daily marketplace generation from the static OPDB dataset.
 * To refresh the machine database run: npm run fetch-opdb
 */
export default function useMarketplace(time) {
  const [dailyMarket, setDailyMarket] = useState([]);
  const [soldOutIds, setSoldOutIds] = useState(new Set());

  const markSoldOut = (id) => setSoldOutIds(prev => new Set([...prev, id]));

  // Regenerate the daily market whenever the in-game date changes
  useEffect(() => {
    const newGames = opdbData.filter(m => m.parsedYear === time.year);
    const olderGames = opdbData.filter(m => m.parsedYear < time.year);
    const newGamesCount = Math.floor(Math.random() * 4) + 3; // 3–6
    const usedGamesCount = Math.floor(Math.random() * 3) + 2; // 2–4
    const selectedNew = [...newGames].sort(() => 0.5 - Math.random()).slice(0, newGamesCount);
    const selectedUsed = [...olderGames]
      .sort(() => 0.5 - Math.random())
      .slice(0, usedGamesCount)
      .map(m => ({ ...m, durability: randomUsedDurability() }));

    setSoldOutIds(new Set());
    setDailyMarket([...selectedNew, ...selectedUsed]);
  }, [time.year, time.week, time.day]);

  return { dailyMarket, soldOutIds, markSoldOut };
}
