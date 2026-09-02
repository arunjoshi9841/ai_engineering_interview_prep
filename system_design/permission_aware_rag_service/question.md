# Permission-Aware RAG Service

## 1. Interview Prompt

Design a retrieval-augmented service that answers employee questions from enterprise policies and operational documents. Answers must cite the evidence used, respect each requester's permissions, and remain trustworthy as source documents change.

## 2. Requirements

- Ingest documents with source identity, version, ownership, classification, and access metadata.
- Retrieve only evidence the requester is allowed to see before it reaches the model.
- Return a grounded answer with citations or say that available evidence is insufficient.
- Support updates, deletes, and index-repair work without silently serving known-invalid content.
- Measure retrieval and answer quality separately.

## 3. Initial System Context

Documents come from internal policy repositories and operational systems. They contain exact identifiers as well as natural-language guidance, and permissions can vary by tenant, role, group, use case, and document version. Indexing can be asynchronous; the source system remains authoritative.

## 4. Example Input / Output

**Input:** A requester asks for an expense-policy exception. A newer policy version is available, but its search index has not completed updating.

**Outcome:** The service either uses authorized, current evidence with citations or communicates an appropriate inability or freshness limitation; it must not expose an unauthorized older document to the model.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is response freshness more important than immediate availability during reindexing?

**Interviewer:** It depends on the policy class. High-impact policies should favor correctness and clearly surfaced freshness state.

**Candidate:** Can document access change independently of document content?

**Interviewer:** Yes. Permission changes must take effect promptly.

**Candidate:** Are users asking only natural-language questions?

**Interviewer:** No. They may include policy numbers, account codes, or other exact terms.

## 6. What the Interviewer Is Evaluating

- Ingestion, retrieval, source-of-truth, and freshness design
- Authorization enforced at retrieval time
- Appropriate use of lexical and semantic retrieval
- Grounding, citations, evaluation, and failure handling

## 7. Likely Interviewer Follow-Ups

- Where is authorization enforced, and why is post-retrieval filtering insufficient?
- How would you handle a deletion or group-membership revocation while indexes are eventually consistent?
- How would you detect whether failures come from retrieval, context assembly, or generation?
- When would a deterministic lookup be preferable to vector search?

## 8. Architecture Change Requests

1. A tenant requires a dedicated index and customer-managed encryption keys.
2. The corpus expands to include scanned PDFs and images with OCR confidence metadata.
3. A policy update must be visible within a short, defined window, including removal of superseded citations.

## 9. Concept Questions and Interview Answers

### Why should authorization happen before model context assembly?

**Interview answer:**

> Once unauthorized text enters the model context, the exposure has already occurred even if we hide it from the final answer. I would use the requester and policy context to constrain candidate retrieval and verify access again at the serving boundary.

### Why measure retrieval quality separately from answer quality?

**Interview answer:**

> A poor answer can come from missing evidence, weak ranking, bad context assembly, or generation. Separate measures tell us which layer to improve and prevent prompt changes from masking an indexing problem.

## 10. Production Discussion

Discuss document lineage, idempotent ingestion and reindexing, ACL-change propagation, version-aware citations, fallback behavior during index lag, caching limits, evaluation sets, and telemetry for retrieval, permission denials, groundedness, latency, and correction feedback.

## 11. Security / Safety Angle

How would you treat instructions embedded in retrieved documents, prevent cross-tenant leakage through logs or caches, and ensure citations do not reveal restricted document names or metadata?

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Retrieval and freshness design | /5 |
| Authorization and tenant isolation | /5 |
| Evaluation and observability | /5 |
| Tradeoff reasoning | /5 |
