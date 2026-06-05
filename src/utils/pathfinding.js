import PF from 'pathfinding';
import { GRID_COLS, GRID_ROWS } from '../constants';
import { getMachineCells } from '../utils/grid';

/** True if (x, y) is a valid grid index for pathfinding. */
export function isGridCellInBounds(x, y) {
  return Number.isFinite(x) && Number.isFinite(y)
    && x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS;
}

/**
 * A* between two cells. Returns null if either endpoint is out of bounds — the
 * `pathfinding` library's Grid#getNodeAt does not guard and will throw.
 */
export function findPathInBounds(finder, startX, startY, endX, endY, grid) {
  if (!isGridCellInBounds(startX, startY) || !isGridCellInBounds(endX, endY)) return null;
  return finder.findPath(startX, startY, endX, endY, grid);
}

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
