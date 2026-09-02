# Longest Unique Substring

## 1. Interview Prompt

Given a string, return the length of its longest contiguous substring containing no repeated Unicode code points.

Implement the function in TypeScript in linear time using code-point positions.

## 2. Requirements

- Compare Unicode code points exactly without normalization.
- Length and positions are measured in code points, not UTF-16 code units.
- Empty input returns `0`.
- The substring must be contiguous.
- Aim for linear time and memory proportional to distinct code points in the active scan.

## 3. Example Input / Output

```text
"abcabcbb" -> 3
"bbbbb"    -> 1
"pwwkew"   -> 3
"😀a😀bc"  -> 4   // "a😀bc"
""         -> 0
```

## 4. What the Interviewer Is Evaluating

- Sliding-window invariants
- Correct handling of repeat positions
- Unicode-aware iteration
- Linear-time reasoning

## 5. Concept Questions and Interview Answers

### Why can a moving window be linear?

**Interview answer:**

> Each boundary advances through the sequence without retreating, so every code point enters and leaves the active range at most a constant number of times.
