# Event Frequency Counter

## 1. Interview Prompt

Given a sequence of event names, return the most frequent event. When several events have the same highest count, return the one that appeared first in the input.

Implement the function in TypeScript and preserve the stated tie behavior without sorting the input.

## 2. Requirements

- Event names are non-empty, case-sensitive strings.
- Return `null` for an empty sequence.
- Count every occurrence.
- Resolve ties by the event's first input position.
- Do not modify or sort the input.
- Aim for linear time and memory proportional to the number of distinct events.

## 3. Example Input / Output

```text
["open", "save", "open"]          -> { event: "open", count: 2 }
["a", "b", "b", "a"]            -> { event: "a", count: 2 }
["deploy"]                         -> { event: "deploy", count: 1 }
[]                                 -> null
```

## 4. What the Interviewer Is Evaluating

- Frequency aggregation
- Stable tie handling
- Update invariants and edge cases
- Complexity and code readability

## 5. Concept Questions and Interview Answers

### Why should a tie rule be part of the contract?

**Interview answer:**

> Without an explicit tie rule, valid implementations can return different winners, making behavior and tests nondeterministic. The contract should choose a stable secondary rule that the implementation can preserve.

### When would sorting be reasonable despite its extra cost?

**Interview answer:**

> Sorting can be reasonable when I need a complete ranked result rather than one winner, especially if the number of distinct values is much smaller than the number of events. I would still define the secondary ordering explicitly.
