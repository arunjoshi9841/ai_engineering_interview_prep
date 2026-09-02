"""Python interface matching the TypeScript contract in question.md."""

from dataclasses import dataclass


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def lowestCommonAncestor(root: TreeNode, first: TreeNode, second: TreeNode) -> TreeNode:
    raise NotImplementedError("Implement the contract documented in question.md")
