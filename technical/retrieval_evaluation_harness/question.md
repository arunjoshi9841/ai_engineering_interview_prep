# Retrieval Evaluation Harness

## 1. Interview Prompt

Implement a small evaluation harness in a language of your choice that evaluates a retriever against judged queries using Recall@K and reciprocal rank. It should make invalid datasets and duplicate result IDs explicit.

Do not evaluate answer generation or call a model grader.

## 2. Requirements

- Each case has a query ID, query text, and a non-empty set of relevant document IDs.
- Run the retriever once per case with a positive `k`.
- Reject duplicate query IDs and duplicate returned document IDs within a case.
- Recall@K is retrieved relevant IDs divided by total judged relevant IDs.
- Reciprocal rank is `1 / rank` of the first relevant result, or `0`.
- Return per-case values plus macro averages across cases.
- Preserve retriever failures as typed case failures; do not silently score them as zero.
- Do not log query text or document content.

## 3. Example Input / Output

```text
relevant={d2,d4}, results=[d1,d2,d3] -> Recall@3=.5, RR=.5
relevant={d7}, results=[d1,d2]       -> Recall@2=0, RR=0
results=[d1,d1]                      -> duplicate_result
```

## 4. What the Interviewer Is Evaluating

- Correct metric definitions
- Dataset validation and failure separation
- Async harness organization
- Awareness of evaluation limitations

## 5. Concept Questions and Interview Answers

### How do Recall@K and reciprocal rank differ?

**Interview answer:**

> Recall measures how much judged relevant evidence appears in the top K. Reciprocal rank rewards placing the first relevant result near the top; it does not measure whether all relevant evidence was found.

### Why separate failures from zero relevance scores?

**Interview answer:**

> A dependency error and a valid but irrelevant result are different failure modes. Combining them hides whether to improve reliability or ranking.
