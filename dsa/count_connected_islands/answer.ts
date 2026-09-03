export function countIslands(
  grid: readonly (readonly ("0" | "1")[])[],
): number {
  if (!grid || grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;

  const visited = new Set<string>();
  let islandCount = 0;

  function explore(row: number, col: number): void {
    // Out of bounds
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return;
    }

    // Already visited
    if (visited.has(`${row},${col}`)) {
      return;
    }

    // Water
    if (grid[row][col] === "0") {
      return;
    }

    visited.add(`${row},${col}`);

    explore(row + 1, col); // down
    explore(row - 1, col); // up
    explore(row, col + 1); // right
    explore(row, col - 1); // left
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === "1" && !visited.has(`${row},${col}`)) {
        islandCount++;
        explore(row, col);
      }
    }
  }

  return islandCount;
}
