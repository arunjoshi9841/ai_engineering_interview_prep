# Security Operations Agent Team

**Interviewer:** Design a bounded multi-agent system for investigating security alerts.

**Me:** I would begin by asking whether multiple agents are actually useful. If one deterministic workflow or one specialist can answer the question, I would use that simpler path. I would use multiple specialists when they have genuinely different tools or independent evidence sources, and when the improvement is measurable.

An alert enters through an authenticated intake service with a tenant, severity, source, and evidence references. The orchestrator creates a durable investigation and selects a bounded plan. For an unusual-login alert, identity and endpoint specialists might gather read-only evidence in parallel. A later synthesis step would compare the results and cite their sources.

Specialists should not communicate through an unbounded shared conversation. Each gets a narrow tool set and isolated context. They write typed claims, evidence references, confidence, source timestamps, and provenance to a shared state store. The orchestrator owns the workflow transitions.

The plan needs limits on fan-out, turns, tokens, tool calls, and total time. Per-tenant queues and priority classes protect critical alerts and prevent one customer’s alert storm from consuming all capacity. Partial results are useful, so an investigation can produce a preliminary summary within 60 seconds while deeper enrichment continues asynchronously.

I would not treat agent agreement as proof. Several agents may share the same model or depend on the same bad source. The synthesis step should preserve conflicting claims, compare evidence freshness, and apply deterministic completeness and policy checks. Low confidence, missing evidence, and disagreement should lead to analyst review.

Any response action is separate from investigation. A model may recommend isolating a device, but a policy service must check the tenant rule, current authorization, action scope, reversibility, and approval requirement. The tool gateway performs the final authorization and execution. For a narrow reversible isolation policy, we could allow automation with a short time limit, audit record, and automatic recovery path.

If an agent times out, the investigation records which evidence was collected and which work remains. The workflow can retry only the failed step. If a provider is degraded, the system should show that limitation rather than quietly treating missing evidence as clean evidence.

I would measure time to preliminary summary, evidence completeness, escalation precision, analyst corrections, disagreement rate, tool failures, cost, and unsafe-action rejection. I would also compare this design with a simpler single-agent or deterministic baseline.

**Interviewer:** How do you stop malicious alert text from steering the agents?

**Me:** Alert text and retrieved artifacts are data, not instructions. I would pass them as typed evidence, keep tools outside the model’s control, and enforce permissions in code. A specialist cannot expand its own scope because an email or log tells it to.

**Interviewer:** What if two specialists disagree repeatedly?

**Me:** I would expose the disagreement and its evidence freshness to the analyst. If one source is consistently delayed or unreliable, that should be reflected in source health and policy, not hidden by taking a majority vote.
