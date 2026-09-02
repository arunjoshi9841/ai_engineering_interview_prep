# Agent Observability Platform

**Interviewer:** Design an observability platform for multi-step agent workflows.

**Me:** I would combine metrics, structured logs, traces, workflow outcomes, and quality signals, while keeping each layer’s purpose clear. The platform should explain both technical failures and cases where the system completed technically but produced a poor answer.

Every request gets correlation IDs for tenant, workflow, step, attempt, model call, retrieval, tool call, approval, and outcome. Context propagation carries these IDs through APIs, queues, and retries. A retry gets a new attempt ID but remains tied to the same logical operation.

For every workflow, I would retain a minimal outcome record even if detailed traces are sampled. Detailed spans can include queue wait, model latency, retrieval results metadata, tool timing, and approval delay. Prompts, evidence, arguments, and outputs should usually be represented by versions, hashes, or governed references rather than raw content.

Important SLIs include API availability, workflow completion, p95 and p99 latency, queue age, time to first token, tool success, and quality by cohort. Alerts should use error budgets and burn rates, not every individual model variance. A tenant dashboard can show that completion fell from 98% to 86%, then drill down to a fivefold increase in tool timeout retries and a particular adapter rollout.

Metrics need bounded labels. Tenant tier, region, provider, model family, workflow, and error class may be reasonable. Workflow IDs and user IDs belong in traces or governed logs because they create unbounded time series.

If telemetry grows 20 times, I would reduce expensive span sampling, retain all minimal outcomes, aggregate common metrics, control cardinality, and tier older data. For a regional privacy restriction, collectors route data locally and store only approved metadata. If parent context is missing, instrumentation checks and synthetic probes should detect the gap.

**Interviewer:** How do you measure groundedness in production?

**Me:** Use a governed sample of answers, citations, and retrieved references, then evaluate groundedness with calibrated graders and human review for important cohorts. Join those signals to workflow and retrieval versions without putting sensitive content into broad dashboards.

**Interviewer:** How is this different from the audit trail?

**Me:** Observability is optimized for diagnosis, aggregation, and cost-effective sampling. Audit evidence is optimized for reconstructing consequential decisions with stronger integrity and retention. They share correlation IDs but should remain separate systems.
