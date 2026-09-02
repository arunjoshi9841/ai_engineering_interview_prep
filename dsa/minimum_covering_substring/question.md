# Minimum Covering Substring

## 1. Interview Prompt

Given ASCII strings `source` and `required`, return the shortest substring of `source` containing every character in `required` with at least the required multiplicity.

Return the earliest substring when several minimum windows have the same length.

## 2. Requirements

- Comparison is exact and case-sensitive.
- Repeated characters in `required` require repeated occurrences in the window.
- If `required` is empty, return `""`.
- If no covering window exists, return `""`.
- The result must be contiguous.
- Aim for linear time and auxiliary space bounded by the ASCII alphabet.

## 3. Example Input / Output

```text
source="ADOBECODEBANC", required="ABC" -> "BANC"
source="aa", required="aa"             -> "aa"
source="a", required="aa"              -> ""
source="abc", required=""              -> ""
```

## 4. What the Interviewer Is Evaluating

- Required-versus-current frequency accounting
- Valid-window contraction
- Stable tie behavior and edge cases

## 5. Concept Questions and Interview Answers

### Why track satisfied requirements rather than compare full maps repeatedly?

**Interview answer:**

> A bounded satisfaction counter lets the algorithm know when the window becomes valid without rescanning every required character on each movement.
