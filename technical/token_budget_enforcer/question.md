# Token Budget Enforcer

## 1. Interview Prompt

An agent workflow can make several model calls, but each run has a fixed token budget. Implement a budget enforcer in a language of your choice that reserves estimated tokens before a call and reconciles the reservation when actual usage is known.

Keep the first version in memory for one workflow and one process. Do not implement model routing, pricing, or distributed persistence.

## 2. Requirements

- Initialize the enforcer with a positive maximum token budget.
- `reserve` atomically accepts or rejects a positive estimate.
- Accepted reservations immediately reduce the tokens available to concurrent calls.
- `settle` records actual non-negative usage once and releases any unused reservation.
- Actual usage may exceed the estimate; account for the overage even if the workflow becomes over budget.
- A reservation can be cancelled before settlement, returning all reserved tokens.
- Reject unknown, cancelled, or already-settled reservation IDs.
- Once available budget is zero or lower, new reservations must fail with `budget_exhausted`.
- Expose a summary of limit, reserved, consumed, and available tokens.

## 3. Example Input / Output

```text
limit = 1,000
reserve(600) -> r1
reserve(500) -> budget_exhausted
settle(r1, 450)
summary      -> consumed=450, reserved=0, available=550

reserve(500) -> r2
settle(r2, 650)
summary      -> consumed=1,100, available=-100
```

## 4. What the Interviewer Is Evaluating

- Reservation-based accounting under concurrency
- State-transition and invariant reasoning
- Honest handling of estimation error
- Separation of enforcement from model and pricing concerns

## 5. Concept Questions and Interview Answers

### Why reserve before making the model call?

**Interview answer:**

> Without a reservation, several parallel calls can each observe the same remaining budget and collectively overspend it. Reserving turns the estimate into committed capacity until actual usage is settled.

### Should the system discard actual usage that exceeds the budget?

**Interview answer:**

> No. The provider already consumed it, so accounting must record the overage. Enforcement affects future work; it should not falsify observed usage.
