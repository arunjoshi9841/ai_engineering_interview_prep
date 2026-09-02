# Agent Cost Control Plane

## 1. Interview Prompt

Design a cost-control plane for a multi-tenant agent platform. It must attribute model and tool usage, enforce budgets before expensive work starts, and degrade workflows predictably without violating customer policy or hiding actual spend.

Focus on policy, accounting, and enforcement across the platform. Billing-system implementation and provider pricing negotiation are out of scope.

## 2. Requirements

- Support hierarchical tenant, workspace, workflow, and user budgets over configurable periods.
- Reserve estimated cost before model calls or expensive tools and settle actual usage idempotently.
- Ingest delayed or corrected provider usage without losing or double-counting spend.
- Maintain versioned price and token-accounting metadata by provider and model.
- Enforce hard limits and expose soft warning thresholds.
- Define policy-approved degradation such as smaller context, cached results, lower-cost eligible models, partial completion, or human confirmation.
- Never route to a model that violates capability, residency, safety, or tenant policy merely to save money.
- Prevent parallel steps and multiple service instances from overspending the same budget unnoticed.
- Attribute shared work and cache hits consistently.
- Provide near-real-time views and an auditable ledger of final cost.

## 3. Initial System Context

The platform processes three million model calls per day across interactive and asynchronous workflows. Providers report usage in different units; some final usage arrives minutes later. Agent steps run in parallel, long workflows span budget periods, and a small number of tenants produce most traffic. Finance needs daily accuracy, while the request path needs an enforcement decision within 20 milliseconds.

## 4. Example Input / Output

```text
workflow budget remaining: $0.18
proposed step estimate:    $0.12
parallel reservation:      accepted
actual settled cost:       $0.09

next proposed step:        $0.11
policy outcome:            reject or approved degradation
ledger outcome:            actual usage remains recorded even if it later exceeds the estimate
```

A retry carrying the same provider request ID must not settle cost twice. A cache hit must follow the configured attribution policy rather than pretending the cached work was free to create.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Are budgets denominated only in currency?

**Interviewer:** Support currency plus optional token, call, or tool-specific quotas; keep policy explicit about which limit caused a decision.

**Candidate:** What if actual usage exceeds the reservation?

**Interviewer:** Record the overage honestly, block or degrade later work, and expose estimation error.

**Candidate:** Can a customer override a hard limit during an incident?

**Interviewer:** Authorized operators may apply a scoped, expiring override with an audit trail.

**Candidate:** Does the cost service sit directly in every token stream?

**Interviewer:** It should make reservation decisions and ingest settlement events; avoid a design where every streamed token requires a central synchronous write.

## 6. What the Interviewer Is Evaluating

- Hierarchical budget and distributed accounting design
- Separation of estimation, reservation, settlement, and billing truth
- Graceful degradation and product judgment
- Low-latency enforcement, fairness, and auditability

## 7. Likely Interviewer Follow-Ups

- How would you atomically reserve against both tenant and workflow limits?
- What happens if the cost-control service is unavailable?
- How do you avoid stale price catalogs changing historical reports?
- Which quality signals ensure cheaper routing is not silently degrading outcomes?

## 8. Architecture Change Requests

1. A provider changes its cached-input pricing retroactively for the current invoice period.
2. One tenant launches a large batch job that must not consume capacity reserved for interactive traffic.
3. Customers want prepaid hard limits while internal workflows use alert-only budgets.

## 9. Concept Questions and Interview Answers

### Why separate reservation from settlement?

**Interview answer:**

> Reservation prevents concurrent work from committing the same remaining budget, while settlement records what the provider actually consumed. Estimates protect the limit; actual usage preserves accounting truth.

### Should cost optimization run before policy eligibility?

**Interview answer:**

> No. I first remove choices that violate capability, security, residency, or customer policy. Cost can rank or constrain only the remaining eligible choices.

## 10. Production Discussion

Discuss a strongly consistent reservation path, append-only usage ledger, idempotent provider-event ingestion, price-version references, periodic reconciliation, local policy caches, and materialized reporting views. Monitor reservation latency, rejection and degradation rates, estimate error, leaked reservations, overages, spend velocity, quality by route, and noisy-neighbor effects.

## 11. Security / Safety Angle

Budget APIs require tenant-scoped authorization and must not expose another customer's usage. Operators need least-privilege overrides with expiry and audit. Cost pressure must not bypass safety filters, approval requirements, data residency, or retention policy, and telemetry must avoid prompt content and sensitive tool arguments.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Budget and accounting architecture | /5 |
| Distributed correctness and latency | /5 |
| Degradation and product judgment | /5 |
| Security and auditability | /5 |
