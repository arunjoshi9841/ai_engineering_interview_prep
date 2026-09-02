# Agent Observability Platform

## 1. Interview Prompt

Design an observability platform that lets engineers understand the reliability, latency, cost, and quality of multi-step agent workflows across models, retrieval, tools, queues, and approvals.

Focus on operational telemetry and diagnosis. Durable compliance audit evidence is a related but separate system.

## 2. Requirements

- Correlate requests, workflows, steps, attempts, model calls, retrieval, tools, approvals, and outcomes.
- Collect metrics, structured logs, traces, and evaluation signals with clear ownership.
- Preserve retries and partial failures rather than flattening them into one success flag.
- Define SLIs/SLOs for API reliability, workflow completion, latency, queue age, and quality cohorts.
- Track model/provider, prompt, retrieval, tool, workflow, and policy versions.
- Control cardinality, sampling, retention, and cost.
- Redact or reference sensitive prompts, evidence, arguments, outputs, and identities.
- Support tenant-aware dashboards and incident drill-down.
- Alert on actionable symptoms and burn rates rather than every model variance.
- Detect missing telemetry and instrumentation regressions.

## 3. Initial System Context

The platform runs millions of workflow steps per day across regions. Workflows can last days, technical traces may be sampled, and providers expose inconsistent usage metadata. Operators currently have service logs but cannot answer why one tenant's completion rate declined.

## 4. Example Input / Output

```text
tenant cohort completion SLI drops from 98% to 86%
drill-down -> queue age normal, retrieval normal, tool timeout retries +5x
correlated versions -> legacy adapter v7 rollout
audit reference available for consequential actions; raw payload absent from traces
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Must every workflow be fully traced?

**Interviewer:** Preserve minimal workflow outcome records for all; sample detailed spans according to risk and debugging needs.

**Candidate:** Is user feedback an SLO?

**Interviewer:** It is a useful biased signal, not a standalone reliability objective.

**Candidate:** Can prompt text be logged?

**Interviewer:** Default no; use versions, hashes, governed references, and exceptional access paths.

## 6. What the Interviewer Is Evaluating

- Layered telemetry and correlation design
- SLI/SLO, retry, and long-workflow reasoning
- Cardinality, sampling, privacy, and cost tradeoffs
- Diagnosis and actionable alerting

## 7. Likely Interviewer Follow-Ups

- How do you correlate work across queues and retries?
- Which labels are safe for metrics?
- How do audit and observability differ?
- How would you measure groundedness in production?

## 8. Architecture Change Requests

1. Telemetry volume grows 20x and cost must halve.
2. A customer prohibits prompt and transcript export from its region.
3. An instrumentation bug drops parent trace context for one service.

## 9. Concept Questions and Interview Answers

### Why combine software and AI quality signals?

**Interview answer:**

> A workflow can be technically successful but produce a poor answer, or fail before the model is involved. Both layers are needed to locate and prioritize user impact.

### Why are high-cardinality metric labels risky?

**Interview answer:**

> Labels such as workflow IDs or user IDs create an unbounded number of time series, increasing cost and degrading the monitoring system. They belong in traces or governed logs instead.

## 10. Production Discussion

Discuss telemetry SDK conventions, context propagation, collectors, metrics store, trace backend, structured-log pipeline, evaluation joins, service catalog, dashboards, alerting, sampling, and redaction. Monitor ingestion gaps, cost, cardinality, trace completeness, and SLO burn.

## 11. Security / Safety Angle

Treat telemetry as sensitive multi-tenant data. Enforce tenant and role access, regional routing, encryption, retention, redaction, audit of privileged queries, and secret scanning. Observability must not become a data-exfiltration path.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Telemetry and correlation design | /5 |
| SLO and diagnosis reasoning | /5 |
| Scale, cost, and privacy | /5 |
| Security and operations | /5 |
