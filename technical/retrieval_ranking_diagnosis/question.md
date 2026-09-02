# Retrieval Ranking Diagnosis

## 1. Interview Prompt

After a hybrid-search rollout, an enterprise assistant still answers ordinary policy questions well but often misses documents when users enter exact policy IDs or product codes. Diagnose the evidence below, identify the most likely failing stage, and propose the smallest experiments that would confirm or reject your hypotheses.

Do not redesign the whole RAG system. Focus on candidate generation, score fusion, and reranking.

## 2. Requirements

Your investigation should:

- Separate ingestion, lexical retrieval, vector retrieval, fusion, reranking, and generation as possible failure stages.
- Use the supplied measurements rather than assuming the model is hallucinating.
- Identify missing telemetry needed to follow one query through the pipeline.
- Propose controlled offline experiments and a safe rollback or mitigation.
- Define success metrics for exact-identifier and semantic-query cohorts separately.
- Consider tenant filters and document versions before changing ranking weights.
- Avoid using production answer clicks as the only relevance label.

## 3. Provided Diagnostic Context

The pipeline retrieves 40 lexical and 40 vector candidates, fuses them into 20 candidates, then reranks those 20 and sends the top 5 to the model.

```text
Offline cohort                  Before rollout   After rollout
exact identifier Recall@5           0.92             0.41
semantic question Recall@5           0.79             0.80
reranker NDCG@5 on its input         0.84             0.85
relevant doc absent at reranker      0.07             0.54   (exact-ID cohort)
answer groundedness                  0.88             0.87
```

For query `POL-1047`, lexical rank 1 is the authorized current policy document. It has no vector match in the top 40 and is absent from the 20 fused candidates. The reranker never sees it. Logs retain only final top-5 results, not per-stage candidates or score transformations.

## 4. Example Investigation Outcome

A strong diagnosis should name a likely failure boundary, distinguish evidence from inference, and request a trace that records candidate IDs, source ranks, normalized scores, filters, versions, and exclusion reason at each stage. It should not begin by changing the prompt or replacing the embedding model without confirming where recall was lost.

## 5. What the Interviewer Is Evaluating

- Layered, evidence-based RAG diagnosis
- Understanding of candidate recall versus reranker quality
- Experiment and metric design
- Safe mitigation and observability judgment

## 6. Concept Questions and Interview Answers

### Why can a strong reranker fail to fix this regression?

**Interview answer:**

> A reranker can only reorder candidates it receives. If fusion removes the relevant document first, reranker quality on its input can remain high while end-to-end recall collapses.

### Why segment evaluation by query type?

**Interview answer:**

> Aggregate metrics can hide a severe regression in a smaller but important cohort. Exact identifiers and semantic questions depend on different retrieval signals, so I would measure both before choosing a tradeoff.
