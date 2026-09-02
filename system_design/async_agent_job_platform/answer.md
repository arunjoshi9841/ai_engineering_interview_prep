# Async Agent Job Platform

**Interviewer:** Design a platform for long-running agent jobs with retries, cancellation, and fair scheduling.

**Me:** I would return a durable job ID immediately and execute the work asynchronously. A submission includes an idempotency key, tenant, workflow version, bounded inputs, priority, deadline, and budget.

The job store would persist states such as `queued`, `running`, `waiting`, `cancelling`, `succeeded`, `failed`, and `indeterminate`. A durable broker carries runnable work, while a scheduler matches jobs to worker capabilities and checks global, tenant, model, and tool concurrency limits.

To keep interactive work responsive during batch imports, I would use separate priority queues, weighted fairness, and reserved capacity. A tenant can receive a fair share of capacity without allowing a large customer to consume everything. Backpressure can reject or defer low-priority work when the system or a downstream provider is full.

Workers claim jobs using leases. If a worker crashes, the lease expires and the scheduler can recover the job. The next attempt must inspect the last checkpoint first. Each external side effect gets a stable operation ID, and retries happen only for classified transient errors with exponential backoff, jitter, and an attempt limit.

Exactly-once execution is not realistic across arbitrary tools. A broker can avoid duplicate delivery, but it cannot atomically commit a remote side effect and the job database. So tools should support idempotency or status reconciliation. If a timeout happens after a tool may have acted, the job becomes `indeterminate` until the result is known.

Cancellation should update durable state and send a cancellation signal to the worker. A running model call or tool call may not stop immediately. If a side effect may already have happened, cancellation does not erase that uncertainty. The job stays in a recoverable state until reconciliation.

Progress and bounded results belong in durable storage. Clients can poll the job API or subscribe to notifications. Notifications should be produced from an outbox so a client does not miss a state transition. Large artifacts should live in protected object storage with references in the job record.

For a workflow waiting a week for approval, I would persist a timer or wait condition rather than hold a worker. Workflow definitions and schemas are versioned, and each running job keeps its pinned version unless an explicit migration is safe.

**Interviewer:** How do you stop a retry storm?

**Me:** Classify provider failures centrally, apply per-provider and per-tenant retry budgets, use circuit breakers, and add jitter. If the provider is broadly unhealthy, pause or shed work and make the delay visible instead of multiplying requests.

**Interviewer:** What can operators replay?

**Me:** They can replay a specific failed step after reviewing its checkpoint and external outcome. Replay requires authorization and must not rerun completed side effects blindly.
