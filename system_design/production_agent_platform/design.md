# Building a Production Agent Platform

An agent platform is the system that lets many customers run AI-assisted work safely and reliably. The model is important, but it is only one component. A production platform also has to know who requested work, what they are allowed to do, how long the work may run, how to resume after a crash, and how to prevent one customer from slowing everyone else down.

This guide builds that platform in the order its problems appear.

## 1. Start at the API boundary

Imagine a customer asks the platform to summarize a document, investigate an alert, or update a record through an approved tool. The request first reaches an **API gateway**: the public front door that authenticates the caller, validates the request size, enforces a rate limit, and attaches a request ID.

Authentication answers “who is calling?” Authorization answers “may this caller perform this operation?” Both should happen before the request reaches an agent or a model. For a multi-customer platform, the gateway also resolves the **tenant**—the customer account that owns the request. Tenant identity must travel as trusted metadata through every database query, queue message, cache key, and tool call. It should never be inferred from text supplied to a model.

At this point, decide whether the API is synchronous or asynchronous.

- A **synchronous API** holds the connection open and returns the result directly. It suits short, bounded work: for example, a request that normally completes in a few seconds.
- An **asynchronous API** accepts the request, creates a job, and returns a job ID. The client polls a status endpoint or subscribes for a completion notification. It suits work that may wait for a queue, process many files, call slow providers, or require human approval.

Trying to make every operation synchronous creates fragile timeouts. Trying to make every operation asynchronous makes simple interactions unnecessarily awkward. A practical platform supports both and exposes the same identity, policy, and audit boundary to each.

## 2. Turn long work into durable jobs

For asynchronous work, write a job record to a durable database before publishing anything to a queue. A job includes the tenant, actor, workflow version, bounded input, priority, deadline, idempotency key, and initial state.

The state is a small, explicit state machine:

```text
queued → running → succeeded
                 ↘ failed
                 ↘ waiting (for approval, a timer, or an external callback)
                 ↘ cancelling → cancelled
```

A **queue** is a durable work list. It decouples accepting a request from doing the work. A **worker** is a process that takes a queued job and performs one step. Workers claim jobs using a lease: a temporary ownership record. If a machine crashes, the lease expires so another worker can take over rather than leaving the job stuck forever.

The job record, not a worker’s memory, is the source of truth. A worker updates it at checkpoints. That is what makes recovery possible after deployments, process crashes, and regional interruptions.

## 3. Model multi-step work as a workflow

Most useful agent work is more than one model call. It may retrieve evidence, run two independent checks, ask for approval, then execute a permitted action. Model this as a **directed acyclic graph (DAG)**: each node is a step, and an arrow means “this step needs that result first.” Acyclic means the graph cannot loop forever.

For example:

```text
validate request → retrieve evidence ─┬→ analyze policy ─┐
                                      └→ analyze history ─┴→ decide → notify
```

The two analyses can **fan out** and run concurrently. The decision step **fans in** after both results arrive. The orchestrator records which nodes are ready, running, finished, or blocked. It does not need to keep a worker occupied while waiting days for an approval; it persists a wait condition and schedules the next node only when the condition is met.

Keep workflow state small and typed: ownership, status, outputs, approvals, deadlines, and retry count belong in a transactional database. Place large files, model artifacts, and evidence blobs in object storage, then reference them from the workflow. Store claims and observations append-only with a source and timestamp. This **shared state** lets several workers cooperate without pretending that one ever-growing chat transcript is reliable system state.

## 4. Make retries safe instead of optimistic

Networks fail in ambiguous ways. If a call times out while creating a ticket, the ticket may have been created even though no response arrived. Calling again blindly can create two tickets.

Give every side-effecting operation a stable **idempotency key**—a unique identifier that means “perform this logical operation once.” The receiving system stores the result for that key and returns it on a duplicate. If the provider does not support idempotency, record a provider request ID and run a reconciliation query before retrying.

Retry only failures that are plausibly temporary, such as a connection reset or a 503 response. Use exponential backoff (wait longer after each attempt), add random **jitter** so many jobs do not retry together, and enforce an attempt and time budget. A timeout after a possible side effect is **indeterminate**, not failed. Stop, check the external state, and record the uncertainty visibly.

Cancellation follows the same rule. Changing a job to `cancelling` stops later steps and signals active workers, but it cannot undo a call that already left the platform. Reconcile that call, then mark the final durable state accurately.

## 5. Scale fairly

Because workers are stateless between checkpoints, add more workers as queue depth, queue age, or available capacity rises. Do not use one undifferentiated worker pool. Separate interactive work from bulk jobs, and separate expensive resource classes such as large-file processing from light requests. This is a **bulkhead**: a capacity boundary that stops one kind of overload from sinking everything else.

Tenant-level concurrency limits, token budgets, per-tool limits, and weighted fair scheduling provide **noisy-neighbor control**. A large tenant can still use its purchased share, but cannot consume all workers or all provider quota. Apply backpressure when limits are reached: defer a low-priority job, reject it with a retry time, or offer a smaller permitted operation. Silent overload is worse than an explicit queue.

## 6. Plan for ordinary failures

Dependencies need deadlines, circuit breakers, and classification. A **circuit breaker** temporarily stops calls to a dependency that is broadly failing, so the platform does not turn one outage into a retry storm. Record the failure reason and the last safe checkpoint. Notifications should come from an outbox record written with the state transition, so completion cannot be lost between “job updated” and “message sent.”

Finally, make operations explainable. An operator should be able to find a job by ID, see its workflow version and attempts, determine which external actions are known or indeterminate, and replay only a safe incomplete step. That combination—durable state, bounded work, trusted identity, and explicit failure handling—is what turns an agent demo into a platform.
