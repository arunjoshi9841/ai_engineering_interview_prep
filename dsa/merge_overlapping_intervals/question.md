# Merge Overlapping Intervals

## 1. Interview Prompt

Given closed integer intervals, merge every overlapping interval and return the disjoint result ordered by start.

Implement the function in a language of your choice.

## 2. Requirements

- Each interval satisfies `start <= end`.
- Closed intervals overlap when the next start is at most the current end.
- Nested, duplicate, and point intervals are allowed.
- Do not modify the input or interval objects.
- Return newly created intervals sorted by start.
- Aim for `O(n log n)` time and linear output space.

## 3. Example Input / Output

```text
[{1,3},{2,6},{8,10},{9,12}] -> [{1,6},{8,12}]
[{1,4},{4,5}]               -> [{1,5}]
[{2,2}]                     -> [{2,2}]
[]                          -> []
```

## 4. What the Interviewer Is Evaluating

- Sorting and merge invariant
- Boundary, nesting, and immutability handling
- Complexity reasoning

## 5. Concept Questions and Interview Answers

### Why sort by start first?

**Interview answer:**

> Once starts are ordered, any interval that can overlap the current merged range appears before a later disjoint range, so one scan is sufficient after sorting.
