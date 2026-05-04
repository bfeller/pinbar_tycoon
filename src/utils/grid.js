export const getMachineCells = (type, x, y, orientation) => {
  if (type === 'bartop' || type === 'kegerator') return [{x, y}];
  if (orientation === 'N') return [{x, y}, {x, y: y-1}];
  if (orientation === 'E') return [{x, y}, {x: x+1, y}];
  if (orientation === 'S') return [{x, y}, {x, y: y+1}];
  if (orientation === 'W') return [{x, y}, {x: x-1, y}];
  return [];
};

export const getPlayCell = (type, x, y, orientation) => {
  if (type === 'kegerator') return null;
  if (orientation === 'N') return {x, y: y+1};
  if (orientation === 'E') return {x: x-1, y};
  if (orientation === 'S') return {x, y: y-1};
  if (orientation === 'W') return {x: x+1, y};
  return null;
};

export const getBackCell = (type, x, y, orientation) => {
  if (orientation === 'N') return {x, y: y-1};
  if (orientation === 'E') return {x: x+1, y};
  if (orientation === 'S') return {x, y: y+1};
  if (orientation === 'W') return {x: x-1, y};
  return null;
};

export const findFreeSpace = (type, orientation, machinesInRoom, cols, rows, doorPos = null) => {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cells = getMachineCells(type, x, y, orientation);
      
      const isOOB = cells.some(c => c.x < 0 || c.x >= cols || c.y < 0 || c.y >= rows);
      if (isOOB) continue;

      let occupied = false;
      if (doorPos && cells.some(c => c.x === doorPos.x && c.y === doorPos.y)) {
        occupied = true;
      }
      
      if (!occupied) {
        for (const pm of machinesInRoom) {
          const pmCells = getMachineCells(pm.type, pm.x, pm.y, pm.orientation);
          if (pmCells.some(pc => cells.some(c => c.x === pc.x && c.y === pc.y))) {
            occupied = true;
            break;
          }
        }
      }
      
      if (!occupied) {
        return { x, y };
      }
    }
  }
  return null;
};
