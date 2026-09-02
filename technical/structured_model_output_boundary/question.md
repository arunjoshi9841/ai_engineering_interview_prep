# Structured Model Output Boundary

## 1. Interview Prompt

An agent asks a model to classify a support request and propose a next action. Implement the TypeScript boundary that accepts the model's untrusted output, validates it, and returns either a safe typed decision or a structured rejection.

Do not call a model or execute the proposed action. Focus on the boundary between probabilistic output and deterministic application code.

## 2. Requirements

- Accept a JSON string produced by a model.
- A valid decision contains `category`, `confidence`, `action`, and `reason`.
- `category` must be `billing`, `access`, or `security`; `confidence` must be a finite number from 0 through 1.
- `action` must be `reply`, `request_more_information`, or `escalate`.
- `reason` must contain 1 through 500 characters after trimming.
- A `security` decision may only propose `escalate`.
- Reject malformed JSON, missing fields, wrong types, unknown fields, and policy-invalid combinations.
- Return errors safe to log; do not echo the full model output.
- The initial implementation gets one model response and must not silently repair or retry it.

## 3. Example Input / Output

```text
{"category":"billing","confidence":0.82,"action":"reply","reason":"Invoice question"}
-> { ok: true, decision: ... }

{"category":"security","confidence":0.91,"action":"reply","reason":"Looks safe"}
-> { ok: false, code: "policy_violation" }

"not json"
-> { ok: false, code: "invalid_json" }
```

## 4. What the Interviewer Is Evaluating

- Runtime validation despite TypeScript's compile-time types
- Separation of syntax, schema, and business-policy failures
- Fail-closed handling of model output
- Clear, testable contracts without leaking untrusted content

## 5. Concept Questions and Interview Answers

### Why is a TypeScript cast insufficient here?

**Interview answer:**

> A cast only changes what the compiler believes; it performs no runtime check. Model output crosses a trust boundary, so I need runtime validation before application code can rely on its shape or values.

### Should a schema validator enforce authorization?

**Interview answer:**

> No. Schema validation proves that data is well formed. Authorization and action policy depend on authenticated identity and business context, so they belong in separate deterministic checks.
