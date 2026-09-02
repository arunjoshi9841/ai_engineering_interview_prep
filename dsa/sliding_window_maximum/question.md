# Sliding-Window Maximum

## 1. Interview Prompt

Given an array of numbers and a window size, return the maximum value in every contiguous window.

Implement the function in TypeScript in linear time.

## 2. Requirements

- `windowSize` is a positive integer no greater than input length.
- Values are finite numbers and may repeat.
- Return one maximum for each of `n - windowSize + 1` windows.
- Do not modify the input.
- Use linear time and auxiliary space bounded by the window size.

## 3. Example Input / Output

```text
[1,3,-1,-3,5,3,6,7], k=3 -> [3,3,5,5,6,7]
[2,2,2], k=2             -> [2,2]
[4], k=1                 -> [4]
```

## 4. What the Interviewer Is Evaluating

- Monotonic deque invariant
- Expiration and duplicate handling
- Linear-time proof

## 5. Concept Questions and Interview Answers

### Why can dominated candidates be removed?

**Interview answer:**

> A newer value at least as large will remain in every future window at least as long, so the older smaller candidate cannot become maximum again.
