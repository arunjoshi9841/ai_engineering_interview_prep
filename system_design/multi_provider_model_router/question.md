# Multi-Provider Model Router

## 1. Interview Prompt

Design a model-routing layer for an enterprise agent platform that can use several third-party model providers. It should choose an eligible model for each request, meet policy and capability requirements, and degrade predictably when providers are slow or unavailable.

Focus on the routing control plane and request path. You do not need to design model training or GPU infrastructure.

## 2. Requirements

- Support text and structured-output requests from multiple tenants and workflow types.
- Filter candidates by required capability, tenant allowlist, data residency, safety policy, and context size before optimizing cost or latency.
- Prefer a configured model when healthy, with explicit fallback behavior.
- Normalize provider request, response, usage, error, and cancellation contracts.
- Preserve prompt, model, policy, and routing-decision metadata for audit and reproduction.
- Bound retries and total latency; avoid sending the same request to multiple providers unless policy explicitly allows it.
- Prevent one tenant or failing provider from exhausting shared capacity.
- Support safe configuration rollout and rollback.

## 3. Initial System Context

The platform serves interactive agent turns and asynchronous workflows. Providers differ in capabilities, regional availability, quotas, pricing, structured-output reliability, streaming behavior, and error semantics. Some customer data may only be sent to a restricted provider-region combination.

Assume an initial load of 200 requests per second, with bursts to 800. Interactive requests target a 4-second p95 first-token latency; asynchronous work can wait longer.

## 4. Example Input / Output

```text
Request:
  tenant=acme
  workload=interactive_support
  capabilities=[structured_output, tools]
  residency=US
  max_total_latency_ms=7000

Routing result:
  selected=model-b@provider-2/us
  policy_version=policy-18
  route_config_version=route-42
  reason=preferred_unhealthy_fallback
```

If no candidate satisfies the hard policy constraints, the router returns an explicit unavailable result rather than selecting a prohibited model.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Are cost and latency hard limits or optimization goals?

**Interviewer:** Residency, tenant policy, capability, and safety are hard constraints. Cost and latency may be hard bounds for some workflows and ranking signals for others.

**Candidate:** Can the router send sensitive prompts to two providers to reduce tail latency?

**Interviewer:** Only when the tenant policy explicitly permits hedging; default to one provider.

**Candidate:** Must a conversation remain on one model?

**Interviewer:** Not always, but model changes must preserve compatible tool and output contracts and be recorded.

**Candidate:** Is provider health global?

**Interviewer:** No. It may differ by region, model, endpoint, and credential pool.

## 6. What the Interviewer Is Evaluating

- Separation of hard policy eligibility from optimization
- Provider abstraction without hiding important differences
- Reliability, quota, and latency tradeoffs
- Reproducibility, rollout, and tenant-isolation design

## 7. Likely Interviewer Follow-Ups

- How do you prevent failover from overwhelming the remaining provider?
- Where do capability and policy metadata live, and how are they validated?
- How do you compare quality across providers before changing routing weights?
- What happens to a streaming response when its provider fails mid-generation?

## 8. Architecture Change Requests

1. The preferred provider has a regional outage while the fallback has only 30% spare quota.
2. A customer requires every request in one workflow to use an immutable approved model bundle.
3. Product wants online optimization of cost and quality, but policy changes still require deterministic auditability.

## 9. Concept Questions and Interview Answers

### In what order should routing constraints be applied?

**Interview answer:**

> I first eliminate models that violate capability, authorization, residency, safety, or contractual constraints. Only among eligible models do I optimize quality, latency, cost, and availability. A cheaper prohibited model is not a fallback.

### Why not fully normalize every provider difference?

**Interview answer:**

> A common contract simplifies callers, but hiding differences such as tool semantics, token accounting, or cancellation creates false guarantees. I would normalize the stable core and expose explicit capability metadata for meaningful differences.

## 10. Production Discussion

Discuss cached but versioned routing configuration, health signals, circuit breakers, quota reservation, retry budgets, load shedding, per-tenant fairness, streaming cancellation, provider-specific contract tests, and reconciliation of usage. Monitor route decisions, constraint failures, latency, quality evaluations, fallback rate, cost, quota, and error class by bounded dimensions.

## 11. Security / Safety Angle

Provider eligibility must enforce tenant contracts, data classification, residency, approved retention, and safety requirements. Credentials stay in provider adapters and never enter prompts. Audit logs should identify versions and decisions while redacting sensitive request and response content.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Policy and routing architecture | /5 |
| Reliability and capacity reasoning | /5 |
| Provider abstraction and auditability | /5 |
| Security and tenant isolation | /5 |
