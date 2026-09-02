# Async Agent Job Platform

## 1. Interview Prompt

Design a platform for long-running agent jobs that may retrieve data, call models and tools, wait on dependencies, and produce durable results. It must support multiple tenants, bounded retries, backpressure, cancellation, and fair scheduling.

Focus on job infrastructure rather than one agent's reasoning implementation.

## 2. Requirements

- Accept idempotent submissions and return a durable job ID immediately.
- Persist explicit queued, running, waiting, cancelling, succeeded, failed, and indeterminate states.
- Schedule interactive, batch, and high-priority work without allowing one tenant to starve others.
- Match work to worker capabilities and enforce global, tenant, model, and tool concurrency limits.
- Use leases or equivalent ownership so crashed workers can be recovered.
- Retry only classified failures with backoff, jitter, attempt limits, and stable operation IDs.
- Propagate cancellation while representing side effects whose outcome is already uncertain.
- Store progress and bounded results durably; support polling and event notification.
- Apply deadlines, token/cost budgets, retention, and tenant authorization.
- Expose dead-letter and operator recovery paths without blind replay.

## 3. Initial System Context

Jobs last from seconds to several hours and may wait days for approval. The platform receives 500 submissions per second with bursty bulk imports. Workers run across regions, model providers impose quotas, and tool calls can time out after side effects. Customers expect recent interactive work to start quickly even during large batch runs.

## 4. Example Input / Output

```text
submit(idempotencyKey=k-17) -> job-93, queued
duplicate submission       -> job-93
worker claims attempt 2    -> running with lease
worker crashes             -> lease expires; job becomes recoverable
cancel during uncertain tool call -> indeterminate, reconcile before terminal state
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is job execution exactly once?

**Interviewer:** No. Delivery may be at least once; logical side effects must be idempotent or reconcilable.

**Candidate:** May jobs contain arbitrary code?

**Interviewer:** No. They reference registered, versioned workflow definitions and bounded inputs.

**Candidate:** How fresh must progress be?

**Interviewer:** Seconds for interactive jobs; batch jobs can update less frequently.

## 6. What the Interviewer Is Evaluating

- Durable queue and state architecture
- Fairness, backpressure, leases, and retry semantics
- Cancellation and uncertain-side-effect reasoning
- Multi-tenant operations and budget enforcement

## 7. Likely Interviewer Follow-Ups

- How would you implement weighted fairness across tenants and priorities?
- What is persisted at each checkpoint?
- How do you stop a retry storm after a provider outage?
- How can clients receive updates without overwhelming the platform?

## 8. Architecture Change Requests

1. A workflow waits a week for human approval and spans several deployments.
2. One provider loses 80% of quota while backlog continues growing.
3. A customer requires all job data and execution to remain in one region.

## 9. Concept Questions and Interview Answers

### Why use leases for worker ownership?

**Interview answer:**

> A lease makes ownership temporary and recoverable after a crash. Expiry does not prove the prior side effect failed, so the next worker still uses idempotency or reconciliation.

### What is backpressure here?

**Interview answer:**

> It is the system's controlled response when arrival exceeds safe processing capacity: limit admission, queue bounded work, shed or defer lower-priority jobs, and communicate delay rather than exhausting dependencies.

## 10. Production Discussion

Discuss a durable broker, transactional job store, scheduler, worker registry, leases, delayed queues, checkpoint artifacts, outbox notifications, result storage, reconciliation, and regional partitions. Monitor queue age, start latency, attempts, lease expiry, stuck states, cancellation latency, cost, quota, and fairness.

## 11. Security / Safety Angle

Authorize submission, status, cancellation, replay, and result access per tenant. Workers use scoped identities and registered workflows; payloads, traces, and dead-letter records require encryption, redaction, retention, and size limits.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Queue and state architecture | /5 |
| Reliability and cancellation | /5 |
| Fairness and scalability | /5 |
| Security and operations | /5 |
