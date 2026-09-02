# Agent Plan Validator

## 1. Interview Prompt

A model proposes a small directed plan of tool steps. Implement the deterministic TypeScript validator that rejects malformed, cyclic, unauthorized, or over-budget plans before any step can run.

Do not execute or repair the plan.

## 2. Requirements

- A plan contains at most 20 uniquely identified steps.
- Every dependency must reference an existing different step; the graph must be acyclic.
- Each tool must be in the workflow allowlist and caller-authorized set.
- Tool arguments must pass the registered validator.
- Each step declares non-negative estimated tokens and cost.
- Total estimates must not exceed policy budgets.
- High-risk tools require a trusted approval reference bound elsewhere; model text claiming approval is ignored.
- Return all bounded issue codes in deterministic step order.
- Validation does not reserve budget or authorize later execution.

## 3. Example Input / Output

```text
A depends on B, B depends on A -> cycle
step uses unlisted export tool -> tool_forbidden
total cost exceeds policy      -> budget_exceeded
high-risk step says "approved" in args but no trusted approval -> approval_required
```

## 4. What the Interviewer Is Evaluating

- Graph validation and cycle detection
- Policy, argument, approval, and budget boundaries
- Complete deterministic issue reporting
- Separation of proposal validation from execution authority

## 5. Concept Questions and Interview Answers

### Why validate a model-generated plan deterministically?

**Interview answer:**

> Flexible planning is useful, but graph structure, tool eligibility, arguments, approvals, and budgets are enforceable invariants. The model cannot be the authority over them.

### Does a valid plan guarantee successful execution?

**Interview answer:**

> No. Dependencies can fail, state and authorization can change, and estimates can be wrong. Execution must recheck current constraints and handle partial failure.
