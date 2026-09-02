# Serialize and Restore a Binary Tree

## 1. Interview Prompt

Implement serialization and deserialization for a binary tree of integer values. The representation must preserve exact tree shape, including missing children, and deserializing a serialized tree must reconstruct an equivalent tree.

Use a text format suitable for this exercise; do not use object serialization libraries.

## 2. Requirements

- Support negative and repeated integer values.
- Preserve left and right child positions explicitly.
- The empty tree must round-trip.
- Serialization must be deterministic.
- Deserialization must reject truncated input, invalid integers, and trailing tokens.
- Neither operation may mutate its input.
- Aim for `O(n)` time for `n` nodes.

## 3. Example Input / Output

```text
null -> serialize -> valid empty-tree encoding -> deserialize -> null

    1
   / \
 -2   1
   \
    4

-> deterministic encoding that restores the same shape and values

truncated or extra tokens -> throw a typed parse error
```

## 4. What the Interviewer Is Evaluating

- Reversible traversal design
- Explicit representation of missing structure
- Parser state and malformed-input handling
- Time and space complexity

## 5. Concept Questions and Interview Answers

### Why do node values alone not preserve tree shape?

**Interview answer:**

> Different trees can produce the same value sequence when missing-child positions are omitted. Explicit nulls make the traversal representation unambiguous and reversible.
