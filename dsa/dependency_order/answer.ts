export function dependencyOrder(
  taskCount: number,
  dependencies: readonly (readonly [number, number])[],
): number[] {
  const dependencyMap = new Map<number, Set<number>>();

  for (let i = 0; i < taskCount; i++) {
    dependencyMap.set(i, new Set());
  }

  for (const [task, dependency] of dependencies) {
    dependencyMap.get(task)!.add(dependency);
  }

  const visited = new Set<number>();
  const visiting = new Set<number>();

  const dfs = (task: number): boolean => {
    if (visiting.has(task)) {
      return false;
    }

    if (visited.has(task)) {
      return true;
    }

    visiting.add(task);

    for (const dep of dependencyMap.get(task) ?? []) {
      if (!dfs(dep)) {
        return false;
      }
    }

    visiting.delete(task);
    visited.add(task);

    return true;
  };

  for (let task = 0; task < taskCount; task++) {
    if (!dfs(task)) {
      return [];
    }
  }

  return [...visited];
}
