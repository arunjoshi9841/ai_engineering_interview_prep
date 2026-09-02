# First Unique Character

## 1. Interview Prompt

Given a string, return the zero-based position of the first Unicode code point that occurs exactly once. Return `-1` when no such code point exists.

Implement the function in TypeScript and preserve the original order.

## 2. Requirements

- Count Unicode code points, not UTF-16 code units.
- Return a code-point index, not a UTF-16 string offset.
- Compare code points exactly; do not normalize case or Unicode forms.
- Empty input returns `-1`.
- Aim for linear time and memory proportional to the number of distinct code points.
- Do not modify the input.

## 3. Example Input / Output

```text
"swiss"   -> 1    // "w"
"aabb"    -> -1
"😀a😀b"  -> 1    // "a"; indexes count code points
""        -> -1
```

## 4. What the Interviewer Is Evaluating

- Counting followed by order-preserving selection
- Awareness of JavaScript string iteration semantics
- Clear index contract
- Complexity and edge-case reasoning

## 5. Concept Questions and Interview Answers

### Why is JavaScript string indexing important here?

**Interview answer:**

> Numeric indexing addresses UTF-16 code units, so some code points occupy two positions. The implementation must use an iteration and index convention that matches the promised code-point contract.

### Why might normalization complicate returned indices?

**Interview answer:**

> Normalization can combine or replace code-point sequences, so positions in normalized text may not map one-to-one to the original input. The API must say which representation its index refers to.
