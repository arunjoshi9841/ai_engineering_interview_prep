# Agent Contract Tests

## 1. Interview Prompt

An agent can call a customer-data tool through an application-owned adapter. Implement a focused contract test suite in a language of your choice that every implementation of the adapter must pass, including a real HTTP implementation and an in-memory test implementation.

Test observable behavior at the boundary. Do not inspect private fields, reproduce the adapter implementation inside the tests, or call a live third-party service.

## 2. Requirements

The contract suite must verify that every adapter implementation:

- accepts a valid request and returns the application-owned success shape;
- rejects arguments that do not match the declared schema before invoking the dependency;
- maps not-found, rate-limited, timeout, unavailable, malformed-response, and cancellation outcomes to the exact typed error contract;
- preserves a valid retry delay without sleeping or retrying;
- never exposes raw upstream bodies, headers, stack traces, or credentials through its result or captured telemetry;
- honors an already-aborted signal and an abort that occurs while work is pending;
- performs one dependency attempt per call;
- supports deterministic test fixtures without depending on exact log text or internal helper calls.

Each implementation factory may install its own boundary fixture or stub server. The shared suite must run the same behavioral cases against every factory.

## 3. Example Input / Output

```text
HTTP adapter + valid fixture       -> all contract cases pass
in-memory adapter + valid fixture  -> all contract cases pass
adapter leaks an upstream body     -> redaction contract case fails
adapter retries a timeout once     -> attempt-count contract case fails
adapter ignores mid-flight abort   -> cancellation contract case fails
```

## 4. What the Interviewer Is Evaluating

- Behavioral contract testing and fixture design
- Success, failure, cancellation, and data-exposure coverage
- Stable assertions that avoid implementation coupling
- Separation of unit, contract, and live-provider tests

## 5. Concept Questions and Interview Answers

### What makes a contract test different from a unit test?

**Interview answer:**

> A unit test isolates local logic, while a contract test checks that an implementation satisfies a boundary other components rely on. The same contract can validate different implementations without asserting how they work internally.

### Why are deep mocks risky at an integration boundary?

**Interview answer:**

> A mock built from our assumptions can keep passing after the real protocol changes. I prefer protocol-faithful fixtures, schema validation, and a small sandbox check for the assumptions that cannot be proven locally.
