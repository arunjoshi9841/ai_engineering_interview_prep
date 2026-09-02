# Retry Storm Diagnosis

## 1. Interview Prompt

A model provider had a three-minute outage. Instead of degrading, the agent platform saturated its workers and continued failing for twenty minutes after the provider recovered. Diagnose the evidence and propose a safe mitigation and verification plan.

Do not redesign the entire platform. Focus on retry amplification across service layers.

## 2. Requirements

Your diagnosis should:

- Distinguish original traffic from retries and queue redelivery.
- Identify retry multiplication across API, workflow, SDK, and worker layers.
- Evaluate timeout, backoff, jitter, retry budgets, circuit breaking, and concurrency.
- Protect interactive and unrelated dependencies during recovery.
- Define an immediate containment action and a durable correction.
- Preserve idempotency and uncertain side-effect handling.
- Specify metrics that confirm recovery without creating another surge.

## 3. Provided Diagnostic Context

```text
normal requests:                 1,000/sec
provider success during outage: 0%
API retries:                     3 immediate attempts
workflow retries:                4 attempts at 1-second intervals
SDK retries per call:            2
queue visibility timeout:        10s; p95 attempt duration 35s
jitter:                          none
global retry budget:             none
provider call rate peak:         19,000/sec
worker CPU:                      96%
queue age after recovery:        18 minutes
```

All instances use the same exponential schedule, and the circuit breaker is configured per request object rather than shared per provider endpoint.

## 4. Example Investigation Outcome

A strong diagnosis should quantify multiplicative attempts, note synchronized retry waves and premature redelivery, and separate containment from long-term policy ownership. “Add exponential backoff” alone is insufficient.

## 5. What the Interviewer Is Evaluating

- Quantitative retry-amplification diagnosis
- Layered reliability and backpressure reasoning
- Recovery, fairness, and idempotency judgment
- Metrics and safe rollout design

## 6. Concept Questions and Interview Answers

### What is a retry budget?

**Interview answer:**

> It caps extra attempts relative to useful traffic over a period, preventing retries from becoming most of the load during an outage.

### Why does recovery trigger another risk period?

**Interview answer:**

> Backlogged and synchronized retries can hit the dependency simultaneously as it returns. Gradual probes, jitter, concurrency limits, and controlled backlog draining protect recovery.
