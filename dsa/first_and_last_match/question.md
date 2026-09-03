# First and Last Match

## 1. Interview Prompt

Given a nondecreasing array of integers and a target, return the first and last indices where the target occurs. Return `[-1, -1]` when absent.

Implement the function in a language of your choice in logarithmic time.

## 2. Requirements

- Duplicates and negative values are allowed.
- Return zero-based indices.
- Empty input returns `[-1, -1]`.
- Do not scan linearly after finding one match.
- Do not modify input.
- Use `O(log n)` time and constant auxiliary space.

## 3. Example Input / Output

```text
[1,2,2,2,4], target=2 -> [1,3]
[1,3,5], target=2     -> [-1,-1]
[7], target=7         -> [0,0]
[]                    -> [-1,-1]
```

## 4. What the Interviewer Is Evaluating

- Boundary-oriented binary search
- Loop invariants and off-by-one control
- Duplicate and absence handling

## 5. Concept Questions and Interview Answers

### Why use two boundary searches?

**Interview answer:**

> Finding any match does not identify the duplicate range. Separate searches maintain invariants for the left and right boundaries while keeping logarithmic time.
