# Hallucination Triage

## 1. Interview Prompt

After a prompt rollout, an enterprise assistant gives more polished answers but also states unsupported policy exceptions. Diagnose the evidence below, identify the likely failure layer, and propose the smallest confirming experiments and safe mitigation.

Do not assume every unsupported answer is a model-only problem.

## 2. Requirements

Your diagnosis should separate:

- Source ingestion and document freshness.
- Retrieval candidate recall and ranking.
- Authorization-aware context assembly.
- Prompt and model generation behavior.
- Citation mapping and post-processing.
- Offline evaluator limitations and production feedback bias.
- Immediate containment from long-term correction.
- High-risk cases that should abstain or escalate.

## 3. Provided Diagnostic Context

```text
metric/cohort                    before   after
retrieval Recall@5                .84      .85
relevant evidence in context      .82      .83
claim support rate                .91      .72
citation ID validity              .98      .98
exact quote validity              .96      .95
unsupported exceptions cohort     4%      23%
```

The new prompt says: “Always give the user a complete, decisive answer. Infer reasonable exceptions when policy is incomplete.” Sample traces show current authorized evidence in context, but the asserted exceptions do not appear in it. A model-based grader rewards helpfulness and does not score evidence support separately.

## 4. Example Investigation Outcome

A strong diagnosis should infer that retrieval appears healthy for the sampled cohort while generation policy and evaluation incentives changed. It should still verify source version, context, claim/evidence mapping, and post-processing before concluding.

## 5. What the Interviewer Is Evaluating

- Layered evidence-based diagnosis
- Groundedness versus citation-validity reasoning
- Evaluation-rubric and incentive awareness
- Safe rollback and experiment design

## 6. Concept Questions and Interview Answers

### Why does retrieval recall not prove grounded generation?

**Interview answer:**

> Relevant evidence can be present while the model ignores, misreads, or extrapolates beyond it. Retrieval and claim support need separate measurements.

### Why are valid citations insufficient?

**Interview answer:**

> A citation can point to real text without that text entailing the associated claim. Provenance integrity and semantic support are different checks.
