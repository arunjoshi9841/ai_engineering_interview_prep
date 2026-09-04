from dataclasses import dataclass


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def isValidBinarySearchTree(root: TreeNode | None) -> bool:
    raise NotImplementedError("Implement the contract documented in question.md")
