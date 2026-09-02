# Reindex Event Coalescer

## 1. Interview Prompt

A content source emits rapid, duplicate, and out-of-order document-change events. Implement a TypeScript function that reduces one polled batch to the minimum safe set of reindex operations.

Do not call the indexer or persist debounce state. Focus on deterministic batch coalescing.

## 2. Requirements

- Each event is scoped by tenant and document and carries a positive, monotonically increasing source revision.
- Event kinds are `upsert` and `delete`.
- Keep only the highest revision for each tenant/document pair.
- Exact duplicates collapse to one operation.
- Two events with the same key and revision but different kinds are a conflict and invalidate the batch.
- Never combine documents across tenants.
- Return operations sorted by tenant ID then document ID.
- Reject invalid IDs or revisions without returning a partial result.
- Do not assume batch arrival order is source order.

## 3. Example Input / Output

```text
acme/doc1 upsert r4, acme/doc1 upsert r6 -> upsert r6
acme/doc2 upsert r8, acme/doc2 delete r9 -> delete r9
same key/revision upsert and delete       -> conflicting_revision
```

## 4. What the Interviewer Is Evaluating

- Composite-key and version reasoning
- Deterministic conflict and ordering behavior
- Efficient map-based reduction
- Delete and tenant-boundary correctness

## 5. Concept Questions and Interview Answers

### Why must revision beat arrival order?

**Interview answer:**

> Queues and workers can reorder delivery. A source-owned monotonic revision represents document history more reliably than when the event reached this process.

### Why is delete not always dominant?

**Interview answer:**

> A later source revision may recreate the document. Making delete permanently dominant would incorrectly discard a valid newer upsert.
