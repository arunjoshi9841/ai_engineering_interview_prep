# End-to-End Agent Audit Trail

## 1. Interview Prompt

Design an audit-trail platform that can reconstruct why a consequential agent workflow reached an outcome. It must connect the initiating identity, workflow and policy versions, model calls, retrieved evidence, tool decisions, approvals, errors, and final result across asynchronous services.

Focus on durable audit evidence and investigation queries. Do not design a general-purpose log aggregation product or a feature that replays side effects automatically.

## 2. Requirements

- Assign stable workflow, step, attempt, and operation identifiers across services and retries.
- Record request origin, authenticated actor, authorization decision, workflow version, prompt/model/schema versions, evidence references, tool proposals and decisions, approvals, errors, and outcome.
- Preserve event time, ingestion time, producer identity, ordering information, and schema version.
- Make records append-only to ordinary application actors and detect tampering or deletion.
- Support asynchronous and out-of-order events without inventing a false total order.
- Keep large or sensitive payloads out of the primary audit event while retaining governed references when necessary.
- Enforce tenant isolation, field-level access, retention, legal hold, and deletion policy.
- Provide timely investigation queries and export without weakening the write path.
- Distinguish audit evidence from operational logs, traces, and editable business state.
- Reconstruct what happened without executing the workflow again.

## 3. Initial System Context

The platform starts 10,000 workflows per minute across regions. A workflow may last seconds or days and cross APIs, queues, model providers, retrieval services, tool gateways, and human approval systems. Producers can retry, events may arrive late, and clocks differ. Security investigators need recent workflows within minutes; compliance exports may span years.

## 4. Example Input / Output

```text
Investigation: Why was account A-17 suspended?

Reconstructed evidence:
  actor and originating request
  workflow definition v12 and policy v31
  retrieved evidence references and access decision
  model/prompt/schema versions and proposed action
  tool validation and authorization result
  approval record bound to the action
  two execution attempts sharing one operation ID
  confirmed external outcome
```

The view must show that a queue redelivery caused a second attempt but not a second suspension. Missing events or unverifiable integrity must be visible rather than silently filled in.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Must prompts, retrieved documents, and tool payloads be stored in full?

**Interviewer:** No. Prefer hashes, immutable version references, and selectively governed payload storage according to investigation and retention needs.

**Candidate:** Is strict global ordering required?

**Interviewer:** No. Preserve causality and per-entity sequence where available; show uncertainty across independent producers.

**Candidate:** Who may query the trail?

**Interviewer:** Tenant investigators see their authorized scope; platform security and compliance roles have separately controlled, audited access.

**Candidate:** Can an operator correct an inaccurate event?

**Interviewer:** Append a correction or annotation; do not rewrite the original evidence.

## 6. What the Interviewer Is Evaluating

- Audit event model, identity, and causality design
- Integrity, privacy, retention, and access-control tradeoffs
- Scalable write and investigation-query architecture
- Clear separation of audit, tracing, and workflow state

## 7. Likely Interviewer Follow-Ups

- How would you prove that an event came from an authorized producer?
- What happens when a producer succeeds but cannot publish its audit event?
- How would schema evolution preserve old investigations?
- Which fields belong in a hot index versus lower-cost immutable storage?

## 8. Architecture Change Requests

1. A regulated customer requires region-local storage and customer-managed encryption keys.
2. Legal hold conflicts with a routine tenant deletion request.
3. An incident suggests a privileged operator attempted to remove audit evidence.

## 9. Concept Questions and Interview Answers

### How is an audit trail different from distributed tracing?

**Interview answer:**

> Tracing is optimized for operational performance and may be sampled or short-lived. Audit evidence records security- and business-relevant decisions with stronger integrity, retention, access, and completeness requirements. They can share correlation IDs but are not interchangeable.

### What does tamper-evident mean?

**Interview answer:**

> It means unauthorized modification or removal can be detected, for example through append-only permissions, immutable storage, signed producer events, and chained or independently anchored digests. It does not mean every reader can see sensitive payloads.

## 10. Production Discussion

Discuss a versioned event envelope, producer authentication, outbox publication, durable partitioned ingestion, immutable object storage, integrity manifests, a tenant-aware hot query index, retention tiers, legal holds, correction events, and completeness reconciliation. Monitor producer gaps, sequence discontinuities, late events, failed verification, query access, export jobs, and retention execution.

## 11. Security / Safety Angle

Audit access is itself a privileged action and must be logged. Encrypt data, isolate tenant keys where required, minimize payloads, prevent prompt or document text from entering broad indexes, and separate duties for producers, investigators, retention administrators, and integrity verifiers.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Event, identity, and causality model | /5 |
| Integrity and privacy design | /5 |
| Scale and query architecture | /5 |
| Operational and compliance reasoning | /5 |
