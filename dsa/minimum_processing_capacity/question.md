# Minimum Processing Capacity

## 1. Interview Prompt

A worker processes one job at a time. During an hour it can process up to `capacity` units from the current job, and any unused capacity that hour cannot be applied to another job. Given positive job sizes and a deadline in hours, return the smallest positive integer capacity that finishes all jobs by the deadline.

Implement the function in a language of your choice.

## 2. Requirements

- Job sizes are positive integers within the language's exact-integer range.
- `hours` is at least the number of jobs.
- A job of size `work` takes `ceil(work / capacity)` hours.
- Jobs may be processed in any order, but only one job is active in an hour.
- Empty input returns `0`.
- Do not modify input.
- Aim for `O(n log M)` time, where `M` is the largest job.

## 3. Example Input / Output

```text
jobs=[3,6,7,11], hours=8 -> 4
jobs=[10], hours=3       -> 4
jobs=[1,1,1], hours=3    -> 1
jobs=[], hours=5         -> 0
```

## 4. What the Interviewer Is Evaluating

- Binary search over an answer range
- Construction of a monotonic feasibility predicate
- Bounds, rounding, and overflow awareness

## 5. Concept Questions and Interview Answers

### When can binary search be applied to an answer rather than an array?

**Interview answer:**

> It works when candidate answers have an ordered monotonic predicate, such as every capacity at or above some boundary being feasible. Binary search then finds that boundary.
