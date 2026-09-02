# Peak Events in a Fixed Window

## 1. Interview Prompt

Given sorted event timestamps and a positive window duration, return the greatest number of events contained in any half-open interval `[start, start + windowMs)`.

Implement the function in TypeScript in linear time.

## 2. Requirements

- Timestamps are non-negative safe integers sorted nondecreasingly; duplicates are allowed.
- An event exactly at `start + windowMs` is excluded.
- The interval may start at any timestamp; an optimum can be represented starting at its earliest included event.
- Empty input returns `0`.
- Do not modify the input.
- Use linear time and constant auxiliary space.

## 3. Example Input / Output

```text
[0, 2, 4, 7], windowMs=5 -> 3
[1, 1, 1], windowMs=1    -> 3
[0, 5], windowMs=5        -> 1
[]                        -> 0
```

## 4. What the Interviewer Is Evaluating

- Time-window boundary precision
- Sliding-window traversal
- Duplicate and empty-input handling

## 5. Concept Questions and Interview Answers

### Why specify half-open intervals?

**Interview answer:**

> They make adjacent windows unambiguous and define exactly how boundary events are counted. Without that contract, implementations can differ by one event.
