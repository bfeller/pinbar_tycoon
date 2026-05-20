import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { GRID_COLS, GRID_ROWS, DOOR_POS, BACKROOM_COLS, BACKROOM_ROWS, DAY_LENGTH_SECONDS } from './constants';
import { getMachineCells, findFreeSpace } from './utils/grid';
import { extractYear, calculatePrice, BAR_SUPPLY_PURCHASE_PRICE } from './utils/economy';
import { calcCustomerPopDelta, calcDailyPopGain } from './utils/popularity';
import useMarketplace from './hooks/useMarketplace';
import useGameEngine from './hooks/useGameEngine';
import { UPGRADE_DEFS } from './data/upgrades';
import { STAFF_DEFS } from './data/staff';
import { EMAIL_DEFS } from './data/emails/index';
import { ARC_EVENTS, BUMPER_ZONE_MACHINES, LIQUIDATION_DURATION_DAYS } from './data/arcEvents';
import { EXPENSE_DEFS, medicalExpenseAmount } from './data/expenses';
import { INVESTMENT_DEFS } from './data/banking';
import TopBar from './components/TopBar';
import PlayActions from './components/PlayActions';
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


const LOG_MAX = Math.log1p(1200); // normalise locationCount — ~peak observed value

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

const DEFAULT_UPGRADES = { electronics: 0, mixology: 0, quantum: 0, marketing: 0, psychology: 0, electrical_eng: 0, social_media: 0, supply_chain: 0, charm: 0, liquor_licensing: 0, tech_training: 0 };
const DEFAULT_BARTENDER = { id: 'bartender', x: null, y: null, status: 'idle', path: [], pathIndex: 0, targetCustId: null, targetBartopId: null, targetStationId: null, targetStationType: null, timer: 0 };
const DEFAULT_STAFF = { server: 0, repairman: false };
const makeServerEntity = () => ({ id: 'server-' + Date.now() + Math.random(), x: null, y: null, status: 'idle', path: [], pathIndex: 0, targetCustId: null, targetBartopId: null, targetStationId: null, targetStationType: null, timer: 0 });

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
  const [spendPopups, setSpendPopups] = useState([]);
  const spendPopupIdRef = useRef(0);
  const [bartender, setBartender] = useState({ ...DEFAULT_BARTENDER });

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
    liquor_licensing: 0, // +5s operating day per level (max 3)
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

  // ── Banking ──
  const [activeInvestment, setActiveInvestment] = useState(null);
  // { defId, productName, amount, depositedAt, maturesAt, returnAmount }
  const [activeLoan, setActiveLoan] = useState(null);
  // { amount, weeklyPayment, weeksRemaining }
  const [medicalBills, setMedicalBills] = useState([]);

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
  const [fastForward, setFastForward] = useState(false);

  // ── Week run ──
  const [autoRunTotal, setAutoRunTotal] = useState(null);
  const [autoRunRemaining, setAutoRunRemaining] = useState(null);
  const [autoRunSummary, setAutoRunSummary] = useState(null);
  const [showAutoRunSummary, setShowAutoRunSummary] = useState(false);
  const [autoRunStartPop, setAutoRunStartPop] = useState(0);
  const autoRunRemainingRef = useRef(null);
  const autoRunPendingStartRef = useRef(false);

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
    cocktailRevenue: staff.server > 0 ? 35 : 25,
    repairPower: [3, 4, 5][upgrades.tech_training ?? 0],
    repairmanActive: staff.repairman,
    repairmanCoverage: staff.repairman ? [10, 15, 25][upgrades.tech_training ?? 0] : 0,
    dayLengthSeconds: DAY_LENGTH_SECONDS + (upgrades.liquor_licensing ?? 0) * 5,
    liquor_licensing: upgrades.liquor_licensing ?? 0,
  };

  // ── Hooks ──
  const { dailyMarket, soldOutIds, markSoldOut } = useMarketplace(time);

  const handleEvent = (event) => {
    setNotification(event);
  };

  const handleDecision = (eventDef, ctx) => {
    setActiveDecision({ ...eventDef, message: eventDef.getMessage(ctx) });
  };

  const addSpendPopup = useCallback(({ x, y, amount }) => {
    const id = ++spendPopupIdRef.current;
    setSpendPopups(prev => [...prev, { id, x, y, amount }]);
    setTimeout(() => {
      setSpendPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);

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
    fastForward,
    onEvent: handleEvent,
    onDecision: handleDecision,
    onCustomerSpend: addSpendPopup,
  });

  // ── Rotate placement (keyboard R or rotate button) ──
  const rotatePlacement = () => {
    if (dayState === 'REPORT') return;
    setPlacementRotation(prev => {
      const rots = ['N', 'E', 'S', 'W'];
      return rots[(rots.indexOf(prev) + 1) % 4];
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') rotatePlacement();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dayState]); // eslint-disable-line react-hooks/exhaustive-deps

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
      activeInvestment, activeLoan, medicalBills,
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
    setSpendPopups([]);
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
    setActiveInvestment(null);
    setActiveLoan(null);
    setMedicalBills([]);
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
    setSpendPopups([]);
    setBartender(DEFAULT_BARTENDER);
    setUpgrades({ ...DEFAULT_UPGRADES, ...(s.upgrades ?? {}) });
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
    setActiveInvestment(s.activeInvestment ?? null);
    setActiveLoan(s.activeLoan ?? null);
    setMedicalBills(s.medicalBills ?? []);
    setScreen('game');
  };

  // ── Actions ──
  const startDay = () => {
    if (dayState === 'BUILD') {
      setDayTimer(0);
      setDayState('RUNNING');
    }
  };

  const WEEK_DAYS = 3;
  const startWeek = () => {
    if (dayState !== 'BUILD') return;
    setAutoRunTotal(WEEK_DAYS);
    setAutoRunRemaining(WEEK_DAYS);
    autoRunRemainingRef.current = WEEK_DAYS;
    setAutoRunSummary({
      income: 0, damage: [], satisfied: 0, unsatisfied: 0, forgiven: 0,
      unsatisfiedReasons: {}, events: [], completedCourses: [],
      expenses: [], repairmanRepairs: [], daysRun: 0,
    });
    setAutoRunStartPop(popularity);
    setDayTimer(0);
    setDayState('RUNNING');
  };

  // Keep ref in sync so the dayState effect always reads the current remaining count.
  useEffect(() => { autoRunRemainingRef.current = autoRunRemaining; }, [autoRunRemaining]);

  useEffect(() => {
    if (dayState === 'REPORT') {
      const remaining = autoRunRemainingRef.current;
      if (remaining === null || remaining <= 0) return;
      setAutoRunSummary(prev => {
        // Merge damage by machine ID, keeping highest damageTaken and final durability
        const damageMap = new Map((prev?.damage ?? []).map(d => [d.id, { ...d }]));
        for (const d of dailyReport.damage ?? []) {
          const entry = damageMap.get(d.id);
          if (entry) { entry.damageTaken += d.damageTaken; entry.currentDurability = d.currentDurability; }
          else damageMap.set(d.id, { ...d });
        }
        // Merge repairman repairs by machine ID
        const repairMap = new Map((prev?.repairmanRepairs ?? []).map(r => [r.id, { ...r }]));
        for (const r of dailyReport.repairmanRepairs ?? []) {
          const entry = repairMap.get(r.id);
          if (entry) entry.gain += r.gain;
          else repairMap.set(r.id, { ...r });
        }
        // Merge unsatisfied reasons
        const reasons = { ...(prev?.unsatisfiedReasons ?? {}) };
        for (const [k, v] of Object.entries(dailyReport.unsatisfiedReasons ?? {})) {
          reasons[k] = (reasons[k] ?? 0) + v;
        }
        return {
          income:             (prev?.income      ?? 0) + dailyReport.income,
          damage:             Array.from(damageMap.values()),
          satisfied:          (prev?.satisfied   ?? 0) + (dailyReport.satisfied   ?? 0),
          unsatisfied:        (prev?.unsatisfied ?? 0) + (dailyReport.unsatisfied ?? 0),
          forgiven:           (prev?.forgiven    ?? 0) + (dailyReport.forgiven    ?? 0),
          unsatisfiedReasons: reasons,
          events:             [...(prev?.events ?? []), ...(dailyReport.events ?? [])],
          completedCourses:   [...(prev?.completedCourses ?? []), ...(dailyReport.completedCourses ?? [])],
          expenses:           [...(prev?.expenses ?? []), ...(dailyReport.expenses ?? [])],
          repairmanRepairs:   Array.from(repairMap.values()),
          daysRun:            (prev?.daysRun ?? 0) + 1,
        };
      });
      const next = remaining - 1;
      autoRunRemainingRef.current = next;
      setAutoRunRemaining(next);
      nextDay();
      if (next > 0) {
        autoRunPendingStartRef.current = true;
      } else {
        setAutoRunRemaining(null);
        autoRunRemainingRef.current = null;
        setShowAutoRunSummary(true);
      }
    }
    if (dayState === 'BUILD' && autoRunPendingStartRef.current) {
      autoRunPendingStartRef.current = false;
      startDay();
    }
  }, [dayState]); // eslint-disable-line

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
    const nameMap = { kegerator: 'Kegerator', bartop: 'Bartop', bathroom: 'Bathroom', speed_well: 'Speed Well' };
    const price = BAR_SUPPLY_PURCHASE_PRICE[type] ?? 500;
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
    const sellValue = calculatePrice(m.year, time.year, m.durability, m.locationCount ?? 0, m.type);
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
    if (effectId === 'reg_spy_end_machine') {
      // Remove Reg's spy Bally from the bar entirely — player confronted Reg
      setMachines(prev => prev.filter(m => m.name !== "Reg's Bally (1978)"));
    } else if (effectId === 'reg_machine') {
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

  const handleInvest = (defId, amount) => {
    const def = INVESTMENT_DEFS.find(d => d.id === defId);
    if (!def || cash < amount || amount < def.minAmount || activeInvestment || dayState === 'REPORT') return;
    const depositedAt = toLinearDay(time);
    const maturesAt = depositedAt + def.durationWeeks * 3;
    const returnAmount = Math.round(amount * (1 + def.interestRate));
    setCash(c => c - amount);
    setActiveInvestment({ defId, productName: def.name, amount, depositedAt, maturesAt, returnAmount });
  };

  const handleTakeLoan = (preset) => {
    if (activeLoan || dayState === 'REPORT') return;
    const total = Math.round(preset.amount * (1 + preset.totalInterestRate));
    const weeklyPayment = Math.round(total / preset.durationWeeks);
    setCash(c => c + preset.amount);
    setActiveLoan({ amount: preset.amount, weeklyPayment, weeksRemaining: preset.durationWeeks });
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

  const payMedicalBill = (id) => {
    if (dayState === 'REPORT') return;
    const bill = medicalBills.find(b => b.id === id);
    if (!bill || bill.paid || bill.autoDeducted) return;
    const weeksUnpaid = Math.floor((toLinearDay(time) - bill.issuedLinearDay) / 3);
    const currentAmount = Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
    if (cash < currentAmount) return;
    setCash(c => c - currentAmount);
    setMedicalBills(prev => prev.map(b => b.id === id ? { ...b, paid: true } : b));
  };

  const payAllMedicalBills = () => {
    if (dayState === 'REPORT') return;
    const linearNow = toLinearDay(time);
    const unpaid = medicalBills.filter(b => !b.paid && !b.autoDeducted);
    const total = unpaid.reduce((sum, bill) => {
      const weeksUnpaid = Math.floor((linearNow - bill.issuedLinearDay) / 3);
      return sum + Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
    }, 0);
    if (total === 0 || cash < total) return;
    setCash(c => c - total);
    setMedicalBills(prev => prev.map(b =>
      (!b.paid && !b.autoDeducted) ? { ...b, paid: true } : b
    ));
  };

  const nextDay = () => {
    // Advance time
    let { year, week, day } = time;
    day += 1;
    if (day > 3) { day = 1; week += 1; }
    if (week > 10) { week = 1; year += 1; }
    const newTime = { year, week, day };
    const newLinear = toLinearDay(newTime);

    // Expire email offers that have passed their window
    setInbox(prev => prev.map(e => {
      if (e.expiresAfterDays && !e.choiceMade && !e.choicesExpired && e.deliveredAt !== undefined) {
        if (newLinear - e.deliveredAt >= e.expiresAfterDays) {
          return { ...e, choicesExpired: true };
        }
      }
      return e;
    }));

    // Win condition — reach 2026
    if (newTime.year >= 2026) {
      localStorage.removeItem(SAVE_KEY);
      setSavedGame(null);
      setWinStats({ pinbarName, characterName, time: newTime, cash, popularity, machineCount: machines.length });
      setScreen('win');
      return;
    }

    // Investment maturity check — must happen before expenses so payout can offset them
    let investmentPayout = 0;
    let maturedProductName = null;
    if (activeInvestment && newLinear >= activeInvestment.maturesAt) {
      investmentPayout = activeInvestment.returnAmount;
      maturedProductName = activeInvestment.productName;
      setActiveInvestment(null);
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
        if (count > 0) {
          const salaryPerHead = def.id === 'repairman'
            ? def.weeklySalary + (upgrades.tech_training ?? 0) * 100
            : def.weeklySalary;
          weeklyExpenses.push({ id: `salary_${def.id}`, name: `${def.name} ×${count} (salary)`, icon: def.icon, amount: salaryPerHead * count });
        }
      }
      // Loan payment
      if (activeLoan) {
        weeklyExpenses.push({ id: 'loan_payment', name: 'Loan Payment', icon: '💸', amount: activeLoan.weeklyPayment });
        if (activeLoan.weeksRemaining <= 1) {
          setActiveLoan(null);
        } else {
          setActiveLoan(al => al ? { ...al, weeksRemaining: al.weeksRemaining - 1 } : null);
        }
      }

      // ── Medical billing ─────────────────────────────────────────────────────
      if (newTime.year >= 2020) {
        // 1. Create this week's invoice
        const newBill = {
          id: `medical_${newTime.year}_w${newTime.week}`,
          originalAmount: medicalExpenseAmount(newTime),
          issuedLinearDay: newLinear,
          paid: false,
          autoDeducted: false,
          collectionsSent: false,
        };

        // 2. Age all existing bills (closure read is safe — new bill has weeksUnpaid=0)
        const collectionsEmails = [];
        const updatedBills = [...medicalBills, newBill].map(bill => {
          if (bill.paid || bill.autoDeducted) return bill;
          const weeksUnpaid = Math.floor((newLinear - bill.issuedLinearDay) / 3);
          const currentAmount = Math.round(bill.originalAmount * Math.pow(1.05, weeksUnpaid));
          const updated = { ...bill };

          if (weeksUnpaid >= 4 && !bill.collectionsSent) {
            updated.collectionsSent = true;
            collectionsEmails.push({
              id: `collections_${bill.id}`,
              from: "St. Agatha's Billing Dept.",
              address: 'billing@stagatha-clinic.nhs.uk',
              subject: 'Overdue Invoice — Final Notice',
              body:
`This is a final notice regarding invoice ${bill.id.replace(/^medical_/, '').replace(/_w/, '-W').toUpperCase()}.

Original amount: $${bill.originalAmount.toLocaleString()}
Interest accrued (${weeksUnpaid} weeks at 5%/week): $${(currentAmount - bill.originalAmount).toLocaleString()}
Total now due: $${currentAmount.toLocaleString()}

If this invoice is not paid within one week, the outstanding balance will be deducted automatically from your account.

Please log into the Medical Billing section of your computer to make a payment.

St. Agatha's Billing Department`,
              read: false,
              choiceMade: false,
              choices: null,
              deliveredAt: newLinear,
            });
          }

          if (weeksUnpaid >= 5) {
            updated.autoDeducted = true;
            weeklyExpenses.push({
              id: `medical_auto_${bill.id}`,
              name: `Medical Bill (Auto-collected, ${weeksUnpaid} wks overdue)`,
              icon: '⚕',
              amount: currentAmount,
            });
          }

          return updated;
        });

        setMedicalBills(updatedBills);
        if (collectionsEmails.length > 0) {
          setInbox(prev => [...prev, ...collectionsEmails]);
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      const totalExpenses = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
      if (investmentPayout > 0 || totalExpenses > 0) {
        const newCash = cash + investmentPayout - totalExpenses;
        setCash(newCash);
        if (investmentPayout > 0) {
          setNotification({ id: 'investment_matured', label: 'Investment Matured', severity: 'good',
            message: `Your ${maturedProductName} matured and returned $${investmentPayout.toLocaleString()}.` });
        }
        if (newCash < 0) {
          localStorage.removeItem(SAVE_KEY);
          setSavedGame(null);
          setGameOverStats({ pinbarName, characterName, time: newTime, cash: newCash, popularity, forfeitedInvestment: investmentPayout > 0 ? null : activeInvestment });
          setScreen('bankrupt');
          return;
        }
      }
    } else if (investmentPayout > 0) {
      setCash(c => c + investmentPayout);
      setNotification({ id: 'investment_matured', label: 'Investment Matured', severity: 'good',
        message: `Your ${maturedProductName} matured and returned $${investmentPayout.toLocaleString()}.` });
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
    const mainPinball = machines.filter(m => m.type === 'pinball' && m.room === 'main' && m.x !== null);
    const machineEquivalents = Math.floor(
      mainPinball.reduce((sum, m) => sum + 1 + (Math.log1p(m.locationCount ?? 0) / LOG_MAX) * 4, 0)
    );
    const machineExpectation = Math.floor(popularity / 100);
    const machineScore = machineEquivalents - machineExpectation;
    const customerDelta = calcCustomerPopDelta(
      dailyReport.satisfied,
      dailyReport.unsatisfied,
      popularity,
    );
    const socialBoost = 1 + newUpgrades.social_media * 0.5;
    setPopularity(p => {
      const arcHit = Math.round(p * arcPopDelta);
      const dailyGain = calcDailyPopGain(machineScore, customerDelta, {
        socialBoost,
        gainMult: newGainMult,
      });
      const eventDelta = dailyReport.eventPopularityDelta ?? 0;
      return Math.max(0, p + dailyGain + arcHit + eventDelta);
    });

    setTime(newTime);

    // Check for new emails (read inbox from closure — safe inside a click handler)
    const sentIds = new Set(inbox.map(e => e.id));
    const completedCourseIds = new Set(justCompleted.map(c => c.id));
    const emailState = { time: newTime, popularity, cash, machines, sentIds, completedCourseIds };
    const newEmails = EMAIL_DEFS.filter(def => !sentIds.has(def.id) && def.trigger(emailState));

    if (newEmails.length > 0) {
      setInbox(prev => [...prev, ...newEmails.map(def => ({ ...def, read: false, choiceMade: false, deliveredAt: toLinearDay(newTime) }))]);

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

  // Preview expenses that would fire when the player clicks "Next Day" from the report
  const upcomingExpenses = (() => {
    if (dayState !== 'REPORT' && !showAutoRunSummary) return [];
    let { year, week, day } = time;
    day += 1;
    if (day > 3) { day = 1; week += 1; }
    if (week > 10) { week = 1; year += 1; }
    const nextTime = { year, week, day };
    if (nextTime.day !== 1) return [];
    const weekNum = (nextTime.year - 1975) * 10 + nextTime.week;
    const expenses = [];
    for (const def of EXPENSE_DEFS) {
      if (def.startYear && nextTime.year < def.startYear) continue;
      if ((weekNum - 1) % def.frequencyWeeks === 0) {
        const amount = typeof def.amount === 'function' ? def.amount(nextTime) : def.amount;
        expenses.push({ id: def.id, name: def.name, icon: def.icon, amount });
      }
    }
    for (const def of STAFF_DEFS) {
      const val = staff[def.id];
      const count = typeof val === 'number' ? val : (val ? 1 : 0);
      if (count > 0) {
        const salaryPerHead = def.id === 'repairman'
          ? def.weeklySalary + (upgrades.tech_training ?? 0) * 100
          : def.weeklySalary;
        expenses.push({ id: `salary_${def.id}`, name: `${def.name} ×${count} (salary)`, icon: def.icon, amount: salaryPerHead * count });
      }
    }
    if (activeLoan) {
      expenses.push({ id: 'loan_payment', name: 'Loan Payment', icon: '💸', amount: activeLoan.weeklyPayment });
    }
    return expenses;
  })();

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

      <div className={`play-area grid-mode${isComputerOpen ? ' computer-open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <GameGrid
              machines={mainMachines}
              customers={customers}
              spendPopups={spendPopups}
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

          <PlayActions
            dayState={dayState}
            dayTimer={dayTimer}
            dayLengthSeconds={upgradeValues.dayLengthSeconds}
            startDay={startDay}
            setIsComputerOpen={setIsComputerOpen}
            unreadEmails={inbox.filter(e => !e.read).length}
            placementMachine={placementMachine}
            onRotate={rotatePlacement}
            placementRotation={placementRotation}
            startWeek={startWeek}
            autoRunRemaining={autoRunRemaining}
            autoRunTotal={autoRunTotal}
          />

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

        {dayState === 'REPORT' && autoRunRemaining === null && (
          <ReportModal
            dailyReport={dailyReport}
            machines={machines}
            popularity={popularity}
            upgrades={upgrades}
            popGainMult={popGainMult}
            repairsRemaining={repairsRemaining}
            cash={cash}
            repairMachine={repairMachine}
            nextDay={nextDay}
            upcomingExpenses={upcomingExpenses}
          />
        )}

        {showAutoRunSummary && autoRunSummary && (
          <ReportModal
            title={`📊 ${autoRunSummary.daysRun}-Day Week Report`}
            dailyReport={{ ...autoRunSummary, popularityDelta: popularity - autoRunStartPop }}
            machines={machines}
            popularity={popularity}
            upgrades={upgrades}
            popGainMult={popGainMult}
            repairsRemaining={repairsRemaining}
            cash={cash}
            repairMachine={repairMachine}
            nextDay={() => { setShowAutoRunSummary(false); setAutoRunSummary(null); setAutoRunTotal(null); }}
            upcomingExpenses={upcomingExpenses}
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
            activeInvestment={activeInvestment}
            activeLoan={activeLoan}
            onInvest={handleInvest}
            onTakeLoan={handleTakeLoan}
            fastForward={fastForward}
            setFastForward={setFastForward}
            closeComputer={() => setIsComputerOpen(false)}
            medicalBills={medicalBills}
            onPayMedicalBill={payMedicalBill}
            onPayAllMedicalBills={payAllMedicalBills}
          />
        )}
      </div>
    </div>
  );
}

export default App;
