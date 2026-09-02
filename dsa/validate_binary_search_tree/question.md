# Validate Binary Search Tree

## 1. Interview Prompt

Given a binary tree, determine whether it is a valid binary search tree. Every value in a node's left subtree must be strictly smaller, and every value in its right subtree must be strictly larger.

Implement the function in TypeScript.

## 2. Requirements

- An empty tree is valid.
- Duplicate values make the tree invalid.
- The ordering rule applies to every descendant, not only direct children.
- Values are finite JavaScript numbers.
- Do not mutate the tree.
- Visit each node at most once.

## 3. Example Input / Output

```text
    2
   / \
  1   3       -> true

    5
   / \
  1   7
     / \
    4   8     -> false; 4 violates the root's lower bound

2 with left child 2 -> false
```

## 4. What the Interviewer Is Evaluating

- Propagation of ancestor bounds
- Strict boundary handling
- Recursive invariants and complexity

## 5. Concept Questions and Interview Answers

### What invariant is carried into a subtree?

**Interview answer:**

> Each node must fall inside the strict range imposed by all its ancestors. Entering a left child tightens the upper bound, and entering a right child tightens the lower bound.
