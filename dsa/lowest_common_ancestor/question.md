# Lowest Common Ancestor

## 1. Interview Prompt

Given the root of a binary tree and references to two distinct nodes in that tree, return their lowest common ancestor: the deepest node whose subtree contains both targets.

Implement the function in TypeScript.

## 2. Requirements

- The tree is not a binary search tree.
- Both target node references are guaranteed to occur in the tree.
- Targets are distinct, but may have equal values.
- Compare nodes by object identity, not by value.
- A target may be an ancestor of the other target.
- Do not mutate the tree.

## 3. Example Input / Output

```text
        3
       / \
      5   1
     / \
    6   2

targets 6 and 2 -> node 5
targets 5 and 6 -> node 5
```

## 4. What the Interviewer Is Evaluating

- Recursive subtree decomposition
- Interpretation and combination of partial results
- Ancestor and split-point edge cases

## 5. Concept Questions and Interview Answers

### Why is a node the LCA when the targets are found in different child subtrees?

**Interview answer:**

> Each child reports evidence for a different target, so the current node is the first point where both paths meet. Any deeper node belongs to only one of those subtrees.
