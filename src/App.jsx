import { useState, useEffect, useRef } from 'react';
import './index.css';
import { GRID_COLS, GRID_ROWS, DOOR_POS, BACKROOM_COLS, BACKROOM_ROWS } from './constants';
import { getMachineCells, findFreeSpace } from './utils/grid';
import { extractYear, calculatePrice } from './utils/economy';
import useMarketplace from './hooks/useMarketplace';
import useGameEngine from './hooks/useGameEngine';
import { UPGRADE_DEFS } from './data/upgrades';
import { STAFF_DEFS } from './data/staff';
import { EMAIL_DEFS } from './data/emails/index';
import { ARC_EVENTS, BUMPER_ZONE_MACHINES, LIQUIDATION_DURATION_DAYS } from './data/arcEvents';
import { EXPENSE_DEFS } from './data/expenses';
import TopBar from './components/TopBar';
import GameGrid from './components/GameGrid';
import Inventory from './components/Inventory';
import ReportModal from './components/ReportModal';
import Computer from './components/Computer';
import StartMenu from './components/StartMenu';
import EventNotification from './components/EventNotification';
import BankruptScreen from './components/BankruptScreen';
import WinScreen from './components/WinScreen';
import DecisionModal from './components/DecisionModal';

const SAVE_KEY = 'pinbar_tycoon_save';

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const LOG_MAX = Math.log1p(1200);

// Convert game time to a comparable linear day number
function toLinearDay({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}

// Add N in-game days to a time object
function addGameDays({ year, week, day }, days) {
  let d = day + days;
  let w = week;
  let y = year;
  while (d > 3) { d -= 3; w++; if (w > 10) { w = 1; y++; } }
  return { year: y, week: w, day: d };
}

const DEFAULT_UPGRADES = { electronics: 0, mixology: 0, quantum: 0, marketing: 0, psychology: 0, electrical_eng: 0, social_media: 0, supply_chain: 0, charm: 0 };
const DEFAULT_BARTENDER = { x: null, y: null, status: 'idle', path: [], pathIndex: 0 };
const DEFAULT_STAFF = { server: 0, repairman: false };
const makeServerEntity = () => ({ id: 'server-' + Date.now() + Math.random(), x: null, y: null, status: 'idle', path: [], pathIndex: 0, targetCustId: null, targetBartopId: null, timer: 0 });

function App() {
  // ── Screen / identity ──
  const [screen, setScreen] = useState('start');
  const [savedGame, setSavedGame] = useState(() => loadSave());
  const [pinbarName, setPinbarName] = useState('');
  const [characterName, setCharacterName] = useState('');

  // ── Core state ──
  const [time, setTime] = useState({ year: 1975, week: 1, day: 1 });
  const [dayState, setDayState] = useState('BUILD');
  const [dayTimer, setDayTimer] = useState(0);
  const [dailyReport, setDailyReport] = useState({ income: 0, damage: [], satisfied: 0, unsatisfied: 0 });
  const [financialHistory, setFinancialHistory] = useState([]);
  const [popularity, setPopularity] = useState(0);
  const [cash, setCash] = useState(25000);
  const [repairsRemaining, setRepairsRemaining] = useState(5);
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bartender, setBartender] = useState({ x: null, y: null, status: 'idle', path: [], pathIndex: 0 });

  // ── Upgrades ──
  const [enrolledCourses, setEnrolledCourses] = useState([]); // [{ id, name, icon, completesAt }]
  const [upgrades, setUpgrades] = useState({
    electronics: 0,    // +2% repair capacity per level (max 3)
    mixology: 0,       // bartender 40%/100% faster (max 2)
    quantum: 0,        // +1 backroom row per level (max 3)
    marketing: 0,      // more customer spawns per level (max 2)
    psychology: 0,     // longer customer patience per level (max 2)
    electrical_eng: 0, // 10% less machine damage per level (max 3)
    social_media: 0,   // +50% popularity gain per level (max 2)
    supply_chain: 0,   // 10% purchase discount per level (max 2)
  });

  // ── Staff ──
  const [staff, setStaff] = useState(DEFAULT_STAFF);
  const [servers, setServers] = useState([]);

  // ── Email state ──
  const [inbox, setInbox] = useState([]); // [{ ...emailDef, read, choiceMade }]

  // ── Arc event state ──
  const [firedArcEventIds, setFiredArcEventIds] = useState(new Set());
  const [popGainMult, setPopGainMult] = useState(1.0);
  const [liquidationLot, setLiquidationLot] = useState([]);
  const [liquidationExpiryDay, setLiquidationExpiryDay] = useState(null);

  // ── Decision events ──
  const [activeDecision, setActiveDecision] = useState(null); // resolved { ...def, message }
  const [decisions, setDecisions] = useState({});             // { flagId: true, ... }
  const isPausedRef = useRef(false);

  // ── Event notification ──
  const [notification, setNotification] = useState(null); // { label, message, severity }
  const [gameOverStats, setGameOverStats] = useState(null);
  const [winStats, setWinStats] = useState(null);

  // ── UI state ──
  const [marketTab, setMarketTab] = useState('pinball');
  const [placementMachine, setPlacementMachine] = useState(null);
  const [placementRotation, setPlacementRotation] = useState('N');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [isComputerOpen, setIsComputerOpen] = useState(false);

  // ── Derived upgrade values ──
  const repairCapacity = 5 + upgrades.electronics * 2;
  const backroomRows = BACKROOM_ROWS + upgrades.quantum;
  const purchaseDiscount = upgrades.supply_chain * 0.10;
  const upgradeValues = {
    patienceTicks: 30 + upgrades.psychology * 15,
    spawnBoost: upgrades.marketing * 0.08,
    damageReduction: upgrades.electrical_eng * 0.10,
    bartenderSpeed: 1 + upgrades.mixology * 0.5,
    charm: upgrades.charm,
    drinkPatienceMult: staff.server > 0 ? 2 : 1,
    drinkRevenue: staff.server > 0 ? 20 : 15,
    repairmanActive: staff.repairman,
    repairmanCoverage: staff.repairman ? 10 : 0,
  };

  // ── Hooks ──
  const { dailyMarket, soldOutIds, markSoldOut } = useMarketplace(time);

  const handleEvent = (event) => {
    setNotification(event);
  };

  const handleDecision = (eventDef, ctx) => {
    setActiveDecision({ ...eventDef, message: eventDef.getMessage(ctx) });
  };

  const handleChoice = (choice) => {
    setDecisions(prev => ({ ...prev, [choice.flagId]: true }));

    if (choice.effect === 'income_delta') {
      setCash(c => c + choice.effectValue);
    } else if (choice.effect === 'popularity_delta') {
      setPopularity(p => Math.max(0, p + choice.effectValue));
    } else if (choice.effect === 'machine_damage') {
      const placed = machines.filter(m => (m.type === 'pinball' || !m.type) && m.x !== null && m.durability > 0);
      if (placed.length > 0) {
        const target = placed.reduce((a, b) => a.durability < b.durability ? a : b);
        setMachines(prev => prev.map(m =>
          m.id === target.id ? { ...m, durability: Math.max(0, m.durability - choice.effectValue) } : m
        ));
      }
    }

    if (choice.effect2 === 'income_delta') {
      setCash(c => c + choice.effect2Value);
    } else if (choice.effect2 === 'popularity_delta') {
      setPopularity(p => Math.max(0, p + choice.effect2Value));
    }

    setNotification({ label: activeDecision.label, ...choice.resolution });
    setActiveDecision(null);
    isPausedRef.current = false;
  };

  useGameEngine({
    dayState, setDayState,
    dayTimer, setDayTimer,
    machines, setMachines,
    customers, setCustomers,
    cash, setCash,
    bartender, setBartender,
    servers, setServers,
    dailyReport, setDailyReport,
    time,
    popularity,
    upgradeValues,
    decisions,
    isPausedRef,
    onEvent: handleEvent,
    onDecision: handleDecision,
  });

  // ── Keyboard: rotate placement ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        if (dayState === 'REPORT') return;
        setPlacementRotation(prev => {
          const rots = ['N', 'E', 'S', 'W'];
          return rots[(rots.indexOf(prev) + 1) % 4];
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dayState]);

  // ── Auto-save on day advance ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (screen !== 'game') return;
    const save = {
      version: 1,
      pinbarName, characterName, time, cash, machines, popularity,
      repairsRemaining, upgrades, enrolledCourses, inbox,
      firedArcEventIds: [...firedArcEventIds],
      popGainMult, liquidationLot, liquidationExpiryDay, staff,
      serverCount: staff.server,
      financialHistory, decisions,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [time]); // intentionally only fires on day advance

  // ── New game / Continue ──
  const handleNewGame = (barName, charName) => {
    localStorage.removeItem(SAVE_KEY);
    setPinbarName(barName);
    setCharacterName(charName);
    setTime({ year: 1975, week: 1, day: 1 });
    setDayState('BUILD');
    setDayTimer(0);
    setDailyReport({ income: 0, damage: [], satisfied: 0, unsatisfied: 0 });
    setFinancialHistory([]);
    setPopularity(0);
    setCash(25000);
    setRepairsRemaining(5);
    setMachines([]);
    setCustomers([]);
    setBartender(DEFAULT_BARTENDER);
    setUpgrades(DEFAULT_UPGRADES);
    setEnrolledCourses([]);
    setInbox([]);
    setFiredArcEventIds(new Set());
    setPopGainMult(1.0);
    setLiquidationLot([]);
    setLiquidationExpiryDay(null);
    setStaff(DEFAULT_STAFF);
    setServers([]);
    setDecisions({});
    setScreen('game');
  };

  const handleContinue = () => {
    const s = savedGame;
    if (!s) return;
    setPinbarName(s.pinbarName ?? 'My Bar');
    setCharacterName(s.characterName ?? 'Player');
    setTime(s.time ?? { year: 1975, week: 1, day: 1 });
    setDayState('BUILD');
    setDayTimer(0);
    setDailyReport({ income: 0, damage: [], satisfied: 0, unsatisfied: 0 });
    setPopularity(s.popularity ?? 0);
    setCash(s.cash ?? 25000);
    setRepairsRemaining(s.repairsRemaining ?? 5);
    setMachines(s.machines ?? []);
    setCustomers([]);
    setBartender(DEFAULT_BARTENDER);
    setUpgrades(s.upgrades ?? DEFAULT_UPGRADES);
    setEnrolledCourses(s.enrolledCourses ?? []);
    setInbox(s.inbox ?? []);
    setFiredArcEventIds(new Set(s.firedArcEventIds ?? []));
    setPopGainMult(s.popGainMult ?? 1.0);
    setLiquidationLot(s.liquidationLot ?? []);
    setLiquidationExpiryDay(s.liquidationExpiryDay ?? null);
    const savedStaff = s.staff ?? DEFAULT_STAFF;
    setStaff({
      server: typeof savedStaff.server === 'number' ? savedStaff.server : (savedStaff.server ? 1 : 0),
      repairman: savedStaff.repairman ?? false,
    });
    const serverCount = typeof savedStaff.server === 'number' ? savedStaff.server : (savedStaff.server ? 1 : 0);
    setServers(Array.from({ length: serverCount }, makeServerEntity));
    setFinancialHistory(s.financialHistory ?? []);
    setDecisions(s.decisions ?? {});
    setScreen('game');
  };

  // ── Actions ──
  const startDay = () => {
    if (dayState === 'BUILD') setDayState('RUNNING');
  };

  const purchaseUpgrade = (id, cost) => {
    if (cash < cost || dayState === 'REPORT') return false;
    if (enrolledCourses.length > 0) return false;
    const def = UPGRADE_DEFS.find(d => d.id === id);
    if (!def) return false;
    setCash(c => c - cost);
    setEnrolledCourses(prev => [...prev, {
      id,
      name: def.name,
      icon: def.icon,
      completesAt: addGameDays(time, def.duration),
    }]);
    return true;
  };

  const hireStaff = (id) => {
    if (dayState === 'RUNNING') return false;
    const def = STAFF_DEFS.find(d => d.id === id);
    if (!def) return false;
    if (id === 'server') {
      const max = def.maxCount ?? 1;
      if (staff.server >= max) return false;
      setStaff(prev => ({ ...prev, server: prev.server + 1 }));
      setServers(prev => [...prev, makeServerEntity()]);
      return true;
    }
    if (staff[id]) return false;
    setStaff(prev => ({ ...prev, [id]: true }));
    return true;
  };

  const fireStaff = (id) => {
    if (dayState === 'RUNNING') return false;
    if (id === 'server') {
      if (staff.server <= 0) return false;
      setStaff(prev => ({ ...prev, server: prev.server - 1 }));
      setServers(prev => prev.slice(0, -1));
      return true;
    }
    setStaff(prev => ({ ...prev, [id]: false }));
    return true;
  };

  const buyMachine = (machine) => {
    if (dayState === 'REPORT') return false;
    const mYear = machine.parsedYear || extractYear(machine.supplementary);
    const durability = machine.durability ?? 100;
    const rawPrice = calculatePrice(mYear, time.year, durability, machine.locationCount ?? 0);
    const price = rawPrice ? Math.floor(rawPrice * (1 - purchaseDiscount)) : null;

    if (price && cash >= price) {
      const backroomMachines = machines.filter(m => m.room === 'backroom');
      let placeCoords = findFreeSpace('pinball', 'N', backroomMachines, BACKROOM_COLS, backroomRows);
      let assignedRoom = 'backroom';

      if (!placeCoords) {
        const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
        placeCoords = findFreeSpace('pinball', 'N', mainMachines, GRID_COLS, GRID_ROWS, DOOR_POS);
        assignedRoom = 'main';
      }

      if (!placeCoords) {
        alert("No storage space available! Clear some room.");
        return false;
      }

      setCash(c => c - price);
      markSoldOut(machine.id);
      setMachines(prev => [...prev, {
        id: machine.id + '-' + Date.now(),
        type: 'pinball',
        name: machine.name,
        year: mYear,
        durability,
        locationCount: machine.locationCount ?? 0,
        imageUrl: machine.imageUrl ?? null,
        x: placeCoords.x, y: placeCoords.y,
        room: assignedRoom,
        orientation: 'N'
      }]);
      return true;
    }
    return false;
  };

  const buySupply = (type) => {
    if (dayState === 'REPORT') return false;
    const priceMap = { kegerator: 1000, bartop: 500, bathroom: 2000 };
    const nameMap = { kegerator: 'Kegerator', bartop: 'Bartop', bathroom: 'Bathroom' };
    const price = priceMap[type] ?? 500;
    const name = nameMap[type] ?? type;
    if (cash >= price) {
      // Bathrooms must go in the main room — customers need to reach them
      const skipBackroom = type === 'bathroom';
      let placeCoords = null;
      let assignedRoom = 'main';

      if (!skipBackroom) {
        const backroomMachines = machines.filter(m => m.room === 'backroom');
        placeCoords = findFreeSpace(type, 'N', backroomMachines, BACKROOM_COLS, backroomRows);
        if (placeCoords) assignedRoom = 'backroom';
      }

      if (!placeCoords) {
        const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
        placeCoords = findFreeSpace(type, 'N', mainMachines, GRID_COLS, GRID_ROWS, DOOR_POS);
        assignedRoom = 'main';
      }

      if (!placeCoords) {
        alert("No storage space available! Clear some room.");
        return false;
      }

      setCash(c => c - price);
      setMachines(prev => [...prev, {
        id: type + '-' + Date.now(),
        type,
        name,
        year: time.year,
        durability: 100,
        x: placeCoords.x, y: placeCoords.y,
        room: assignedRoom,
        orientation: 'N'
      }]);
      return true;
    }
    return false;
  };

  const sellMachine = (m) => {
    if (dayState !== 'BUILD') return;
    const sellValue = calculatePrice(m.year, time.year, m.durability, m.locationCount ?? 0);
    if (sellValue) {
      setCash(c => c + sellValue);
      setMachines(prev => prev.filter(machine => machine.id !== m.id));
      if (placementMachine === m.id) setPlacementMachine(null);
    }
  };

  const repairMachine = (id) => {
    if (dayState === 'RUNNING') return;
    const m = machines.find(mac => mac.id === id);
    if (!m || m.durability >= 100 || repairsRemaining <= 0) return;

    const damageToFix = Math.min(repairsRemaining, 100 - m.durability);
    if (damageToFix <= 0) return;
    const cost = damageToFix * 10;

    if (cash >= cost) {
      setCash(c => c - cost);
      setRepairsRemaining(r => r - damageToFix);
      setMachines(prev => prev.map(mac => mac.id === id ? { ...mac, durability: mac.durability + damageToFix } : mac));
    }
  };

  const handleEmailChoice = (emailId, effectId) => {
    if (effectId === 'reg_machine') {
      // Reg's dodgy Bally: costs $800, 1978 machine, 65% durability
      if (cash >= 800) {
        setCash(c => c - 800);
        const backroomMachines = machines.filter(m => m.room === 'backroom');
        let placeCoords = findFreeSpace('pinball', 'N', backroomMachines, BACKROOM_COLS, backroomRows);
        let assignedRoom = 'backroom';
        if (!placeCoords) {
          const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
          placeCoords = findFreeSpace('pinball', 'N', mainMachines, GRID_COLS, GRID_ROWS, DOOR_POS);
          assignedRoom = 'main';
        }
        if (placeCoords) {
          setMachines(prev => [...prev, {
            id: 'reg_bally-' + Date.now(),
            type: 'pinball',
            name: "Reg's Bally (1978)",
            year: 1978,
            durability: 65,
            locationCount: 0,
            x: placeCoords.x, y: placeCoords.y,
            room: assignedRoom,
            orientation: 'N'
          }]);
        }
      }
    }
    setInbox(prev => prev.map(e => e.id === emailId ? { ...e, read: true, choiceMade: true } : e));
  };

  const markEmailRead = (emailId) => {
    setInbox(prev => prev.map(e => e.id === emailId ? { ...e, read: true } : e));
  };

  const buyLiquidationMachine = (machine) => {
    if (dayState === 'REPORT') return false;
    const rawPrice = calculatePrice(machine.parsedYear, time.year, machine.durability, machine.locationCount ?? 0);
    const price = rawPrice ? Math.floor(rawPrice * 0.40) : null; // 60% off — Reg needs it gone

    if (price && cash >= price) {
      const backroomMachines = machines.filter(m => m.room === 'backroom');
      let placeCoords = findFreeSpace('pinball', 'N', backroomMachines, BACKROOM_COLS, backroomRows);
      let assignedRoom = 'backroom';
      if (!placeCoords) {
        const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
        placeCoords = findFreeSpace('pinball', 'N', mainMachines, GRID_COLS, GRID_ROWS, DOOR_POS);
        assignedRoom = 'main';
      }
      if (!placeCoords) {
        alert("No storage space available! Clear some room.");
        return false;
      }
      setCash(c => c - price);
      setLiquidationLot(prev => prev.filter(m => m.id !== machine.id));
      setMachines(prev => [...prev, {
        id: machine.id + '-' + Date.now(),
        type: 'pinball',
        name: machine.name,
        year: machine.parsedYear,
        durability: machine.durability,
        locationCount: machine.locationCount ?? 0,
        imageUrl: machine.imageUrl ?? null,
        x: placeCoords.x, y: placeCoords.y,
        room: assignedRoom,
        orientation: 'N',
      }]);
      return true;
    }
    return false;
  };

  const handleCellClick = (x, y, roomType = 'main') => {
    if (dayState === 'REPORT') return;

    const cols = roomType === 'main' ? GRID_COLS : BACKROOM_COLS;
    const rows = roomType === 'main' ? GRID_ROWS : backroomRows;
    const roomMachines = machines.filter(m => (roomType === 'main' ? (m.room === 'main' || !m.room) : m.room === 'backroom'));

    if (placementMachine) {
      const machineType = machines.find(m => m.id === placementMachine)?.type;
      const cells = getMachineCells(machineType, x, y, placementRotation);
      if (cells.some(c => c.x < 0 || c.x >= cols || c.y < 0 || c.y >= rows)) return;

      let occupied = false;
      roomMachines.forEach(m => {
        if (m.x !== null && m.y !== null && m.id !== placementMachine) {
          const mCells = getMachineCells(m.type, m.x, m.y, m.orientation);
          if (mCells.some(mc => cells.some(c => c.x === mc.x && c.y === mc.y))) occupied = true;
        }
      });
      if (roomType === 'main' && cells.some(c => c.x === DOOR_POS.x && c.y === DOOR_POS.y)) occupied = true;
      if (occupied) return;

      setMachines(prev => prev.map(m => m.id === placementMachine ? { ...m, x, y, room: roomType, orientation: placementRotation } : m));
      setPlacementMachine(null);
    } else {
      const clickedMachine = roomMachines.find(m => {
        if (m.x === null) return false;
        const mCells = getMachineCells(m.type, m.x, m.y, m.orientation);
        return mCells.some(c => c.x === x && c.y === y);
      });
      if (clickedMachine) {
        if (customers.some(c => c.machineId === clickedMachine.id)) return;
        setPlacementMachine(clickedMachine.id);
        setPlacementRotation(clickedMachine.orientation || 'N');
        setMachines(prev => prev.map(m => m.id === clickedMachine.id ? { ...m, x: null, y: null, room: null } : m));
      }
    }
  };

  const nextDay = () => {
    // Advance time
    let { year, week, day } = time;
    day += 1;
    if (day > 3) { day = 1; week += 1; }
    if (week > 10) { week = 1; year += 1; }
    const newTime = { year, week, day };
    const newLinear = toLinearDay(newTime);

    // Win condition — reach 2026
    if (newTime.year >= 2026) {
      localStorage.removeItem(SAVE_KEY);
      setSavedGame(null);
      setWinStats({ pinbarName, characterName, time: newTime, cash, popularity, machineCount: machines.length });
      setScreen('win');
      return;
    }

    // Weekly expenses — fire on the first day of each new week
    const weeklyExpenses = [];
    if (newTime.day === 1) {
      const weekNum = (newTime.year - 1975) * 10 + newTime.week;
      for (const def of EXPENSE_DEFS) {
        if (def.startYear && newTime.year < def.startYear) continue;
        if ((weekNum - 1) % def.frequencyWeeks === 0) {
          const amount = typeof def.amount === 'function' ? def.amount(newTime) : def.amount;
          weeklyExpenses.push({ id: def.id, name: def.name, icon: def.icon, amount });
        }
      }
      // Staff salaries
      for (const def of STAFF_DEFS) {
        const val = staff[def.id];
        const count = typeof val === 'number' ? val : (val ? 1 : 0);
        if (count > 0) weeklyExpenses.push({ id: `salary_${def.id}`, name: `${def.name} ×${count} (salary)`, icon: def.icon, amount: def.weeklySalary * count });
      }
      const totalExpenses = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
      if (totalExpenses > 0) {
        const newCash = cash - totalExpenses;
        setCash(newCash);
        if (newCash < 0) {
          localStorage.removeItem(SAVE_KEY);
          setSavedGame(null);
          setGameOverStats({ pinbarName, characterName, time: newTime, cash: newCash, popularity });
          setScreen('bankrupt');
          return;
        }
      }
    }

    // Record this day's financials before resetting dailyReport
    const expenseTotal = weeklyExpenses.reduce((s, e) => s + e.amount, 0);
    setFinancialHistory(prev => [...prev, {
      year: time.year,
      week: time.week,
      day: time.day,
      income: dailyReport.income,
      totalExpenses: expenseTotal,
      net: dailyReport.income - expenseTotal,
    }]);

    // Check for courses completing on or before the new day
    const justCompleted = enrolledCourses.filter(c => toLinearDay(c.completesAt) <= newLinear);
    const stillEnrolled  = enrolledCourses.filter(c => toLinearDay(c.completesAt) >  newLinear);

    // Apply completed upgrades — compute new upgrade state synchronously
    // so repair capacity is correct when set below
    const newUpgrades = { ...upgrades };
    justCompleted.forEach(c => { newUpgrades[c.id] = (newUpgrades[c.id] ?? 0) + 1; });
    if (justCompleted.length > 0) setUpgrades(newUpgrades);
    setEnrolledCourses(stillEnrolled);

    // Arc events — check against current inbox sentIds before new emails are added
    const currentSentIds = new Set(inbox.map(e => e.id));
    const newFiredIds = new Set(firedArcEventIds);
    let arcPopDelta = 0;
    let newGainMult = popGainMult;
    let openLiquidation = false;

    for (const event of ARC_EVENTS) {
      if (event.trigger({ time: newTime, firedIds: newFiredIds, sentIds: currentSentIds })) {
        newFiredIds.add(event.id);
        if (event.popularityPct) arcPopDelta += event.popularityPct;
        if (event.setGainMult !== undefined) newGainMult = event.setGainMult;
        if (event.triggerLiquidation) openLiquidation = true;
      }
    }
    if (newFiredIds.size > firedArcEventIds.size) setFiredArcEventIds(newFiredIds);
    if (newGainMult !== popGainMult) setPopGainMult(newGainMult);
    if (openLiquidation) {
      setLiquidationLot(BUMPER_ZONE_MACHINES.map(m => ({ ...m })));
      setLiquidationExpiryDay(toLinearDay(newTime) + LIQUIDATION_DURATION_DAYS);
    }

    // Expire liquidation lot if its window has passed
    if (liquidationExpiryDay !== null && toLinearDay(newTime) >= liquidationExpiryDay) {
      setLiquidationLot([]);
      setLiquidationExpiryDay(null);
    }

    // Popularity — arc one-time delta is a fraction of current popularity
    const machineScore = Math.floor(
      machines
        .filter(m => m.type === 'pinball' && m.room === 'main' && m.x !== null)
        .reduce((sum, m) => sum + 1 + (Math.log1p(m.locationCount ?? 0) / LOG_MAX) * 2, 0)
    );
    const customerDelta = (dailyReport.satisfied ?? 0) - (dailyReport.unsatisfied ?? 0);
    const socialBoost = 1 + newUpgrades.social_media * 0.5;
    setPopularity(p => {
      const arcHit = Math.round(p * arcPopDelta);
      const dailyGain = Math.round((machineScore + customerDelta) * socialBoost * newGainMult);
      const eventDelta = dailyReport.eventPopularityDelta ?? 0;
      return Math.max(0, p + dailyGain + arcHit + eventDelta);
    });

    setTime(newTime);

    // Check for new emails (read inbox from closure — safe inside a click handler)
    const sentIds = new Set(inbox.map(e => e.id));
    const emailState = { time: newTime, popularity, cash, machines, sentIds };
    const newEmails = EMAIL_DEFS.filter(def => !sentIds.has(def.id) && def.trigger(emailState));

    if (newEmails.length > 0) {
      setInbox(prev => [...prev, ...newEmails.map(def => ({ ...def, read: false, choiceMade: false }))]);

      // Fire any events attached to incoming emails
      let emailPopDelta = 0;
      const emailEvents = [];
      let lastNotification = null;
      for (const email of newEmails) {
        if (!email.event) continue;
        const ev = email.event;
        if (ev.effect === 'popularity_delta') emailPopDelta += ev.effectValue;
        if (ev.effect === 'income_delta') setCash(c => c + ev.effectValue);
        const record = { id: email.id, label: ev.label, severity: ev.severity, message: ev.message };
        emailEvents.push(record);
        lastNotification = record;
      }
      if (emailEvents.length > 0) {
        setDailyReport(r => ({
          ...r,
          events: [...(r.events ?? []), ...emailEvents],
          eventPopularityDelta: (r.eventPopularityDelta ?? 0) + emailPopDelta,
        }));
        setNotification(lastNotification);
      }
    }

    setDayState('BUILD');
    setDayTimer(0);
    setDailyReport({
      income: 0,
      damage: [],
      satisfied: 0,
      unsatisfied: 0,
      forgiven: 0,
      unsatisfiedReasons: {},
      events: [],
      eventPopularityDelta: 0,
      completedCourses: justCompleted.map(c => ({ name: c.name, icon: c.icon })),
      expenses: weeklyExpenses,
    });
    setRepairsRemaining(5 + newUpgrades.electronics * 2);
  };

  // ── Derived data ──
  const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
  const backroomMachines = machines.filter(m => m.room === 'backroom');
  const placementMachineType = machines.find(m => m.id === placementMachine)?.type;

  // ── Render ──
  if (screen === 'start') {
    return <StartMenu savedGame={savedGame} onNewGame={handleNewGame} onContinue={handleContinue} />;
  }

  if (screen === 'bankrupt') {
    return (
      <BankruptScreen
        stats={gameOverStats}
        onRestart={() => { setGameOverStats(null); setScreen('start'); }}
      />
    );
  }

  if (screen === 'win') {
    return (
      <WinScreen
        stats={winStats}
        onRestart={() => { setWinStats(null); setScreen('start'); }}
      />
    );
  }

  return (
    <div className="game-container">
      <TopBar
        pinbarName={pinbarName}
        time={time}
        cash={cash}
        repairsRemaining={repairsRemaining}
        repairCapacity={repairCapacity}
        popularity={popularity}
        placementMachine={placementMachine}
        dayState={dayState}
        dayTimer={dayTimer}
        startDay={startDay}
        setIsComputerOpen={setIsComputerOpen}
        unreadEmails={inbox.filter(e => !e.read).length}
      />

      {notification && (
        <EventNotification
          notification={notification}
          onDismiss={() => setNotification(null)}
        />
      )}

      {activeDecision && (
        <DecisionModal
          event={activeDecision}
          onChoice={handleChoice}
        />
      )}

      <div className="play-area grid-mode">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Main Floor</h3>
            <GameGrid
              machines={mainMachines}
              customers={customers}
              bartender={bartender}
              servers={servers}
              hoveredCell={hoveredCell}
              placementMachine={placementMachine}
              placementRotation={placementRotation}
              handleCellClick={(x, y) => handleCellClick(x, y, 'main')}
              setHoveredCell={setHoveredCell}
              gridId="main"
              placementMachineType={placementMachineType}
              dayState={dayState}
            />
          </div>

          <Inventory
            backroomMachines={backroomMachines}
            backroomRows={backroomRows}
            dayState={dayState}
            time={time}
            cash={cash}
            repairsRemaining={repairsRemaining}
            hoveredCell={hoveredCell}
            placementMachine={placementMachine}
            placementRotation={placementRotation}
            handleCellClick={(x, y) => handleCellClick(x, y, 'backroom')}
            setHoveredCell={setHoveredCell}
            repairMachine={repairMachine}
            sellMachine={sellMachine}
            placementMachineType={placementMachineType}
          />
        </div>

        {dayState === 'REPORT' && (
          <ReportModal
            dailyReport={dailyReport}
            machines={machines}
            popularity={popularity}
            upgrades={upgrades}
            repairsRemaining={repairsRemaining}
            cash={cash}
            repairMachine={repairMachine}
            nextDay={nextDay}
          />
        )}

        {isComputerOpen && (
          <Computer
            time={time}
            cash={cash}
            dayState={dayState}
            marketTab={marketTab}
            setMarketTab={setMarketTab}
            dailyMarket={dailyMarket}
            soldOutIds={soldOutIds}
            buyMachine={buyMachine}
            buySupply={buySupply}
            upgrades={upgrades}
            enrolledCourses={enrolledCourses}
            purchaseUpgrade={purchaseUpgrade}
            purchaseDiscount={purchaseDiscount}
            inbox={inbox}
            onEmailChoice={handleEmailChoice}
            onEmailRead={markEmailRead}
            characterName={characterName}
            liquidationLot={liquidationLot}
            buyLiquidationMachine={buyLiquidationMachine}
            staff={staff}
            onHireStaff={hireStaff}
            onFireStaff={fireStaff}
            financialHistory={financialHistory}
            closeComputer={() => setIsComputerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
