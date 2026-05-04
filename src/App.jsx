import { useState, useEffect } from 'react';
import './index.css';
import { GRID_COLS, GRID_ROWS, DOOR_POS, BACKROOM_COLS, BACKROOM_ROWS } from './constants';
import { getMachineCells, findFreeSpace } from './utils/grid';
import { extractYear, calculatePrice } from './utils/economy';
import useMarketplace from './hooks/useMarketplace';
import useGameEngine from './hooks/useGameEngine';
import TopBar from './components/TopBar';
import GameGrid from './components/GameGrid';
import Inventory from './components/Inventory';
import ReportModal from './components/ReportModal';
import Computer from './components/Computer';

function App() {
  // ── Core state ──
  const [time, setTime] = useState({ year: 1975, week: 1, day: 1 });
  const [dayState, setDayState] = useState('BUILD');
  const [dayTimer, setDayTimer] = useState(0);
  const [dailyReport, setDailyReport] = useState({ income: 0, damage: [] });
  const [cash, setCash] = useState(25000);
  const [repairsRemaining, setRepairsRemaining] = useState(5);
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bartender, setBartender] = useState({ x: null, y: null, status: 'idle', path: [], pathIndex: 0 });

  // ── UI state ──
  const [marketTab, setMarketTab] = useState('pinball');
  const [placementMachine, setPlacementMachine] = useState(null);
  const [placementRotation, setPlacementRotation] = useState('N');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [isComputerOpen, setIsComputerOpen] = useState(false);

  // ── Hooks ──
  const { opdbDatabase, dailyMarket } = useMarketplace(time);

  useGameEngine({
    dayState, setDayState,
    dayTimer, setDayTimer,
    machines, setMachines,
    customers, setCustomers,
    cash, setCash,
    bartender, setBartender,
    dailyReport, setDailyReport,
    time
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

  // ── Actions ──
  const startDay = () => {
    if (dayState === 'BUILD') {
      setDayState('RUNNING');
    }
  };

  const buyMachine = (machine) => {
    if (dayState === 'REPORT') return false;
    const mYear = machine.parsedYear || extractYear(machine.supplementary);
    const price = calculatePrice(mYear, time.year, 100);
    
    if (price && cash >= price) {
      const backroomMachines = machines.filter(m => m.room === 'backroom');
      let placeCoords = findFreeSpace('pinball', 'N', backroomMachines, BACKROOM_COLS, BACKROOM_ROWS);
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
      setMachines(prev => [...prev, {
        id: machine.id + '-' + Date.now(),
        type: 'pinball',
        name: machine.name,
        year: mYear,
        durability: 100,
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
    const price = type === 'kegerator' ? 1000 : 500;
    const name = type === 'kegerator' ? 'Kegerator' : 'Bartop';
    if (cash >= price) {
      const backroomMachines = machines.filter(m => m.room === 'backroom');
      let placeCoords = findFreeSpace(type, 'N', backroomMachines, BACKROOM_COLS, BACKROOM_ROWS);
      let assignedRoom = 'backroom';
      
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
    const sellValue = calculatePrice(m.year, time.year, m.durability);
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

  const handleCellClick = (x, y, roomType = 'main') => {
    if (dayState === 'REPORT') return;

    const cols = roomType === 'main' ? GRID_COLS : BACKROOM_COLS;
    const rows = roomType === 'main' ? GRID_ROWS : BACKROOM_ROWS;
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
    let { year, week, day } = time;
    day += 1;
    if (day > 3) { day = 1; week += 1; }
    if (week > 10) { week = 1; year += 1; }
    setTime({ year, week, day });
    setDayState('BUILD');
    setDayTimer(0);
    setDailyReport({ income: 0, damage: [] });
    setRepairsRemaining(5);
  };

  // ── Derived data ──
  const mainMachines = machines.filter(m => m.room === 'main' || !m.room);
  const backroomMachines = machines.filter(m => m.room === 'backroom');
  const placementMachineType = machines.find(m => m.id === placementMachine)?.type;

  // ── Render ──
  return (
    <div className="game-container">
      <TopBar
        time={time}
        cash={cash}
        repairsRemaining={repairsRemaining}
        placementMachine={placementMachine}
        dayState={dayState}
        startDay={startDay}
        setIsComputerOpen={setIsComputerOpen}
      />

      <div className="play-area grid-mode">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Main Floor</h3>
            <GameGrid
              machines={mainMachines}
              customers={customers}
              bartender={bartender}
              hoveredCell={hoveredCell}
              placementMachine={placementMachine}
              placementRotation={placementRotation}
              handleCellClick={(x, y) => handleCellClick(x, y, 'main')}
              setHoveredCell={setHoveredCell}
              gridId="main"
              placementMachineType={placementMachineType}
            />
          </div>

          <Inventory
            backroomMachines={backroomMachines}
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
            opdbDatabase={opdbDatabase}
            dailyMarket={dailyMarket}
            buyMachine={buyMachine}
            buySupply={buySupply}
            closeComputer={() => setIsComputerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;