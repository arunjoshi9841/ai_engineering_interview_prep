# Workflow Checkpoint Store

## 1. Interview Prompt

Implement an in-memory TypeScript checkpoint store for durable-style agent workflow state. It must enforce valid transitions, optimistic concurrency, and idempotent replay of the same logical transition.

The initial implementation is one process; discuss database durability afterward.

## 2. Requirements

- Create a workflow at revision 0 in `running` state.
- `transition` requires the caller's expected revision and a unique operation ID.
- Allow `running -> waiting`, `waiting -> running`, and either nonterminal state to `completed` or `failed`.
- Terminal states cannot transition.
- A successful transition increments revision once and records a bounded checkpoint payload.
- Repeating the same workflow and operation ID returns the original resulting state.
- Reusing an operation ID with different expected revision, target state, or payload digest returns `idempotency_conflict`.
- A stale expected revision returns `revision_conflict` and does not mutate state.
- Returned states must not expose mutable internal references.

## 3. Example Input / Output

```text
create(w1) -> revision=0, running
transition(w1, 0, op7, waiting, {...}) -> revision=1
repeat identical op7                    -> revision=1, replayed=true
transition(w1, 0, op8, running, {...})  -> revision_conflict
```

## 4. What the Interviewer Is Evaluating

- State-machine and optimistic-concurrency reasoning
- Idempotency record design
- Defensive copying and bounded state
- Separation of checkpoints from external effects

## 5. Concept Questions and Interview Answers

### What does optimistic concurrency protect?

**Interview answer:**

> It prevents a caller that read an older revision from silently overwriting newer state. The conflict becomes explicit so the caller can reload and decide safely.

### Why retain idempotency records after transition?

**Interview answer:**

> A caller may lose the response and retry. Retaining the operation result lets the store return the original transition instead of applying it again.
