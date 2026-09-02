export interface SparseEntry {
  index: number;
  value: number;
}

export function sparseDotProduct(
  left: readonly SparseEntry[],
  right: readonly SparseEntry[],
): number {
  throw new Error("not implemented");
}
