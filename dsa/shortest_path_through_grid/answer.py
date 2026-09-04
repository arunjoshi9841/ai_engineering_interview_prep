from typing import TypedDict


class Coordinate(TypedDict):
    row: int
    column: int

def shortestGridPath(grid: list[list[int]], start: Coordinate, destination: Coordinate) -> int:
    raise NotImplementedError("Implement the contract documented in question.md")
