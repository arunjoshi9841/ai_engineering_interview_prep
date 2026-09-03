# Top-K Frequent Values

## 1. Interview Prompt

Given an array of integers and `k`, return the `k` most frequent distinct values. Higher frequency comes first; ties use the smaller numeric value first.

Implement the function in a language of your choice without sorting all input occurrences.

## 2. Requirements

- `k` is positive and no greater than the number of distinct values.
- Count every occurrence, including duplicates and negatives.
- Return exactly `k` distinct values in the specified order.
- Do not modify the input.
- Aim for `O(n log k)` time and `O(u)` counting space for `u` distinct values.

## 3. Example Input / Output

```text
[1,1,1,2,2,3], k=2 -> [1,2]
[4,4,2,2,1], k=2   -> [2,4]
[-1,-1,0], k=1      -> [-1]
```

## 4. What the Interviewer Is Evaluating

- Frequency counting and bounded heap selection
- Comparator and tie correctness
- Complexity in terms of `n`, `u`, and `k`

## 5. Concept Questions and Interview Answers

### Why keep only `k` candidates in the selection heap?

**Interview answer:**

> Once frequencies are known, candidates worse than the current top k do not need to remain. A bounded heap makes selection depend logarithmically on k rather than sorting every distinct value.
