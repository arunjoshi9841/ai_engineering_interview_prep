# Search Rotated Sorted Array

## 1. Interview Prompt

An array of distinct integers was sorted increasingly and then rotated at an unknown pivot. Return the index of a target value, or `-1` if absent.

Implement the function in a language of your choice in logarithmic time.

## 2. Requirements

- Values are distinct.
- The array may be unrotated or empty.
- Rotation preserves the relative order of the two sorted segments.
- Return a zero-based index.
- Do not modify input.
- Use `O(log n)` time and constant auxiliary space.

## 3. Example Input / Output

```text
[4,5,6,7,0,1,2], target=0 -> 4
[4,5,6,7,0,1,2], target=3 -> -1
[1,2,3], target=2         -> 1
[]                         -> -1
```

## 4. What the Interviewer Is Evaluating

- Modified binary-search invariants
- Identification of a sorted half
- Boundary and absent-target handling

## 5. Concept Questions and Interview Answers

### Why do distinct values simplify the decision?

**Interview answer:**

> Comparisons can identify which half is sorted and whether the target lies inside it. Equal boundary values can make that choice ambiguous.
