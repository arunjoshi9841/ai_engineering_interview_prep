# Shortest Path Through a Grid

## 1. Interview Prompt

Given a rectangular grid where `0` is open and `1` is blocked, return the minimum number of horizontal or vertical moves from a start cell to a destination cell. Return `-1` if the destination is unreachable.

Implement the function in a language of your choice.

## 2. Requirements

- Start and destination coordinates are within the grid.
- Neither endpoint is guaranteed to be open.
- Movement is allowed only up, down, left, or right through open cells.
- If the same open cell is both endpoints, return `0`.
- Do not modify input.
- Aim for `O(rows * columns)` time.

## 3. Example Input / Output

```text
grid = [
  [0,0,1],
  [1,0,0],
  [0,0,0]
]
start=(0,0), destination=(2,2) -> 4

blocked endpoint                       -> -1
same open start and destination        -> 0
open cells with no connecting route    -> -1
```

## 4. What the Interviewer Is Evaluating

- Breadth-first shortest-path reasoning
- Distance and visited-state management
- Endpoint and unreachable-case handling

## 5. Concept Questions and Interview Answers

### Why is BFS appropriate here?

**Interview answer:**

> The grid is an unweighted graph, so BFS explores nodes in nondecreasing number of moves from the start. The first time it reaches a cell is therefore through a shortest path.
