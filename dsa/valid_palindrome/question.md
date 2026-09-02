# Valid Palindrome

## 1. Interview Prompt

Given a string, determine whether its ASCII letters and digits form a palindrome when punctuation and spaces are ignored and letters are compared case-insensitively.

Implement the function in TypeScript without building a normalized copy of the entire string.

## 2. Requirements

- Consider only ASCII `A-Z`, `a-z`, and `0-9`.
- Compare ASCII letters case-insensitively; digits compare exactly.
- Empty or all-ignored input is a palindrome.
- Use constant auxiliary space and linear time.
- Do not modify the input.

## 3. Example Input / Output

```text
"A man, a plan, a canal: Panama" -> true
"race a car"                     -> false
"..."                            -> true
"0P"                             -> false
```

## 4. What the Interviewer Is Evaluating

- Inward pointer invariants
- On-the-fly normalization
- Boundary and ignored-character handling
- Time and space reasoning

## 5. Concept Questions and Interview Answers

### Why avoid materializing the normalized string?

**Interview answer:**

> It is unnecessary for a boolean result and uses memory proportional to the input. Comparing relevant characters as they are encountered preserves constant auxiliary space.
