# Count Connected Islands

## 1. Interview Prompt

Given a rectangular grid containing land (`"1"`) and water (`"0"`), return the number of connected land regions. Land cells connect only through shared horizontal or vertical edges.

Implement the function in a language of your choice.

## 2. Requirements

- The grid may be empty.
- Every nonempty row has the same length.
- Diagonal cells are not connected.
- Do not modify input.
- Each land cell belongs to exactly one counted island.
- Aim for `O(rows * columns)` time.

## 3. Example Input / Output

```text
[
  ["1","1","0","0"],
  ["1","0","0","1"],
  ["0","0","1","1"]
] -> 2

[["1","0"],["0","1"]] -> 2
[]                        -> 0
```

## 4. What the Interviewer Is Evaluating

- Connected-component traversal
- Coordinate bounds and visited-state discipline
- DFS/BFS and complexity reasoning

## 5. Concept Questions and Interview Answers

### Why increment the count only when starting a new traversal?

**Interview answer:**

> An unvisited land cell cannot belong to a previously explored component. One traversal marks its entire connected region, so that starting point corresponds to exactly one new island.
