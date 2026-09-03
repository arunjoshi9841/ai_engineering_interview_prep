export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function levelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = []

  function traverse(node: TreeNode | null, level: number = 0) {
    if(!node) return
    if(result.length <= level) {
      result.push([])
    }
    result[level].push(node.value)
    traverse(node.left, level + 1)
    traverse(node.right, level + 1)
  }
  traverse(root)
  return result
}
