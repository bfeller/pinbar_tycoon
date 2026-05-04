import PF from 'pathfinding';
import { GRID_COLS, GRID_ROWS } from '../constants';
import { getMachineCells } from '../utils/grid';

/**
 * Build a PF.Grid with all placed machines marked as unwalkable.
 */
export const buildGrid = (currentMachines) => {
  const grid = new PF.Grid(GRID_COLS, GRID_ROWS);
  currentMachines.forEach(m => {
    if (m.x !== null && m.y !== null) {
      const mCells = getMachineCells(m.type, m.x, m.y, m.orientation);
      mCells.forEach(c => {
        if (c.x >= 0 && c.x < GRID_COLS && c.y >= 0 && c.y < GRID_ROWS) {
          grid.setWalkableAt(c.x, c.y, false);
        }
      });
    }
  });
  return grid;
};
