# Legacy API Adapter

## 1. Interview Prompt

An agent workflow needs to read account status from a legacy customer API. Implement a TypeScript adapter that converts several inconsistent legacy responses into one explicit application contract.

Do not add retries or caching to the initial version. Focus on isolating legacy behavior so the rest of the application does not depend on it.

## 2. Requirements

- Call the injected legacy client with an account ID and abort signal.
- Normalize successful version 1 and version 2 payloads to the same `AccountStatus` type.
- Treat HTTP 200 payloads containing a legacy error object as failures.
- Map not-found, rate-limited, timeout, unavailable, and malformed-response cases to distinct adapter errors.
- Preserve a valid `Retry-After` value for rate-limited responses without sleeping inside the adapter.
- Reject missing, unknown, or wrong-type fields required for normalization.
- Never expose raw upstream bodies or credentials in the returned error.
- The adapter performs one attempt and does not infer whether a failed write would be safe to retry.

## 3. Example Input / Output

```text
200 + v1 status_code="A"       -> active AccountStatus
200 + v2 state="SUSPENDED"     -> suspended AccountStatus
200 + { error.code="MISSING" } -> not_found
429 + Retry-After="30"         -> rate_limited, retryAfterSeconds=30
200 + unknown status code      -> malformed_response
```

## 4. What the Interviewer Is Evaluating

- Anti-corruption-layer and contract design
- Runtime validation of inconsistent payloads
- Error normalization without hiding useful semantics
- Cancellation, testability, and restraint around retries

## 5. Concept Questions and Interview Answers

### What is an anti-corruption layer?

**Interview answer:**

> It isolates an external system's terminology, schemas, and quirks behind an application-owned contract. That keeps legacy behavior from spreading through the domain and gives one place to validate and evolve the integration.

### Why not retry inside every adapter method automatically?

**Interview answer:**

> Retry safety depends on the operation, error, deadline, and idempotency contract. Hiding retries can amplify load or duplicate effects, so policy should be explicit and observable.
