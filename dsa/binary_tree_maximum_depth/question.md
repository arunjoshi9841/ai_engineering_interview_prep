# Binary Tree Maximum Depth

## 1. Interview Prompt

Given the root of a binary tree, return its maximum depth: the number of nodes on the longest path from the root to a leaf.

Implement the function in TypeScript.

## 2. Requirements

- An empty tree has depth `0`.
- A leaf has depth `1`.
- Node values do not affect the result.
- Do not mutate the tree.
- Visit each reachable node at most once.

## 3. Example Input / Output

```text
null                         -> 0
1                            -> 1
    1
   / \
  2   3
 /
4                            -> 3
```

## 4. What the Interviewer Is Evaluating

- Recursive decomposition or iterative traversal
- Base cases and depth accounting
- Time and auxiliary-space reasoning

## 5. Concept Questions and Interview Answers

### What does the recursive return value represent?

**Interview answer:**

> It is the maximum depth of the subtree rooted at that node. The parent combines the two subtree depths and adds itself.
