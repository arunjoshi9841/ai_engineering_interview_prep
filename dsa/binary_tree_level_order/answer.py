"""Python interface matching the TypeScript contract in question.md."""

from dataclasses import dataclass


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def levelOrder(root: TreeNode | None) -> list[list[int]]:
    raise NotImplementedError("Implement the contract documented in question.md")
