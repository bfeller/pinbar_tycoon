import PF from 'pathfinding';
const grid = new PF.Grid(15, 10);
grid.setWalkableAt(7, 8, false); // Block the door
const finder = new PF.AStarFinder();
const path = finder.findPath(7, 9, 0, 0, grid);
console.log("Path:", path);
