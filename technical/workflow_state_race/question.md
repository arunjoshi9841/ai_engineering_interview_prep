# Workflow State Race

## 1. Interview Prompt

An agent workflow has ordered steps such as `retrieve`, `draft`, and `submit_for_approval`. After queue redeliveries and a worker autoscaling event, operators see some steps execute twice and other workflows appear to skip a recorded transition. Review the code, diagnose the concurrency problem, and propose a safe first correction.

```ts
interface WorkflowState {
  id: string;
  revision: number;
  completedSteps: string[];
  status: "running" | "completed";
}

async function advance(workflowId: string, step: string) {
  const state = await store.get(workflowId);
  if (state.completedSteps.includes(step)) return;

  await runStep(workflowId, step);
  state.completedSteps.push(step);
  state.status = state.completedSteps.length === allSteps.length ? "completed" : "running";
  await store.save(state);
}
```

## 2. Requirements

- Multiple workers may receive the same workflow event concurrently.
- Each step has a defined order and must reach one durable terminal disposition before a dependent step starts.
- A worker crash, queue redelivery, or stale write must not silently erase a completed transition.
- Side-effecting steps may be retried only through an idempotent operation contract.
- The workflow state is the source of truth; model conversation history is not.
- The corrected design must leave enough data to reconstruct transitions and recover stuck work.

## 3. Example Input / Output

```text
Initial state: revision=4, completedSteps=["retrieve"]
Two workers both receive "draft" for the same workflow.

Expected behavior: one durable owner claims or advances the step; the other observes
the existing transition and does not independently run the same side effect.
```

## 4. What the Interviewer Is Evaluating

- Ability to identify read-modify-write races and non-atomic side effects
- Reasoning about durable state, concurrency, and ordered transitions
- Appropriate use of optimistic concurrency, ownership, and idempotency concepts
- Recovery and observability judgment for agent workflows

## 5. Concept Questions and Interview Answers

### Why is a read-modify-write update unsafe with multiple workers?

**Interview answer:**

> Two workers can both read the same old state, make different decisions, and overwrite each other's updates. A conditional transition or serialized ownership makes that conflict visible instead of silently losing state.

### Why should workflow state be separate from model context?

**Interview answer:**

> Model context is transient and probabilistic. Workflow state needs explicit transitions, durable recovery data, and concurrency controls because it governs real business actions.
