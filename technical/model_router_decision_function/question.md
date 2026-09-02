# Model Router Decision Function

## 1. Interview Prompt

A model-routing control plane has already loaded trusted candidate metadata. Implement the deterministic TypeScript function that filters ineligible models and selects one according to an ordered preference policy.

Do not call providers, measure health, or implement fallback execution. Focus on one reproducible routing decision.

## 2. Requirements

- Eliminate candidates that are unhealthy or violate tenant allowlist, region, required capabilities, context size, maximum estimated cost, or maximum latency.
- Hard constraints are never relaxed to produce an answer.
- Rank remaining candidates using a policy containing each preference exactly once: `quality`, `cost`, and `latency`.
- Higher quality is better; lower cost and latency are better.
- Break complete ties by lexicographically smaller model ID.
- Reject invalid policy configuration explicitly.
- Return the chosen model and bounded reason metadata, or `no_eligible_model`.
- Do not mutate candidates or depend on input order.

## 3. Example Input / Output

```text
preference=[quality,cost,latency]
eligible A: quality=90, cost=.03, latency=900
eligible B: quality=88, cost=.01, latency=400
-> A

A violates required region -> B
all candidates violate hard constraints -> no_eligible_model
preference omits latency -> invalid_policy
```

## 4. What the Interviewer Is Evaluating

- Hard-constraint filtering before optimization
- Deterministic multi-key comparison
- Set and numeric validation
- Reproducible, testable policy behavior

## 5. Concept Questions and Interview Answers

### Why filter policy constraints before ranking?

**Interview answer:**

> Cost or quality cannot compensate for violating residency, capability, authorization, or a hard request limit. Ranking applies only among eligible choices.

### Why require a deterministic tie-breaker?

**Interview answer:**

> Without one, input ordering or runtime details can change routing, which complicates caching, audits, rollouts, and debugging.
