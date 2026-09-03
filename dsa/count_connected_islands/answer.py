def countIslands(grid: list[list[str]]) -> int:
    if not grid:
        return 0

    rows = len(grid)
    cols = len(grid[0])

    visited: set[tuple[int, int]] = set()
    island_count = 0

    def explore(row: int, col: int) -> None:
        # Out of bounds
        if row < 0 or row >= rows or col < 0 or col >= cols:
            return

        # Already visited
        if (row, col) in visited:
            return

        # Water
        if grid[row][col] == "0":
            return

        visited.add((row, col))

        explore(row + 1, col)  # down
        explore(row - 1, col)  # up
        explore(row, col + 1)  # right
        explore(row, col - 1)  # left

    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == "1" and (row, col) not in visited:
                island_count += 1
                explore(row, col)

    return island_count