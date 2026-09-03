# Minimum-Length Target Window

## 1. Interview Prompt

Given an array of positive integers and a positive target, return the minimum length of a contiguous subarray whose sum is at least the target. Return `0` if no such subarray exists.

Implement the function in a language of your choice in linear time.

## 2. Requirements

- Every value and the target are positive integers within the language's exact-integer range.
- The subarray must be contiguous and non-empty.
- Return only its length.
- Empty input returns `0`.
- Do not modify the input.
- Use linear time and constant auxiliary space.

## 3. Example Input / Output

```text
[2,3,1,2,4,3], target=7 -> 2
[1,1,1], target=5       -> 0
[8], target=7            -> 1
```

## 4. What the Interviewer Is Evaluating

- Sliding-window invariant
- Safe expansion and contraction
- Boundary cases and complexity proof

## 5. Concept Questions and Interview Answers

### Why does the positivity constraint matter?

**Interview answer:**

> Extending the right boundary can only increase the sum, and removing the left value can only decrease it. That monotonic behavior supports a one-direction window.
