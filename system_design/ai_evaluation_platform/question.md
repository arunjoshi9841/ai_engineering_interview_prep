# AI Evaluation Platform

## 1. Interview Prompt

Design an evaluation platform for enterprise agents that measures retrieval, generation, tool use, safety, and end-to-end workflow behavior before and after releases.

Focus on datasets, execution, metrics, governance, regression gates, and production feedback. Model training is out of scope.

## 2. Requirements

- Store versioned datasets with provenance, tenant policy, labels, cohort tags, and review history.
- Evaluate retrieval separately from answer quality and agent/tool outcomes.
- Support deterministic tests, model-based graders, human review, and security adversarial suites.
- Pin prompt, model, retrieval, tool, workflow, policy, and evaluator versions for each run.
- Track metric uncertainty, sample size, grader calibration, and disagreements.
- Define configurable release gates with critical safety tests that cannot be averaged away.
- Compare candidates to a baseline by meaningful cohort, latency, and cost.
- Ingest sampled production failures and corrections under privacy controls.
- Prevent test leakage and uncontrolled use of customer data.
- Make runs reproducible while allowing provider outputs to remain probabilistic.

## 3. Initial System Context

Teams ship prompt, model, retrieval, and workflow changes daily. The platform has thousands of test cases and receives millions of production traces, but only a governed sample may become evaluation data. Some labels are subjective, and external model graders change behavior across versions.

## 4. Example Input / Output

```text
candidate vs baseline:
retrieval Recall@5       +3%
answer correctness       +1% ± 2%
tool selection accuracy  -4% on billing cohort
critical data-leak tests 1 failure
p95 latency              +18%

release result: blocked by critical safety failure despite aggregate gain
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is one score enough for release decisions?

**Interviewer:** No. Preserve task and risk dimensions and hard critical gates.

**Candidate:** Can production thumbs-up labels be treated as ground truth?

**Interviewer:** No. They are biased signals that require context and sampling discipline.

**Candidate:** Must identical runs produce identical text?

**Interviewer:** No. Pin configuration and retain outputs; use repeated trials where variance matters.

## 6. What the Interviewer Is Evaluating

- Layered evaluation and metric design
- Dataset governance and reproducibility
- Statistical and grader judgment
- Release gates and production feedback loops

## 7. Likely Interviewer Follow-Ups

- How would you calibrate a model-based grader?
- How do you avoid overfitting to a static benchmark?
- Which cohorts need human review?
- How would you attribute an end-to-end regression to retrieval versus generation?

## 8. Architecture Change Requests

1. A model provider retires the version used by a grader.
2. One tenant permits production traces for evaluation only inside its region.
3. Evaluation volume grows 20x and model-call cost becomes a bottleneck.

## 9. Concept Questions and Interview Answers

### Why separate component and end-to-end metrics?

**Interview answer:**

> End-to-end success shows user impact, while component metrics locate failure. A good answer metric can temporarily hide retrieval decline, and a good schema-valid rate does not prove tool correctness.

### Why can aggregate improvement be unsafe?

**Interview answer:**

> Gains on common easy cases can mask severe regressions in a small high-risk cohort. Critical security and authorization tests need explicit gates.

## 10. Production Discussion

Discuss a versioned dataset catalog, execution scheduler, isolated runners, artifact store, metric engine, grader service, review queues, comparison UI, CI gates, and feedback curation. Monitor run reliability, cost, variance, grader drift, label agreement, cohort coverage, and gate outcomes.

## 11. Security / Safety Angle

Redact or synthesize sensitive cases where possible, enforce tenant and regional controls, restrict dataset export, detect prompt injection against graders, and audit label and gate changes. Evaluation credentials must not grant production action authority.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Metrics and dataset design | /5 |
| Reproducibility and gates | /5 |
| Scale and feedback loops | /5 |
| Security and governance | /5 |
