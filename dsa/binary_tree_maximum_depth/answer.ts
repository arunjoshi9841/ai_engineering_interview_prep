export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function maximumDepth(root: TreeNode | null): number {
  if(!root) return 0
  const leftDepth = maximumDepth(root.left)
  const rightDepth = maximumDepth(root.right)
  return Math.max(leftDepth, rightDepth) + 1
}

export function maximumDepthAlt(root: TreeNode | null): number {
  if (!root) return 0;

  const queue: TreeNode[] = [root];
  let depth = 0;

  while (queue.length > 0) {
    const levelSize = queue.length;
    depth++;

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return depth;
}
