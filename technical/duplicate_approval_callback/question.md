# Duplicate Approval Callback

## 1. Interview Prompt

An approval provider may retry callbacks. Operators found that one approved action executed twice, and a late approval executed after the request had been superseded. Diagnose the TypeScript code and propose a safe correction.

Focus on callback state, binding, and execution handoff rather than redesigning the approval UI.

## 2. Requirements

Your correction must:

- Authenticate the callback before trusting request or reviewer fields.
- Make duplicate and concurrent callbacks idempotent.
- Accept a decision only for a pending, unexpired request and current action digest.
- Prevent approval from changing a rejected, cancelled, expired, or superseded request.
- Record the decision transactionally before enqueueing execution through an outbox.
- Recheck authorization and action state at execution time.
- Represent a conflicting second decision explicitly.

## 3. Provided Code

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

Callbacks can be redelivered concurrently, and approval requests contain `expiresAt`, `actionDigest`, `revision`, and terminal status metadata not checked above.

## 4. Example Input / Output

```text
two identical approved callbacks -> one durable decision and one execution event
approval after expiry             -> rejected as stale; no execution
approval for superseded digest    -> rejected as stale; no execution
approved then conflicting reject  -> conflict recorded; approved state not overwritten
```

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
