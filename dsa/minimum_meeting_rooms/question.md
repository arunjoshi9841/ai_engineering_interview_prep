# Minimum Meeting Rooms

## 1. Interview Prompt

Given meeting intervals, return the minimum number of rooms needed so every meeting can occur. Meetings use half-open intervals `[start, end)`, so one may begin when another ends.

Implement the function in TypeScript.

## 2. Requirements

- Every meeting satisfies `start < end`.
- Input may be unsorted and contain duplicate intervals.
- A meeting ending at time `t` does not overlap one starting at `t`.
- Do not modify input.
- Empty input returns `0`.
- Aim for `O(n log n)` time.

## 3. Example Input / Output

```text
[{0,30},{5,10},{15,20}] -> 2
[{7,10},{10,12}]        -> 1
[{1,4},{1,4},{1,4}]     -> 3
[]                      -> 0
```

## 4. What the Interviewer Is Evaluating

- Concurrent-interval counting
- Endpoint tie handling
- Heap or sorted-event tradeoffs

## 5. Concept Questions and Interview Answers

### Why do end events precede start events at the same time?

**Interview answer:**

> With half-open intervals, the earlier meeting no longer occupies a room at that time, so its room is released before the next meeting starts.
