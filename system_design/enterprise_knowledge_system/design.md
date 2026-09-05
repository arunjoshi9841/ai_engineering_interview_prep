# Building an Enterprise Knowledge System

An enterprise knowledge system helps someone ask a question about company documents and receive an answer backed by the right evidence. It is often described as “RAG,” short for retrieval-augmented generation, but retrieval is only one stage. Before a model can answer safely, the system must ingest documents, understand their permissions, keep them current, find the best evidence, and show the reader where that evidence came from.

## 1. Accept documents without making uploads the bottleneck

The product API should create a document record first: tenant, source system, document ID, version, owner, classification, ACLs, and status. For a browser upload, return a **presigned URL**: a short-lived URL that lets the client upload directly to object storage without giving it storage credentials. The API servers avoid carrying large PDFs themselves, and the original file is kept as immutable evidence.

An upload does not immediately become searchable. It creates an asynchronous ingestion job. This protects the user-facing API from slow scans and lets the platform limit heavy work such as OCR.

```text
upload → security scan → parse → OCR if needed → normalize → chunk
       → embed → index → verify → publish
```

The file is scanned before untrusted parsers handle it. Parsing extracts text, headings, tables, page numbers, and metadata from formats such as PDF and Office documents. **OCR** (optical character recognition) turns images or scanned pages into text. Record OCR confidence; text inferred from a blurry image should not be treated the same way as source text.

Normalization creates a stable internal representation. It should preserve structure and source locations, because a user needs a citation like “page 8, Benefits section,” not an opaque blob of words.

## 2. Break documents into useful evidence

Models have limited context windows and search works better over focused passages, so split normalized documents into **chunks**. A chunk is a small passage with metadata: document and source version, title, page or section, tenant, classification, and permissions. Do not split only by a fixed character count; prefer headings, paragraphs, tables, and semantic boundaries, while allowing small overlaps when a sentence spans a boundary.

Turn each chunk into an **embedding**, a numerical representation intended to place semantically similar text near each other. Store the embedding model and chunking version with the chunk. If either changes, the old and new embeddings are not interchangeable.

The system normally creates two kinds of index:

- A lexical index uses terms and frequencies. **BM25** is a common scoring method that works especially well for exact names, policy codes, error strings, and numbers.
- A vector index finds embeddings that are close in vector space, helping with natural-language paraphrases.

Vector search is usually approximate for speed. **HNSW** organizes vectors as a navigable graph; it is fast to query but can consume memory. **IVF** groups vectors into clusters and searches only the closest groups; it can be cheaper at large scale but needs tuning. Neither should be chosen because of its acronym. Measure recall, latency, cost, and update behavior with real documents.

## 3. Retrieve before generating

At query time, authenticate the user and obtain trusted tenant, group, role, region, and use-case context. The retrieval service first applies **metadata filters**: tenant, document type, date, classification, and most importantly the user’s permitted ACL scope. Apply these filters inside retrieval. Checking the answer afterward is too late because restricted text may already have reached the model.

Search both lexical and vector indexes, then combine the candidates in **hybrid search**. A **reranker**—a more precise, usually more expensive model—can inspect the top candidates and reorder them based on the full question. A separate query transformation step can rewrite a vague question, expand abbreviations, or split a complex question into subqueries, but it must keep the user’s filters and should never invent a broader permission scope.

**Context assembly** chooses the small set of passages sent to the answering model. It should balance relevance, diversity, and token budget; five near-duplicates add little value. Every selected passage carries a provenance record: source document, version, page or section, extraction method, and retrieval score. The model is instructed to answer from this evidence and to say when it is insufficient or contradictory.

## 4. Treat change as normal

A document edit is a new source version, not an in-place mystery. The ingestion pipeline records that version and prevents a late job for version 8 from publishing over version 9. Indexes and embeddings are derived data: build a new index version in parallel, validate it, then atomically move an active pointer from the old complete version to the new one.

That process creates **eventual consistency**: for a short time, the source may be newer than search. The product should know the index freshness. For high-impact content such as benefits, legal, or security policy, either warn about staleness or query the source of truth rather than silently answer from an old index.

Permission revocation and deletion need a faster path than normal reindexing. Remove the document from active retrieval and invalidate permission-aware caches promptly; physical cleanup can proceed according to retention policy. Cache keys must include tenant and authorization scope, or the cache becomes a data-leak mechanism.

## 5. Evaluate the whole evidence chain

When an answer is poor, distinguish retrieval failure from generation failure. Evaluate whether the correct chunk was present (**recall**), whether top results were well ordered, whether any unauthorized result was returned, and how fresh the index was. Then evaluate answer groundedness, citation correctness, completeness, and user corrections.

An excellent prose answer with a wrong or missing citation is not a successful knowledge system. The end goal is not merely fluent text; it is a defensible answer that tells the user what evidence it used, what it cannot establish, and whether the information is current.
