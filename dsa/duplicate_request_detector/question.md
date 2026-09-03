# Duplicate Request Detector

## 1. Interview Prompt

An API gateway receives a batch of request identifiers. Return the identifier of the first request that is a duplicate when the batch is scanned from left to right. If every identifier is unique, return `null`.

Implement the function in a language of your choice with clear complexity bounds.

## 2. Requirements

- Compare identifiers exactly and case-sensitively.
- Return the identifier at the first position whose value appeared earlier.
- Empty input and fully unique input return `null`.
- Do not modify the input.
- Aim for linear expected time.

## 3. Example Input / Output

```text
["r1", "r2", "r1", "r2"] -> "r1"
["a", "b", "c"]          -> null
[]                         -> null
["A", "a", "A"]          -> "A"
```

## 4. What the Interviewer Is Evaluating

- Precise interpretation of ordering semantics
- Membership-tracking and ordering reasoning
- Correct handling of empty and duplicate-heavy input
- Complexity explanation

## 5. Concept Questions and Interview Answers

### How do exact and probabilistic duplicate detection differ?

**Interview answer:**

> Exact detection must retain enough state to avoid false answers. A probabilistic structure can use much less memory but may report false positives, so it is suitable only when that error is acceptable and independently verified before a consequential decision.

### Why is this not sufficient idempotency protection for a production API?

**Interview answer:**

> An in-memory batch check does not survive restarts or coordinate instances, and it does not retain the original result. Production idempotency needs a durable, scoped key and an atomic execution record.
