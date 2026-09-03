# Group Anagrams

## 1. Interview Prompt

Given a list of lowercase English words, group together words that are anagrams. Preserve each word's original order within its group, and order the groups by the position of their first word in the input.

Implement the function in a language of your choice and explain the complexity of the grouping key you choose.

## 2. Requirements

- Words contain only letters `a` through `z`; empty strings are allowed.
- Duplicate words remain as separate entries.
- Every input word appears in exactly one output group.
- Words within a group preserve input order.
- Groups are ordered by first appearance.
- Do not modify the input.
- Aim for time proportional to the total characters plus the number of words, excluding output storage, when using the fixed alphabet.

## 3. Example Input / Output

```text
["eat", "tea", "tan", "ate", "nat", "bat"]
-> [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]

["", "a", ""]
-> [["", ""], ["a"]]
```

## 4. What the Interviewer Is Evaluating

- Construction of a stable grouping key
- Map-based aggregation and output ordering
- Duplicate and empty-string handling
- Complexity tradeoffs between key strategies

## 5. Concept Questions and Interview Answers

### What makes a valid grouping key?

**Interview answer:**

> It must be identical for every pair of words considered anagrams and different for words with different character multiplicities. Its representation also needs unambiguous boundaries so distinct frequency patterns cannot collide accidentally.

### Why does insertion order matter in this contract?

**Interview answer:**

> The result is not just a partition; it promises stable word and group ordering. Preserving insertion order avoids a separate reordering step and makes output deterministic.
