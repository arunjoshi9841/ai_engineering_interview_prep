# Document Chunking Review

## 1. Interview Prompt

Review the chunking function and rollout results below for an enterprise RAG pipeline. Identify correctness and retrieval-quality risks, then propose a bounded first improvement and evaluation plan for structured, scanned, and frequently edited documents.

Do not implement a full parser or embedding pipeline.

## 2. Requirements

Your review should address:

- Lost headings, tables, page references, and document hierarchy.
- Character slicing across sentences and OCR artifacts.
- Overlap, duplicate retrieval, context budget, and citation precision.
- Stable chunk identity across small document edits.
- Format-specific strategies without one giant custom parser.
- Evaluation by document/query cohort rather than subjective inspection.
- Security metadata and lineage propagation to every chunk.

## 3. Provided Code and Evidence

```python
def chunk(text: str, document_id: str) -> list[dict]:
    size = 1200
    overlap = 400
    chunks = []
    for start in range(0, len(text), size - overlap):
        chunks.append({
            "id": f"{document_id}:{start}",
            "text": text[start:start + size],
        })
    return chunks
```

```text
cohort                 Recall@5   citation correction rate
plain text policies       .82              6%
tables                    .48             31%
scanned PDFs              .39             37%
frequently edited docs    .71             22%
duplicate chunks in top5  28%
```

## 4. Example Review Outcome

A strong review should distinguish parsing defects from chunk-boundary choices, retain page/section/table lineage, and recommend a small format-aware strategy plus an offline comparison. It should not claim one universal token size is optimal.

## 5. What the Interviewer Is Evaluating

- Practical chunking and document-structure judgment
- Separation of parsing, normalization, and chunking
- Evaluation and incremental-index reasoning
- Citation, metadata, and security awareness

## 6. Concept Questions and Interview Answers

### Why is chunk size not only a retrieval setting?

**Interview answer:**

> It affects embedding meaning, candidate recall, reranking, citation precision, context cost, and how much unrelated text reaches the model. The right choice depends on document structure and query types.

### Why can large overlap hurt?

**Interview answer:**

> It may preserve boundary context, but it increases storage and embedding cost and can fill top results with near-duplicates instead of diverse evidence.
