# Container With Most Water

## 1. Interview Prompt

An array of non-negative heights represents vertical lines at unit-spaced positions. Choose two lines that hold the greatest rectangular area between them and return that area.

Implement the function in a language of your choice in linear time.

## 2. Requirements

- Area is `distance × min(leftHeight, rightHeight)`.
- Heights are finite non-negative integers.
- Fewer than two heights returns `0`.
- Do not modify the input.
- Assume the result fits within the numeric range of the language you choose.
- Aim for linear time and constant auxiliary space.

## 3. Example Input / Output

```text
[1,8,6,2,5,4,8,3,7] -> 49
[1,1]                 -> 1
[5]                   -> 0
[0,4,0]               -> 0
```

## 4. What the Interviewer Is Evaluating

- Pointer-movement proof
- Correct area and boundary handling
- Avoidance of quadratic enumeration
- Complexity reasoning

## 5. Concept Questions and Interview Answers

### What limits the area for a fixed pair?

**Interview answer:**

> The shorter line limits usable height, while index distance sets width. Improving area requires finding a pair that changes one of those limiting factors enough to offset lost width.
