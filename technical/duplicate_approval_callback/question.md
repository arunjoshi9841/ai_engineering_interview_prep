Here’s a much clearer version of the same interview question, without changing what it tests.

### Duplicate Approval Callback

**Scenario**

Your system has an approval step before executing a sensitive tool action.

An external approval service sends a callback when a reviewer approves or rejects the request.

Sometimes the approval service retries the same callback, including at nearly the same time.

You found two bugs:

* The same approval was processed twice, so the tool executed twice.
* An old approval arrived after the action had already been changed or replaced, but the system still executed it.

**Current code**

```ts
export async function approvalCallback(body: any) {
  const request = await approvals.get(body.requestId);

  request.status = body.approved ? "approved" : "rejected";
  request.reviewer = body.reviewer;

  await approvals.save(request);

  if (body.approved) {
    await executeTool(request.toolName, request.args);
  }

  return { ok: true };
}
```

**Your task**

Explain what is unsafe about this code and how you would fix the flow.

You do not need to write production-ready code. Focus on the state transitions and execution flow.

Your solution should make sure that:

* The callback is authenticated before trusting it.
* Only a `pending` approval request can be approved or rejected.
* Expired or replaced requests cannot be approved later.
* Receiving the same callback twice does not execute the action twice.
* Two callbacks arriving at the same time cannot both succeed.
* A second, conflicting decision does not overwrite the first decision.
* The approval decision is saved before execution is scheduled.
* Execution happens through a job/outbox instead of directly inside the callback.
* The worker checks again that the action is still valid and authorized before executing.

**Expected behavior**

```text
same approval callback twice
-> decision stored once
-> action executed once

approval arrives after expiration
-> reject callback
-> no execution

approval arrives for an old version of the action
-> reject as stale
-> no execution

approval happens first, rejection arrives later
-> keep original approval
-> record/report conflicting decision
```

**What the interviewer is testing**

* Can you spot a race condition?
* Do you understand idempotency?
* Do you understand safe state transitions?
* Do you know why approval and execution should be separated?
* Do you understand that an approval applies to one specific version of an action?

The core answer they are looking for is basically:

**“Only let a pending, valid approval request transition once. Save that decision atomically, queue the execution separately, and revalidate the action before the worker runs it.”**


## 5. What the Interviewer Is Evaluating

- Race and stale-decision diagnosis
- Conditional state transitions and idempotency
- Transactional outbox reasoning
- Separation of approval from current authorization

## 6. Concept Questions and Interview Answers

### Why not execute directly inside the callback?

**Interview answer:**

> Callback retries and database failures can repeat or lose the handoff. A transactional decision plus outbox creates a durable, deduplicated execution intent.

### Does an approved status permanently authorize execution?

**Interview answer:**

> No. It is bound to a specific action and time. The worker still checks current identity, policy, target state, and approval scope.
