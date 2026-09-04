from dataclasses import dataclass


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

class TreeParseError(ValueError):
    pass

def serialize(root: TreeNode | None) -> str:
    raise NotImplementedError("Implement the contract documented in question.md")

def deserialize(encoded: str) -> TreeNode | None:
    raise NotImplementedError("Implement the contract documented in question.md")
