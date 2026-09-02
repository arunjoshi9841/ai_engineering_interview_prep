# Sliding-Window Rate Limiter

## 1. Interview Prompt

An agent-facing API must protect a costly ingestion operation from request bursts. Implement an in-memory sliding-window rate limiter for one configured limit scope, such as one authenticated customer on one route.

Keep the initial implementation synchronous and local to one Python process. The surrounding API is responsible for selecting the correct limiter instance.

## 2. Requirements

- Allow at most `max_requests` successful admissions during the immediately preceding `window_seconds`.
- `allow_request` returns `True` when the request is admitted and `False` when it is limited.
- An admitted request consumes capacity in the current window.
- A rejected request does not consume capacity or extend the limited period.
- A request at exactly the expiration boundary no longer counts against the limit.
- Discard timestamps once they fall outside the rolling window.
- For the initial exercise, configuration values are positive and calls are made from one thread.
- Persistence, distributed coordination, and HTTP response construction are follow-up topics.

## 3. Example Input / Output

For `max_requests=3` and `window_seconds=60`:

```text
time=0s   allow_request() -> True
time=10s  allow_request() -> True
time=20s  allow_request() -> True
time=30s  allow_request() -> False
time=60s  allow_request() -> True   # the request at 0s has left the window
```

## 4. What the Interviewer Is Evaluating

- Translation of a rolling-window contract into bounded code
- Appropriate queue or timestamp data-structure choice
- Boundary-condition and complexity reasoning
- Separation of rate-limit policy from API concerns
- Awareness of concurrency and distributed-state limitations

## 5. Concept Questions and Interview Answers

### Why use a sliding window instead of a fixed window?

**Interview answer:**

> A fixed counter is cheaper, but a caller can send one full burst at the end of a window and another at the start of the next. A sliding window enforces the limit over any rolling interval, at the cost of storing or approximating more timing information.

### Why is an in-memory limiter insufficient behind a load balancer?

**Interview answer:**

> Each instance sees only part of the traffic, so the customer can exceed the intended global limit. I would need a shared atomic counter or an intentionally partitioned quota, while deciding how the service should behave if that coordination dependency is unavailable.
