# Product Except Self

## 1. Interview Prompt

Given an array of integers, return an array where each position contains the product of every input value except the value at that same position.

Implement the function in TypeScript without division and explain how zeros affect the result.

## 2. Requirements

- Return an array with the same length as the input.
- Do not use division.
- Aim for linear time.
- Excluding the output array, use constant additional space.
- Empty input returns an empty array.
- Assume all intermediate and final products are within JavaScript's safe integer range.
- Do not modify the input.

## 3. Example Input / Output

```text
[1, 2, 3, 4] -> [24, 12, 8, 6]
[-1, 2, -3]  -> [-6, 3, -2]
[2, 0, 4]    -> [0, 8, 0]
[0, 0, 5]    -> [0, 0, 0]
[]           -> []
```

## 4. What the Interviewer Is Evaluating

- Decomposition and loop-invariant reasoning
- Careful handling of zeros and signs
- Space-complexity discipline
- Loop invariants and boundary cases

## 5. Concept Questions and Interview Answers

### Why do zeros make division-based reasoning fragile?

**Interview answer:**

> Division by zero is undefined, and special-casing one versus multiple zeros complicates correctness. The no-division contract forces an approach whose behavior is uniform for zero and nonzero inputs.

### What does “constant extra space” mean when an output array is required?

**Interview answer:**

> The returned array is required storage and is excluded by the stated convention. Auxiliary structures beyond it should not grow with the input size.
