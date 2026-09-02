# Enterprise Event Intake

## 1. Interview Prompt

Design a multi-tenant intake platform that receives high-volume events from webhooks, queues, file drops, and scheduled imports, normalizes them, and routes them to approved agent workflows.

Focus on authenticity, normalization, delivery semantics, ordering, backpressure, and replay. Downstream agent implementation is out of scope.

## 2. Requirements

- Authenticate each source using its appropriate mechanism before trusting tenant or event fields.
- Preserve raw immutable evidence under governed retention and create a versioned canonical envelope.
- Validate schemas, quarantine malformed events, and support schema evolution.
- Deduplicate redelivery while distinguishing genuinely related events.
- Preserve per-source or per-entity ordering where required without imposing global order.
- Route by trusted tenant, event type, policy, and workflow version.
- Buffer bursts, enforce tenant fairness, and apply backpressure or admission limits.
- Support retry, dead-letter, replay, and reconciliation without duplicating downstream effects.
- Expose lineage, freshness, lag, and audit metadata.
- Prevent untrusted event content from granting agent authority.

## 3. Initial System Context

The platform receives 50,000 events per second normally and 10x bursts. Sources include signed webhooks, customer topics, hourly CSV files, and nightly exports. Some sources provide stable IDs and sequence numbers; others do not. Payloads may contain PII or adversarial text.

## 4. Example Input / Output

```text
source webhook event e-7 -> authenticated -> canonical incident.created v3
duplicate e-7            -> recorded duplicate, not routed twice
entity sequence 14 before 13 -> buffer or mark gap under source policy
malformed CSV row        -> quarantined with lineage, not silently dropped
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is ordering required across all tenants and event types?

**Interviewer:** No. Define it per source or aggregate only where business behavior needs it.

**Candidate:** Must raw payloads remain in the streaming broker?

**Interviewer:** No. Large or sensitive raw artifacts may live in governed object storage with references.

**Candidate:** What latency is expected?

**Interviewer:** Webhook and queue events target seconds; batch sources retain their natural freshness limits.

## 6. What the Interviewer Is Evaluating

- Hybrid event and batch intake architecture
- Authenticity, schema, deduplication, and ordering judgment
- Backpressure, fairness, replay, and failure handling
- Tenant isolation and safe agent routing

## 7. Likely Interviewer Follow-Ups

- How do you deduplicate sources without stable event IDs?
- What happens when a schema rollout and replay overlap?
- How do you prevent poison events from blocking a partition?
- Where should routing policy be evaluated?

## 8. Architecture Change Requests

1. One tenant sends a 20x backlog after reconnecting.
2. A source emits corrections that refer to earlier events.
3. A regulated tenant requires region-local raw storage and customer-managed keys.

## 9. Concept Questions and Interview Answers

### Why separate raw and canonical events?

**Interview answer:**

> Raw evidence supports audit and reprocessing, while a canonical envelope gives downstream systems a stable contract. Versioned lineage connects them without making every consumer understand each source.

### Why is replay dangerous?

**Interview answer:**

> Replay intentionally redelivers old input, so downstream actions can repeat unless operation IDs, idempotency, workflow versions, and replay scope are controlled.

## 10. Production Discussion

Discuss source gateways, schema registry, immutable artifact storage, partitioned broker, normalization workers, inbox/dedup store, routing service, quarantine, replay control, and reconciliation. Monitor ingest rate, authentication failures, lag, duplicates, sequence gaps, quarantine age, retries, and tenant fairness.

## 11. Security / Safety Angle

Use source-scoped credentials, signature verification, file scanning, payload limits, encryption, tenant-bound routing, and least-privilege workflow identities. Event content is data, never authorization or instruction.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Intake and normalization design | /5 |
| Delivery, ordering, and replay | /5 |
| Scale and operations | /5 |
| Security and tenancy | /5 |
