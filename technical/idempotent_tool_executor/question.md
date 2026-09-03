# Idempotent Tool Executor

## 1. Interview Prompt

An agent can request a tool that creates an external case. Calls can time out after the external system may already have created the case, and a client may retry the same logical request. Implement a small executor in a language of your choice that makes retry behavior safe for one running process.

Do not build a database or an HTTP client. Focus on the executor's contract and the state needed to prevent duplicate handler invocations.

## 2. Requirements

- Every logical operation supplies an idempotency key.
- Duplicate requests with the same tenant, tool name, and key must not invoke the handler more than once in the process.
- Concurrent duplicates must receive a consistent outcome rather than starting independent calls.
- Return a completed result to a later duplicate when one is available.
- If a handler times out, return an indeterminate result and do not automatically invoke that key again in the initial implementation.
- The handler can fail before any known side effect; distinguish that failure from an indeterminate timeout in the returned result.

## 3. Example Input / Output

```text
const call = {
  tenantId: "acme",
  toolName: "create_case",
  idempotencyKey: "case-request-93",
  args: { accountId: "a-7", reason: "review" },
};

await executor.execute(call, createCase);
// { status: "completed", value: { caseId: "c-101" } }

await executor.execute(call, createCase);
// { status: "completed", value: { caseId: "c-101" } }
// `createCase` is invoked once.
```

## 4. What the Interviewer Is Evaluating

- Safe reasoning about uncertain side effects
- Asynchronous and concurrent-request handling
- Clear result contracts for retryable versus indeterminate failures
- Awareness of the limits of in-memory state

## 5. Concept Questions and Interview Answers

### Why does a timeout not prove that an external operation failed?

**Interview answer:**

> The request or response can be lost after the downstream system commits the change. Treating a timeout as a clean failure and retrying immediately can create a duplicate side effect.

### Is exactly-once delivery usually achievable end to end?

**Interview answer:**

> Usually not across independent systems. I aim for at-least-once delivery with idempotent handling, durable operation records, and reconciliation for ambiguous outcomes.
