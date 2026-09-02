# Valid Delimiter Sequence

## 1. Interview Prompt

Given a string containing delimiters and other text, determine whether `()`, `[]`, and `{}` are correctly matched and nested. Ignore non-delimiter characters.

Implement the function in TypeScript.

## 2. Requirements

- Every closing delimiter must match the most recent unmatched opening delimiter.
- All opening delimiters must be closed.
- Ignore every non-delimiter character.
- Empty or delimiter-free input is valid.
- Use linear time and stack space proportional to nesting depth.

## 3. Example Input / Output

```text
"a(b[c]{d})" -> true
"([)]"       -> false
"text"       -> true
"(("         -> false
"]"          -> false
```

## 4. What the Interviewer Is Evaluating

- Stack discipline and nesting
- Early mismatch detection
- Clear input-contract reasoning

## 5. Concept Questions and Interview Answers

### Why is a counter per delimiter type insufficient?

**Interview answer:**

> Counts can balance while nesting order is wrong, as in `([)]`. Validation needs the order of unmatched openings.
