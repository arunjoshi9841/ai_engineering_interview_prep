from dataclasses import dataclass
from collections import deque


@dataclass
class TreeNode:
    value: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def maximumDepth(root: TreeNode | None) -> int:
    
    if root is None:
        return 0
    
    left_depth = maximumDepth(root.left)
    right_depth = maximumDepth(root.right)
    
    return max(left_depth, right_depth) + 1

def maximumQueueAlt(root: TreeNode | None) -> int:
    if root is None:
        return 0

    queue: deque[TreeNode] = deque([root])
    depth: int = 0

    while queue:
        level_items_count = len(queue)
        depth += 1

        for _ in range(level_items_count):
            node = queue.popleft()

            if node.left:
                queue.append(node.left)

            if node.right:
                queue.append(node.right)

    return depth
    
