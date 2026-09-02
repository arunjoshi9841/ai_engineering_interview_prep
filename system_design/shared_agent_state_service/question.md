# Shared Agent State Service

## 1. Interview Prompt

Design a shared state service for several agents collaborating on one enterprise workflow. The service must hold durable task state, evidence references, claims, approvals, and ownership without turning an unbounded conversation transcript into the source of truth.

Focus on state boundaries, concurrency, retention, and access control. Model prompting and workflow scheduling are outside the core design.

## 2. Requirements

- Separate deterministic workflow state from working context, semantic references, episodic records, and audit history.
- Use typed, versioned records rather than one mutable text blob.
- Namespace every record by tenant, workflow, and state category.
- Support conditional updates so concurrent agents cannot silently overwrite each other.
- Preserve provenance, producer, timestamps, revision, and sensitivity metadata.
- Allow append-only claims/evidence and controlled updates to owned task records.
- Enforce agent capability and user-derived permissions for reads and writes.
- Support TTL, retention, legal hold, deletion, and compaction by state type.
- Prevent stale or poisoned memory from silently becoming trusted fact.
- Provide bounded query APIs and change notifications.

## 3. Initial System Context

A supervisor and four specialists may operate concurrently. Workflows last minutes to weeks, and agents restart or change model versions. Some evidence is tenant-confidential, approvals are short-lived, and source permissions can be revoked. The service handles 20,000 state operations per second across tenants.

## 4. Example Input / Output

```text
agent A appends claim c-7 with evidence e-2 at revision 14
agent B conditionally assigns task t-3 using expected revision 14
agent C writes from stale revision 13 -> conflict, not silent overwrite

retrieved memory includes provenance and freshness; it does not grant tool permission
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is strong consistency required for all memory?

**Interviewer:** Require it for task ownership, approvals, and workflow transitions; some derived semantic indexes may be eventually consistent.

**Candidate:** May agents edit another agent's claims?

**Interviewer:** Prefer append-only correction or supersession with provenance rather than destructive rewriting.

**Candidate:** Is chat history stored here?

**Interviewer:** It may be referenced as bounded conversation context, but it is not the authoritative workflow record.

## 6. What the Interviewer Is Evaluating

- State taxonomy and source-of-truth boundaries
- Concurrency, ownership, and consistency choices
- Memory provenance, poisoning, and freshness reasoning
- Tenant isolation, lifecycle, and query design

## 7. Likely Interviewer Follow-Ups

- Which records belong in SQL, object storage, or a vector index?
- How should conflicting agent claims be represented?
- How do permission revocations affect cached or indexed memory?
- What prevents high-cardinality state from growing forever?

## 8. Architecture Change Requests

1. Two regions must continue independent read-only investigation during a partition.
2. A customer requires immediate deletion from active memory but seven-year audit retention.
3. Agents need semantic recall across prior workflows without cross-user leakage.

## 9. Concept Questions and Interview Answers

### Why separate workflow state from model context?

**Interview answer:**

> Context is bounded, probabilistic, and rebuilt over time. Business transitions, ownership, and approvals need typed durable records with concurrency control and auditability.

### How is provenance used against memory poisoning?

**Interview answer:**

> Provenance identifies who or what produced a claim, from which source and version, and under what permissions. It supports trust policy and correction, though it does not make untrusted content true by itself.

## 10. Production Discussion

Discuss a transactional metadata store, immutable artifact storage, authorization-aware semantic indexes, revisioned APIs, change streams, cache invalidation, schema migration, tombstones, compaction, and quotas. Monitor conflicts, stale reads, denied access, index lag, growth, and orphaned state.

## 11. Security / Safety Angle

Derive access from trusted tenant and user/workflow context, encrypt sensitive state, propagate revocations, and prevent agents from changing their own permissions or approval records. Treat all retrieved memory as data and audit privileged reads and corrections.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| State taxonomy and APIs | /5 |
| Concurrency and consistency | /5 |
| Memory lifecycle and provenance | /5 |
| Security and tenant isolation | /5 |
