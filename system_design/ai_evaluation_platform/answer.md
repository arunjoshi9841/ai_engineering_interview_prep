# AI Evaluation Platform

**Interviewer:** Design an evaluation platform for enterprise agents.

**Me:** I would build a versioned evaluation system that separates the data, execution, grading, and release-decision layers. The goal is not one overall score. We need to understand retrieval, answer quality, tool behavior, safety, latency, cost, and performance by meaningful cohort.

The dataset catalog would store immutable cases with provenance, tenant policy, labels, source, cohort tags, and review history. Production traces could contribute examples only through a governed sampling and redaction process. Customer data should not silently become shared benchmark data.

Each evaluation run pins the candidate configuration: prompt, model, retrieval version, tool contracts, workflow, policy, and evaluator versions. Isolated runners execute the cases and store outputs and artifacts. The result should be reproducible in configuration, even though a provider may produce different text on repeated runs.

I would measure components separately. Retrieval gets metrics such as Recall@k and ranking quality. Generation gets correctness, groundedness, citation quality, and completeness. Tool use gets selection and argument accuracy. End-to-end metrics show actual workflow behavior. Human review is useful for subjective or high-risk cohorts, while model graders can handle scale after calibration.

Every grader needs a version, calibration set, agreement data, and uncertainty information. For probabilistic results, the report should include sample size, confidence intervals or variance, and disagreement between graders.

Release gates should compare the candidate with a pinned baseline by cohort. Aggregate improvement cannot hide a data-leak failure or a large regression in billing workflows. Critical security, authorization, and safety tests are hard gates and block release even when other metrics improve.

The platform can run in CI for smaller suites and use a scheduler for larger runs. A comparison UI shows metric changes, examples, failures, cost, and latency. Production feedback can enter a review queue for labeling and later evaluation.

**Interviewer:** What if a model provider retires a grader version?

**Me:** I would preserve the original results and configuration, mark the grader unavailable, and run a replacement grader as a new version. I would not silently rewrite historical scores. Comparisons would clearly distinguish the old and new grader.

**Interviewer:** How do you prevent overfitting to the benchmark?

**Me:** Keep held-out and adversarial sets, rotate some cases, monitor production cohorts, and require human review for important changes. The benchmark should be one signal in a broader feedback loop.
