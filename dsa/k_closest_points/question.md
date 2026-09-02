# K Closest Points

## 1. Interview Prompt

Given 2D integer points, return the `k` points closest to the origin. Compare squared Euclidean distance; ties use smaller `x`, then smaller `y`.

Implement the function in TypeScript with deterministic output.

## 2. Requirements

- `k` is positive and no greater than point count.
- Duplicate points remain separate occurrences.
- Return points ordered from closest to farthest using the tie rule.
- Do not use square roots or modify the input.
- Assume squared distances remain safe integers.
- Aim for `O(n log k)` time and `O(k)` selection space.

## 3. Example Input / Output

```text
[{x:1,y:3},{x:-2,y:2}], k=1 -> [{x:-2,y:2}]
[{x:1,y:1},{x:-1,y:1}], k=2 -> [{x:-1,y:1},{x:1,y:1}]
```

## 4. What the Interviewer Is Evaluating

- Bounded heap selection
- Distance and comparator correctness
- Duplicate, tie, and complexity reasoning

## 5. Concept Questions and Interview Answers

### Why compare squared distance?

**Interview answer:**

> Square root is monotonic for non-negative values, so squared distance preserves ordering with less work and avoids unnecessary floating-point operations.
