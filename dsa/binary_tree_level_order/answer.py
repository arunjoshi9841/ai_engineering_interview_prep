from dataclasses import dataclass


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def levelOrder(root: TreeNode | None) -> list[list[int]]:
    
    if root is None:
        return []

    result: list[list[int]] = []
    
    def traverse(node: TreeNode | None, level: int) -> None:
        nonlocal result
        if node is None:
            return
        
        if len(result) == level:
            result.append([])
        
        result[level].append(node.value)
        
        traverse(node.left, level + 1)
        traverse(node.right, level + 1)
    
    traverse(root, 0)
    return result
