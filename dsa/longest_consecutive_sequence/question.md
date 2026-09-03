# Longest Consecutive Sequence

## 1. Interview Prompt

Given an unsorted array of integers, return the length of the longest run of consecutive values. Values in a run differ by exactly one; their positions in the input do not need to be adjacent.

Implement the function in a language of your choice in expected linear time.

## 2. Requirements

- Duplicate values do not extend a run.
- Empty input returns `0`.
- Negative values are allowed.
- Do not sort or modify the input.
- Aim for expected `O(n)` time and `O(n)` additional space.
- Assume values remain within the language's exact-integer range and do not include the range endpoints.

## 3. Example Input / Output

```text
[100, 4, 200, 1, 3, 2] -> 4
[1, 2, 2, 3]           -> 3
[-2, -1, 1, 0]          -> 4
[]                      -> 0
```

## 4. What the Interviewer Is Evaluating

- Membership and sequence-boundary reasoning
- Avoidance of repeated work
- Recognition of sequence boundaries
- Complexity proof and edge cases

## 5. Concept Questions and Interview Answers

### Why is an expected-time bound different from a worst-case bound?

**Interview answer:**

> Expected time assumes the chosen data structures behave well on average, while a worst-case bound must hold even for pathological inputs or collisions. I would state which guarantee my operations rely on rather than calling both simply linear.

### Why do duplicates not affect the answer?

**Interview answer:**

> A consecutive sequence is defined by which integer values are present, not how many times each appears. Collapsing input to unique membership preserves every possible run.
