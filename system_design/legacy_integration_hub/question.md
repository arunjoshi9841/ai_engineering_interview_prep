# Legacy Integration Hub

## 1. Interview Prompt

Design an integration hub that gives enterprise agent workflows a consistent way to read and request changes across customer systems that expose a mixture of REST APIs, nightly files, webhooks, and scheduled exports.

Focus on integration boundaries, state synchronization, and failure handling. The hub must not replace every source system or let models call legacy interfaces directly.

## 2. Requirements

- Expose versioned, application-owned commands and queries rather than raw legacy schemas.
- Isolate authentication, transport, schema mapping, and source-specific quirks in connectors.
- Support synchronous reads, asynchronous commands, inbound webhooks, and batch imports.
- Define the authoritative source and freshness semantics for each normalized field.
- Deduplicate redeliveries and prevent late files or events from overwriting newer known state.
- Represent accepted, completed, failed, and indeterminate commands explicitly.
- Reconcile hub state with systems that provide no reliable callbacks.
- Apply tenant, workflow, and action authorization outside models.
- Preserve lineage and audit records without copying unrestricted customer data into logs.
- Allow connector versions and mappings to roll out and roll back independently.

## 3. Initial System Context

An initial customer has twelve systems. Four have modern APIs, three publish webhooks, two accept only file drops, and three expose scheduled exports. Identifiers and status values conflict, rate limits vary, and some write APIs return a timeout after accepting work. The hub serves interactive lookups and long-running agent workflows across several tenants.

Interactive queries target a 2-second p95 when a current source is reachable. Batch sources may be 24 hours old, but callers must be told the observed freshness.

## 4. Example Input / Output

```text
Normalized command:
  suspend_account(tenant=acme, account=A-17, operation=op-93)

Legacy system response:
  request timed out after submission

Hub outcome:
  status=indeterminate
  source_reference=req-882 (if available)
  next_step=reconcile
```

A nightly file dated Tuesday must not overwrite a Wednesday status already confirmed through an API. A repeated webhook must not trigger the same normalized workflow twice.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is the hub itself the source of truth?

**Interviewer:** No. It owns normalized integration state and operation records; each field's authoritative business source remains explicit.

**Candidate:** Must every command complete synchronously?

**Interviewer:** No. Return an operation resource for asynchronous or uncertain integrations.

**Candidate:** Can connectors share customer credentials?

**Interviewer:** Credentials are tenant- and connector-scoped and managed outside agent context.

**Candidate:** How much stale data may interactive callers receive?

**Interviewer:** Freshness policy varies by field and workflow risk; the response must include observed source time and staleness.

## 6. What the Interviewer Is Evaluating

- Anti-corruption boundaries and normalized contracts
- Hybrid synchronous, event, and batch architecture
- Ordering, idempotency, reconciliation, and source-of-truth reasoning
- Connector operations, tenancy, and gradual migration judgment

## 7. Likely Interviewer Follow-Ups

- How do you correlate the same customer entity across inconsistent identifiers?
- What prevents one degraded connector from blocking unrelated systems?
- Where do canonical records, raw artifacts, operation state, and lineage live?
- How would you onboard a new connector without changing every workflow?

## 8. Architecture Change Requests

1. A critical source loses its API and can provide only a daily export for three months.
2. A customer wants to migrate gradually from a legacy system while both old and new sources are active.
3. Traffic grows 20x and one tenant's reconciliation backlog threatens shared workers.

## 9. Concept Questions and Interview Answers

### How do you avoid creating a new integration monolith?

**Interview answer:**

> I would keep a small versioned platform contract and isolate source behavior in independently deployable or at least independently owned connectors. Shared policy, observability, and operation state are centralized only where consistency benefits justify it.

### Why is “accepted” different from “completed”?

**Interview answer:**

> A legacy system may acknowledge receipt before applying the business change. Treating acceptance as completion hides uncertainty and makes retries unsafe, so I record both states and reconcile final outcome.

## 10. Production Discussion

Discuss connector queues and bulkheads, canonical metadata in a transactional store, raw batch artifacts in object storage, schema registries, operation state machines, outbox/inbox records, version fencing, reconciliation schedules, contract fixtures, and replay tooling. Monitor freshness, backlog age, mapping failures, duplicates, indeterminate operations, rate limits, and source drift per bounded tenant tier and connector.

## 11. Security / Safety Angle

Use least-privilege connector identities, per-tenant secret isolation, allowlisted endpoints, signed inbound events, file scanning, and strict schema validation. Commands need fresh authorization and risk policy even if the model produced a valid normalized request. Audit operator replays and redact raw source data.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Integration boundaries and contracts | /5 |
| Consistency and failure handling | /5 |
| Scale and operations | /5 |
| Security and tenant isolation | /5 |
