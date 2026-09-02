# Embedding Migration Worker

## 1. Interview Prompt

A retrieval service is migrating from embedding version `v1` to `v2`. Implement a TypeScript worker function that safely backfills one batch into a shadow index while both versions remain available.

Do not switch production traffic or delete `v1`. Focus on idempotent batch processing and version lineage.

## 2. Requirements

- Claim a bounded batch of current chunks that need `v2` embeddings.
- Skip a chunk only when the shadow index already contains the same chunk ID, content digest, and embedding version.
- Generate embeddings in bounded batches through the injected provider.
- Verify returned vector count and configured dimension before writing.
- Write tenant, document, chunk, content digest, source revision, and embedding version with each vector.
- Never overwrite a newer source revision with an older claimed chunk.
- Mark progress only after shadow-index acknowledgement.
- Classify malformed output separately from transient provider failure.
- Cancellation stops new work but does not delete acknowledged vectors.

## 3. Example Input / Output

```text
chunk c1 same digest already at v2 -> skipped
chunk c2 embeds to expected dimension -> written, complete
chunk c3 changed after claim -> writeShadow returns stale; not marked complete
provider returns wrong vector count -> batch failure; no mismatched writes
```

## 4. What the Interviewer Is Evaluating

- Version coexistence and idempotent backfill
- Vector-output validation and stale-write fencing
- Partial failure and cancellation
- Separation of migration from activation

## 5. Concept Questions and Interview Answers

### Why bind an embedding to the content digest?

**Interview answer:**

> Version alone does not prove the vector represents current text. The digest prevents a stale embedding from being treated as complete after the chunk changes.

### Why keep the old index during migration?

**Interview answer:**

> Version coexistence supports uninterrupted serving, quality comparison, gradual cutover, and fast rollback if the new representation regresses.
