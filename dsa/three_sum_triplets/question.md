# Three-Sum Triplets

## 1. Interview Prompt

Given an array of integers, return every unique triplet of values whose sum is zero.

Implement the function in TypeScript with deterministic output and avoid duplicate triplets.

## 2. Requirements

- A triplet uses three distinct input indices.
- Each returned triplet is sorted in nondecreasing order.
- Return no duplicate value triplets.
- Sort the list of triplets lexicographically.
- Inputs may contain duplicates and negative values.
- Do not modify the input; sorting a copy is allowed.
- Aim for `O(n²)` time after sorting.

## 3. Example Input / Output

```text
[-1,0,1,2,-1,-4] -> [[-1,-1,2],[-1,0,1]]
[0,0,0,0]        -> [[0,0,0]]
[1,2]             -> []
```

## 4. What the Interviewer Is Evaluating

- Reduction to a bounded pair search
- Duplicate-skipping discipline
- Pointer and sorting invariants
- Complexity analysis

## 5. Concept Questions and Interview Answers

### Why does deterministic output help?

**Interview answer:**

> It makes tests, callers, and comparisons stable even when several traversal orders are correct. The contract should specify both triplet normalization and result ordering.
