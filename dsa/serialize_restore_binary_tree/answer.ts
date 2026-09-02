export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export class TreeParseError extends Error {}

export function serialize(root: TreeNode | null): string {
  throw new Error("not implemented");
}

export function deserialize(encoded: string): TreeNode | null {
  throw new Error("not implemented");
}
