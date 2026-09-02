# Multi-Provider Model Router

**Interviewer:** Design a routing layer that chooses among several model providers.

**Me:** I would treat this as a policy decision first and an optimization problem second. For each request, we need to know the tenant, workflow, required capabilities, data classification, residency, latency target, and whether structured output or tools are required.

The request would go through a router with four stages:

1. Load the versioned routing and tenant policy configuration.
2. Remove models that violate hard requirements such as residency, safety, capability, context size, or tenant allowlists.
3. Rank the remaining candidates by quality, health, latency, cost, and available quota.
4. Select one provider and record the decision.

That order matters. A cheaper model in a prohibited region is not a valid fallback.

I would put provider-specific behavior behind adapters. The common contract would cover messages, tools, structured output, streaming, usage, errors, cancellation, and request IDs. I would not pretend every provider behaves identically. Capability metadata should make differences explicit, such as whether cancellation is reliable or whether structured output is enforced by the provider.

The interactive path should be fast. Health signals would be maintained per provider, region, model, endpoint, and credential pool. The router can use cached configuration and health data, but the cache needs a bounded lifetime and a safe fallback. Circuit breakers would temporarily remove unhealthy candidates.

I would normally send a request to one provider only. Hedging to two providers can reduce tail latency, but it duplicates cost and may send sensitive data to an additional provider. It should require explicit tenant permission. Retries would be bounded by both attempt count and total request deadline.

If the preferred provider fails, the router checks whether a fallback is still eligible and whether it has enough quota. It should reserve capacity before failing over so that a regional outage does not overwhelm the remaining provider. If no safe candidate remains, it returns an explicit unavailable result.

Every request would record the prompt version, selected model, provider region, policy version, route configuration version, fallback reason, and outcome. Sensitive prompt and response content would be excluded from normal audit logs.

**Interviewer:** What if the provider fails halfway through a stream?

**Me:** I would stop the stream and classify the outcome as partial or failed. I would not automatically replay it to another provider unless the workflow explicitly allows duplicate work and the request has safe idempotency semantics. For an interactive user, we can offer a clear retry. For an asynchronous workflow, the state machine can retry or choose a fallback under its policy.

**Interviewer:** How would you roll out new routing weights?

**Me:** Store immutable configuration versions, validate them against policy and capability data, then roll them out by tenant or percentage. I would compare quality, latency, cost, and safety metrics before expanding the rollout. Rollback should be an atomic pointer change.
