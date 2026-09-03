# Permission-Aware RAG Context

## 1. Interview Prompt

Implement the context-building boundary for an enterprise assistant that answers questions about internal policies. The assistant must retrieve only chunks the current caller is authorized to see, then return a compact context with source references for the model.

Assume an existing retrieval backend. Your task is to construct the correct authorization-aware query and context result; do not implement embeddings, indexing, or a model call.

## 2. Requirements

- Every request includes a trusted tenant ID, user ID, and role set.
- A chunk is eligible only when its tenant and allowed roles match the caller's access context.
- Authorization constraints must be passed to retrieval before candidate chunks are returned; filtering after retrieval is not sufficient.
- Return at most `limit` eligible chunks with a stable source ID and title for citation.
- If no authorized context exists, return an empty context rather than a broad fallback search.
- Do not include raw access-control metadata in model-facing context.

## 3. Example Input / Output

```text
Subject: tenant=acme, roles=["claims_analyst"]
Query: "When is a claim escalated?"

Retrieved eligible chunk: id=policy-18#4, title="Claims Escalation", text="..."
Returned context: [{ sourceId: "policy-18#4", title: "Claims Escalation", text: "..." }]

No eligible chunks: []
```

## 4. What the Interviewer Is Evaluating

- RAG boundary design and authorization ordering
- Data structures that keep trusted policy context separate from model input
- Safe empty-result behavior and citation provenance
- Awareness of multi-tenant data exposure risks

## 5. Concept Questions and Interview Answers

### Why is post-retrieval filtering unsafe for RAG?

**Interview answer:**

> If unauthorized chunks are retrieved into the application or prompt-building path, they may already be exposed through logs, metrics, or model context. The access constraint belongs in the retrieval query and underlying index boundary.

### Why return source identifiers with context?

**Interview answer:**

> Provenance lets the product cite evidence, investigate a bad answer, and re-check whether the source was current and authorized at the time of retrieval.
