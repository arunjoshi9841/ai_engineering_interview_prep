# Security Operations Agent Team

## 1. Interview Prompt

Design a bounded multi-agent system that helps a security operations team investigate heterogeneous alerts. Specialist agents may gather endpoint, identity, email, and threat-intelligence evidence, but the platform must control shared state, authority, disagreements, and any proposed response action.

Focus on whether and how multiple agents improve the investigation. Do not design one phishing detector or assume that every alert needs an autonomous response.

## 2. Requirements

- Accept alerts with tenant, severity, source, and available evidence.
- Decide when a deterministic workflow or one agent is sufficient and when specialists should run sequentially or in parallel.
- Give specialists narrow read-only tools and isolated context by default.
- Store evidence, claims, confidence, provenance, and workflow state outside model context.
- Merge results without treating agent agreement as proof.
- Bound fan-out, turns, time, tokens, and tool calls.
- Require deterministic authorization and risk checks for every proposed action.
- Escalate conflicting evidence, low confidence, or high-impact actions to a human analyst.
- Preserve a reconstructable audit trail and allow safe resumption after failure.

## 3. Initial System Context

The platform receives alerts from several customer security products. Some alerts can be enriched with independent read-only calls; others require a sequence because later queries depend on earlier evidence. Customer policies differ, tools are rate-limited, and alert text or retrieved artifacts may contain adversarial instructions.

Begin at 50 alerts per second across tenants. Critical alerts should surface a preliminary evidence summary within 60 seconds, while deeper investigation may continue asynchronously.

## 4. Example Input / Output

**Input:** An unusual-login alert includes an identity, device, timestamp, and source IP.

**Possible bounded plan:** Identity and endpoint specialists gather independent evidence in parallel. A synthesis step cites their evidence and identifies conflicts. A policy service decides whether to close, request more evidence, or send the case to an analyst. Any account suspension remains a separate authorized and approval-gated action.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is automatic containment required?

**Interviewer:** Not for the initial system. Design the investigation and recommendation path; discuss tightly bounded containment afterward.

**Candidate:** Do specialists communicate directly?

**Interviewer:** Prefer communication through typed, persisted state managed by the orchestrator.

**Candidate:** Is the model's confidence calibrated enough to set policy?

**Interviewer:** No. Treat it as one signal alongside deterministic rules, evidence completeness, and evaluations.

**Candidate:** Must every alert use all specialists?

**Interviewer:** No. Unnecessary agents add latency, cost, and failure modes.

## 6. What the Interviewer Is Evaluating

- Judgment about when multi-agent decomposition adds value
- Orchestration, state, evidence, and disagreement handling
- Bounded autonomy and tool-permission design
- Reliability, fairness, evaluation, and human escalation

## 7. Likely Interviewer Follow-Ups

- How do you stop one specialist's compromised output from steering the others?
- What happens if an agent times out after gathering only some evidence?
- How do you prevent alert storms from starving one tenant or critical incidents?
- How would you evaluate whether the multi-agent design beats a simpler baseline?

## 8. Architecture Change Requests

1. A customer permits automatic isolation of a device only for a narrow, reversible class of incidents.
2. Two specialists repeatedly disagree because their data sources have different freshness.
3. Alert volume grows 20x during an active campaign while one evidence provider is degraded.

## 9. Concept Questions and Interview Answers

### When is a multi-agent system justified here?

**Interview answer:**

> I would use specialists when the work has genuinely different tools, context, or parallel evidence paths and the gain is measurable. If one bounded workflow can do the job, extra agents only increase cost, latency, and coordination risk.

### How should specialist results be combined?

**Interview answer:**

> I would preserve each claim's evidence and provenance, apply deterministic completeness and policy checks, and make conflicts explicit. Majority vote is not reliable when agents share the same model or bad source.

## 10. Production Discussion

Discuss durable orchestration, per-tenant priority queues, specialist capability registries, time and token budgets, checkpoints, partial-result states, evidence freshness, versioned plans, and analyst feedback. Measure time to preliminary summary, evidence completeness, escalation precision, tool failures, disagreement, cost, unsafe-action rejection, and outcomes against a simpler baseline.

## 11. Security / Safety Angle

Use least-privilege service identities, tenant-scoped tools, policy enforcement outside models, and taint/provenance handling for untrusted evidence. Do not share secrets or unrestricted context between specialists. Consequential actions require fresh authorization, argument validation, idempotency, auditability, and risk-appropriate human approval.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Multi-agent decomposition judgment | /5 |
| State, evidence, and reliability design | /5 |
| Bounded autonomy and human oversight | /5 |
| Security, tenancy, and evaluation | /5 |
