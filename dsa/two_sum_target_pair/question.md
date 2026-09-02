# Two-Sum Target Pair

## 1. Interview Prompt

Given an array of integers and a target, return the indices of two different elements whose values add to the target.

Implement the function in TypeScript and explain the time and space complexity of your approach.

## 2. Requirements

- Return exactly two zero-based indices in ascending order.
- The two indices must refer to different elements.
- Exactly one valid pair is guaranteed.
- Negative values and duplicate values are allowed.
- Do not modify the input array.
- Aim for linear expected time.

## 3. Example Input / Output

```text
values = [8, 3, 11, 2], target = 5  -> [1, 3]
values = [4, 4], target = 8         -> [0, 1]
values = [-3, 7, 1], target = 4     -> [0, 1]
```

## 4. What the Interviewer Is Evaluating

- Requirement and edge-case discipline
- Appropriate data-structure selection
- One-pass reasoning and complexity analysis
- Clear TypeScript implementation

## 5. Concept Questions and Interview Answers

### Why can extra memory reduce repeated work in array problems?

**Interview answer:**

> Remembering useful information from earlier elements can replace repeated scans, but the stored state grows with the input. The right choice depends on the required time bound, memory limit, and whether input order may change.

### Why must duplicate values be handled carefully?

**Interview answer:**

> The same value may be needed twice, but the same array position cannot be reused. I would test the lookup against previously seen positions so a second occurrence can match the first.
