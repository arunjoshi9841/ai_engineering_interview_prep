# Content Filter Integration

## 1. Interview Prompt

Implement the TypeScript orchestration boundary that applies an external content-safety classifier before and after model generation. It must fail safely, preserve typed policy outcomes, and support review without exposing unsafe content.

Do not implement the classifier or model.

## 2. Requirements

- Validate and cap input before calling the classifier.
- Classify input once; blocked input must not reach the model.
- Generate only when input is allowed, passing the caller's abort signal.
- Classify generated output before returning it.
- Blocked output must not be returned, cached, or sent to tools.
- Classifier timeout, malformed response, or unavailability returns `filter_unavailable`; do not bypass it.
- Return bounded category and decision metadata with a review reference, not raw blocked text.
- Distinguish input block, output block, model failure, cancellation, and filter failure.
- Model or caller claims cannot override policy.

## 3. Example Input / Output

```text
input blocked  -> model not called; blocked stage=input
input allowed, output blocked -> output not returned; blocked stage=output
filter timeout -> failed filter_unavailable
caller aborts  -> failed cancelled
```

## 4. What the Interviewer Is Evaluating

- Correct safety-gate ordering
- Fail-closed async orchestration
- Typed outcome and cancellation handling
- Separation of classifier, policy, and user messaging

## 5. Concept Questions and Interview Answers

### Why filter both input and output?

**Interview answer:**

> Input filtering can stop disallowed requests before generation, while output filtering catches unsafe content the model still produces. Neither makes tool authorization unnecessary.

### Why record policy version?

**Interview answer:**

> Categories and thresholds evolve. Versioning makes decisions reproducible and lets operators analyze rollout effects and appeals.
