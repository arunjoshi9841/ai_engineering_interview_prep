# Bounded Parallel Tool Runner

## 1. Interview Prompt

An agent has already produced an approved list of independent read-only tool calls. Implement a runner in a language of your choice that executes them with bounded concurrency, supports cancellation, and returns results in the original input order.

Do not implement planning, authorization, or retries. Assume each request was authorized before it reached this runner.

## 2. Requirements

- Execute at most `maxConcurrency` handlers at once.
- Preserve input order in the returned result array regardless of completion order.
- Represent each started call as success or failure without failing the whole batch.
- If the supplied abort signal is triggered, do not start additional calls.
- Pass the signal to handlers so in-flight work can cooperate with cancellation.
- Mark items never started because of cancellation as `cancelled`.
- Synchronous handler throws and promise rejections both become failed results.
- Validate that `maxConcurrency` is a positive integer.

## 3. Example Input / Output

```text
inputs:  [a, b, c], maxConcurrency: 2
finish:  b succeeds, a fails, c succeeds
result:  [failed(a), succeeded(b), succeeded(c)]

If cancellation occurs while a and b are running, c is returned as cancelled and is never started.
```

## 4. What the Interviewer Is Evaluating

- Async scheduling without exceeding a concurrency bound
- Stable aggregation under out-of-order completion
- Cancellation and partial-failure semantics
- Clear separation from authorization and retry policy

## 5. Concept Questions and Interview Answers

### Why preserve input order if work completes out of order?

**Interview answer:**

> A stable result contract makes callers simpler and prevents completion timing from changing how results map to requests. I would preserve IDs as well because ordering alone is not enough for auditing.

### What does cancellation guarantee?

**Interview answer:**

> A cancellation signal communicates intent; it cannot forcibly stop arbitrary work. The runner can stop launching tasks, and handlers must observe the signal and clean up their own resources.
