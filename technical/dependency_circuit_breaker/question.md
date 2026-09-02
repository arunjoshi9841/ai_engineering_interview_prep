# Dependency Circuit Breaker

## 1. Interview Prompt

An AI service calls a model provider that sometimes fails or becomes slow. Implement a small in-memory circuit breaker that stops sending requests to an unhealthy dependency and later probes whether it has recovered.

Keep the live-coding version local to one TypeScript process. Do not implement retries, provider routing, or persistence.

## 2. Requirements

- Begin in `closed` state and allow calls.
- Count consecutive eligible failures; open after a configured threshold.
- While open, reject calls without invoking the dependency.
- After the cooldown, allow exactly one probe in `half_open`; concurrent callers fail fast.
- A successful call or probe closes the circuit and resets the failure count.
- An eligible failed probe reopens the circuit and restarts the cooldown.
- Only timeouts, connection failures, and 5xx responses count; caller errors do not.
- Use an injectable clock for deterministic tests.

## 3. Example Input / Output

```text
threshold = 3, cooldown = 10 seconds

eligible failure 1 -> original error; state closed
eligible failure 2 -> original error; state closed
eligible failure 3 -> original error; state open
next call           -> CircuitOpenError; dependency not called
after 10 seconds    -> one caller runs the half-open probe
successful probe    -> state closed
```

## 4. What the Interviewer Is Evaluating

- Explicit state-machine reasoning
- Async concurrency and half-open probe control
- Failure classification and recovery semantics
- Testability of time-dependent behavior

## 5. Concept Questions and Interview Answers

### What problem does a circuit breaker solve that retries do not?

**Interview answer:**

> Retries attempt recovery for individual requests, but they can amplify load during an outage. A circuit breaker stops spending resources on a dependency that is probably unhealthy and gives it time to recover.

### Why allow only a limited half-open probe?

**Interview answer:**

> Sending normal traffic immediately can overwhelm a dependency that has only partly recovered. A limited probe tests health while bounding that risk.
