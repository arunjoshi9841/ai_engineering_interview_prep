# Partial Result Aggregator

## 1. Interview Prompt

Several specialist agents investigate one case in parallel. Implement an aggregator in a language of your choice that converts their outcomes into a deterministic summary without hiding failures, timeouts, or conflicting conclusions.

Do not run the agents or ask another model to synthesize prose.

## 2. Requirements

- The workflow expects a configured set of unique specialist names.
- Each specialist outcome is `succeeded`, `failed`, or `timed_out`.
- Successful outcomes contain a verdict, confidence from 0 through 1, and evidence IDs.
- Reject duplicate, unexpected, or malformed specialist outcomes.
- Report expected specialists with no outcome as `missing`.
- Overall status is `complete` only when all expected specialists succeeded, otherwise `partial`.
- Set `needsReview` when any result is absent/non-successful, any confidence is below a threshold, or successful verdicts disagree.
- Preserve each specialist result and the union of evidence IDs in sorted deterministic order.
- Do not use majority vote to erase disagreement.

## 3. Example Input / Output

```text
identity=suspicious(.9), endpoint=suspicious(.8) -> complete, needsReview=false
identity=benign(.9), endpoint=suspicious(.8)     -> complete, needsReview=true
endpoint=timed_out, identity succeeds            -> partial, needsReview=true
expected malware outcome absent                  -> missing=[malware]
```

## 4. What the Interviewer Is Evaluating

- Typed partial-failure aggregation
- Deterministic ordering and validation
- Explicit disagreement and escalation behavior
- Restraint around confidence and majority voting

## 5. Concept Questions and Interview Answers

### Why not collapse outcomes to one verdict immediately?

**Interview answer:**

> A single value hides missing evidence, disagreement, and partial failure. Preserving typed source outcomes lets policy and a human make an informed decision.

### Why is majority vote weak among similar agents?

**Interview answer:**

> Agents may share the same model, prompt flaw, or bad source, so their errors are correlated. Agreement is a signal, not independent proof.
