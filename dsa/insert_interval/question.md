# Insert an Interval

## 1. Interview Prompt

Given disjoint closed intervals sorted by start, insert one new interval and merge any overlaps. Return the resulting sorted disjoint intervals.

Implement the function in a language of your choice in linear time.

## 2. Requirements

- Existing intervals are valid, sorted, and non-overlapping.
- The new interval satisfies `start <= end`.
- Closed intervals that touch at an endpoint overlap.
- Do not modify inputs.
- Preserve unaffected intervals.
- Use linear time and output space.

## 3. Example Input / Output

```text
[{1,3},{6,9}], add={2,5} -> [{1,5},{6,9}]
[{1,2},{5,7}], add={2,5} -> [{1,7}]
[], add={3,4}            -> [{3,4}]
```

## 4. What the Interviewer Is Evaluating

- Partitioning before, overlapping, and after regions
- Boundary and immutability correctness
- Linear-time reasoning

## 5. Concept Questions and Interview Answers

### Why is one scan sufficient?

**Interview answer:**

> Existing intervals are already sorted and disjoint, so they form three ordered regions relative to the new interval: before, overlapping, and after.
