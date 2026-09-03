# Dependency Order

## 1. Interview Prompt

There are `taskCount` tasks numbered from `0` through `taskCount - 1`. Given prerequisite relationships, return any ordering in which every prerequisite appears before its dependent task. Return an empty array if no such ordering exists.

Implement the function in a language of your choice.

## 2. Requirements

- Each pair is `[prerequisite, dependent]`.
- Task IDs in the input are valid.
- Duplicate relationship pairs may appear and must not change the result.
- Disconnected tasks must still appear in the returned order.
- `taskCount = 0` returns `[]` and is not a cycle.
- Do not modify input.
- Aim for `O(V + E)` time after duplicate handling.

## 3. Example Input / Output

```text
taskCount=4, dependencies=[[0,1],[0,2],[1,3],[2,3]]
-> [0,1,2,3] or [0,2,1,3]

taskCount=2, dependencies=[[0,1],[1,0]] -> []
taskCount=3, dependencies=[]            -> any permutation of [0,1,2]
```

## 4. What the Interviewer Is Evaluating

- Graph construction and topological ordering
- Cycle detection through processed-node count or DFS state
- Indegree correctness with duplicate edges

## 5. Concept Questions and Interview Answers

### Why can a zero-indegree task be scheduled safely?

**Interview answer:**

> It has no unmet prerequisites in the remaining graph. Removing it and its outgoing edges preserves the ordering constraints for all other tasks.
