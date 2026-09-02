# Multiformat Ingestion Platform

## 1. Interview Prompt

Design a multi-tenant ingestion platform that turns PDFs, office documents, images, and plain text into searchable content for enterprise AI applications. It must handle large files, partial failures, reprocessing, and source updates without losing lineage.

Focus on ingestion through index publication. Query-time answer generation is out of scope.

## 2. Requirements

- Accept uploads and source-connector events with authenticated tenant and document identity.
- Virus-scan and validate content before parsing it.
- Select format-specific parsing and OCR while preserving useful structure, page references, and metadata.
- Split work into retryable stages without publishing partial documents as complete.
- Deduplicate repeated events and handle a newer document version arriving while an older one is processing.
- Record lineage from source version through parser, OCR, chunker, embedding model, and index version.
- Support replay from an appropriate stage after code or model changes.
- Enforce tenant and source permissions in stored metadata before content becomes searchable.
- Expose status and actionable failure information without leaking document contents.

## 3. Initial System Context

Customers ingest files from direct upload and content repositories. Most documents are under 20 MB, but some scanned PDFs reach 500 MB and thousands of pages. Daily volume is 500,000 documents with bursty repository syncs. OCR is slow and expensive, parsing libraries are occasionally unstable, and source documents may be edited or deleted.

## 4. Example Input / Output

```text
Source event: tenant=acme, document=policy-17, source_version=8

Stages:
received -> scanned -> parsed -> normalized -> chunked -> embedded -> published

Published manifest:
document=policy-17
source_version=8
parser_version=parser-pdf-5
chunker_version=chunk-3
embedding_version=embed-7
chunk_count=142
```

A retry of the same source version must not create a second active document. Version 9 must never be overwritten by late completion of version 8.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** How quickly must new content become searchable?

**Interviewer:** Target 15 minutes for typical documents; large OCR jobs may take longer and should report progress.

**Candidate:** Can users search successfully processed pages while the rest fail?

**Interviewer:** Not initially. Publish a source version atomically as a complete manifest.

**Candidate:** Must deletes propagate?

**Interviewer:** Yes. A source deletion should make content unavailable promptly and trigger eventual physical cleanup according to retention policy.

**Candidate:** Should every reprocessing request rerun OCR?

**Interviewer:** No. Preserve immutable stage outputs so compatible downstream stages can be replayed.

## 6. What the Interviewer Is Evaluating

- Stage boundaries, queues, and backpressure
- Idempotency, ordering, lineage, and atomic publication
- Practical document/OCR/chunking tradeoffs
- Tenant isolation, operations, and cost awareness

## 7. Likely Interviewer Follow-Ups

- How do you prevent large OCR jobs from starving ordinary documents?
- Where do immutable artifacts, metadata, and active-index pointers live?
- How do permission changes take effect before expensive reprocessing completes?
- How would you diagnose a retrieval regression caused by one parser release?

## 8. Architecture Change Requests

1. Traffic grows 20x during customer-wide repository onboarding.
2. A new embedding model requires backfilling all content without downtime or mixed-index surprises.
3. A source connector emits duplicate, missing, and out-of-order update events.

## 9. Concept Questions and Interview Answers

### Why keep lineage for every published chunk?

**Interview answer:**

> Lineage lets me explain where a chunk came from, reproduce defects, target reprocessing, and compare parser or embedding versions. Without it, a bad rollout becomes a full blind rebuild.

### How can publication be atomic if indexing is distributed?

**Interview answer:**

> I can write versioned chunks under an unpublished manifest, verify completeness, then atomically switch an active pointer or filter to the completed version. Old data is cleaned up later.

## 10. Production Discussion

Discuss object storage for immutable artifacts, metadata and state transitions in a transactional store, stage queues with retry and dead-letter policy, resource-class scheduling, checksums, leases, idempotency keys, version fencing, and reconciliation. Monitor age by stage, throughput, retries, poison documents, OCR cost, parser quality, index lag, and deletion lag.

## 11. Security / Safety Angle

Scan files in isolated workers with bounded resources, treat document text and metadata as untrusted, encrypt artifacts, and keep tenant-scoped identities on every job. Apply retrieval permissions before publication, process deletes and revocations promptly, and prevent raw document content from entering routine logs or dead-letter payloads.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Pipeline and state architecture | /5 |
| Versioning, lineage, and correctness | /5 |
| Scale and failure handling | /5 |
| Security and operational awareness | /5 |
