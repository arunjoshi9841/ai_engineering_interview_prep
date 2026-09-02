# Min Stack

## 1. Interview Prompt

Implement a stack of numbers that supports `push`, `pop`, `top`, and retrieving the current minimum, all in constant time.

Use TypeScript and define empty-stack behavior explicitly.

## 2. Requirements

- `push` adds one finite number.
- `pop` removes and returns the top value, or `null` when empty.
- `top` returns the top value without removal, or `null` when empty.
- `getMin` returns the minimum current value, or `null` when empty.
- Duplicate minimum values must behave correctly.
- Every operation must be `O(1)` time.
- Internal space may grow linearly with stack size.

## 3. Example Input / Output

```text
push(3), push(1), push(1), push(2)
getMin() -> 1
pop()    -> 2
pop()    -> 1
getMin() -> 1
pop()    -> 1
getMin() -> 3
```

## 4. What the Interviewer Is Evaluating

- Auxiliary-state invariants
- Duplicate minimum handling
- Constant-time operation reasoning

## 5. Concept Questions and Interview Answers

### Why are duplicate minima important?

**Interview answer:**

> Removing one occurrence must not lose the fact that another equal minimum remains. The auxiliary state must represent multiplicity or align with each stack position.
