# Binary Tree Level Order

## 1. Interview Prompt

Given the root of a binary tree, return its values level by level from top to bottom and left to right within each level.


## 2. Requirements

- Empty input returns `[]`.
- Preserve left-to-right child order.
- Return one nested array per tree depth.
- Do not mutate the tree.
- Visit each node once.

## 3. Example Input / Output

```text
null -> []

    3
   / \
  9  20
    /  \
   15   7

-> [[3], [9,20], [15,7]]
```

## 4. What the Interviewer Is Evaluating

- Queue-based breadth-first traversal
- Correct level-boundary tracking
- Avoidance of inefficient queue operations

## 5. Concept Questions and Interview Answers

### Why does a queue naturally preserve level order?

**Interview answer:**

> Nodes are processed in discovery order. If I capture the queue size at the start of a level, exactly those nodes belong to that level, and their children form the following one.
