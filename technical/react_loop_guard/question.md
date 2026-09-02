# ReAct Loop Guard

## 1. Interview Prompt

An agent alternates between model reasoning and tool actions. Implement the deterministic guard that decides whether a proposed next step may continue, must stop, or must escalate before any tool executes.

Do not implement the model or tools. Focus on bounded control flow for one workflow.

## 2. Requirements

- Enforce configured limits for total steps, tool calls, tokens, and elapsed time.
- Reject tools outside the workflow allowlist.
- Escalate proposals marked high risk or requiring approval.
- Detect the same normalized tool name and argument signature proposed three times consecutively.
- `finish` may stop successfully only with non-empty final text.
- Budget exhaustion stops without executing the proposal; policy violations escalate.
- Return a stable reason code and never mutate the input state.
- Model-provided counters or claims of approval are ignored.

## 3. Example Input / Output

```text
allowed low-risk tool within all budgets -> continue
third consecutive identical tool action  -> escalate: repeated_action
high-risk tool                            -> escalate: approval_required
stepsUsed equals maxSteps                 -> stop: step_budget
finish with blank text                    -> escalate: invalid_finish
```

## 4. What the Interviewer Is Evaluating

- Explicit termination and policy ordering
- Immutable, testable decision logic
- Budget and loop-detection reasoning
- Separation of model proposals from trusted control state

## 5. Concept Questions and Interview Answers

### Why should loop limits live outside the prompt?

**Interview answer:**

> Prompt instructions are probabilistic and can be ignored or displaced. The controller must enforce time, cost, tool, and action limits deterministically before execution.

### Why stop on actual usage rather than model-reported usage?

**Interview answer:**

> The model is not the accounting authority. Usage and approvals must come from trusted platform state so the model cannot extend its own budget.
