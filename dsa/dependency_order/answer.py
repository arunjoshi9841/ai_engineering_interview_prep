def dependency_order(
    task_count: int,
    dependencies: list[tuple[int, int]],
) -> list[int]:
    dependency_map: dict[int, set[int]] = {
        task: set()
        for task in range(task_count)
    }

    for task, dependency in dependencies:
        dependency_map[task].add(dependency)

    visited: set[int] = set()
    visiting: set[int] = set()

    def dfs(task: int) -> bool:
        if task in visiting:
            return False

        if task in visited:
            return True

        visiting.add(task)

        for dependency in dependency_map.get(task, set()):
            if not dfs(dependency):
                return False

        visiting.remove(task)
        visited.add(task)

        return True

    for task in range(task_count):
        if not dfs(task):
            return []

    return list(visited)