# Customer-Facing Agent API

## 1. Interview Prompt

Design a secure, versioned API through which enterprise customers start agent runs, stream interactive results, inspect long-running jobs, cancel work, and retrieve final outputs.

Focus on the external contract and request path. Internal agent reasoning is out of scope.

## 2. Requirements

- Authenticate customer identities and derive tenant, user, and workflow authorization from trusted context.
- Support synchronous, streaming, and asynchronous execution modes with explicit deadlines.
- Use idempotency keys for submissions and stable job, workflow, and operation IDs.
- Validate bounded inputs and never let clients choose unrestricted prompts, models, tools, or budgets.
- Enforce tenant quotas, rate limits, concurrency, and fair-use policy.
- Propagate cancellation while representing already-uncertain side effects honestly.
- Version request, response, event, and error contracts compatibly.
- Return structured citations, tool/approval status, usage, and safe errors where policy permits.
- Protect stream reconnection from duplication and cross-tenant access.
- Emit auditable decisions and operational telemetry without sensitive payloads.

## 3. Initial System Context

The API serves browser applications and customer backends at 2,000 requests per second with 10x bursts. Interactive clients expect a first event within two seconds; some workflows last hours. Customers use OAuth identities or service accounts and require regional data controls.

## 4. Example Input / Output

```text
POST /v1/runs + Idempotency-Key k7 -> 202, run r93
duplicate POST with same scoped key -> same r93
GET /v1/runs/r93/events?after=41   -> resume from event 42
DELETE /v1/runs/r93                -> cancelling or indeterminate, not false success
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is every workflow externally available?

**Interviewer:** No. Customers invoke registered, tenant-approved workflow versions.

**Candidate:** Is SSE or WebSocket required?

**Interviewer:** Choose and justify; one-way server events are sufficient for many text runs.

**Candidate:** How long are idempotency records retained?

**Interviewer:** Define retention from maximum retry and business-risk windows.

## 6. What the Interviewer Is Evaluating

- External API and execution-mode design
- Authentication, authorization, tenancy, and quotas
- Idempotency, streaming, cancellation, and compatibility
- Error, audit, and operational judgment

## 7. Likely Interviewer Follow-Ups

- How do reconnecting streams avoid missing or duplicating events?
- What belongs in API gateway versus application service?
- How would you evolve tool-result schemas?
- What happens during regional failure?

## 8. Architecture Change Requests

1. One customer requires private networking and customer-managed keys.
2. Traffic grows 20x while model quota remains fixed.
3. A new API version changes streaming event shapes without breaking old clients.

## 9. Concept Questions and Interview Answers

### When should an agent API be asynchronous?

**Interview answer:**

> When work exceeds a reliable request lifetime, waits on approvals, or needs durable retries. The API should return a resource immediately and expose progress rather than hold one connection as the source of truth.

### Why scope idempotency keys?

**Interview answer:**

> The same text key can be reused by different tenants or operations. Scope prevents collisions, result leakage, and accidental suppression of unrelated work.

## 10. Production Discussion

Discuss gateway, identity integration, submission service, durable jobs, event store, stream fan-out, idempotency store, quotas, regional routing, compatibility, and SDKs. Monitor admission, latency, stream drops, reconnects, job age, cancellations, quota denials, and outcomes.

## 11. Security / Safety Angle

Use least privilege, tenant-scoped resource IDs, object-level authorization, payload limits, allowlisted workflows, safe error redaction, abuse controls, and audited service accounts. API validity never authorizes a model-proposed tool action by itself.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| API and lifecycle design | /5 |
| Reliability and streaming | /5 |
| Scale and compatibility | /5 |
| Security and tenancy | /5 |
