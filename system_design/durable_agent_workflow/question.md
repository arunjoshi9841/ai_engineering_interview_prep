# Durable Agent Workflow

## 1. Interview Prompt

Design a durable agent workflow for an approved access-remediation request. The workflow verifies evidence, applies changes through several enterprise systems, notifies an owner, and must remain correct when workers crash, events are delivered again, or an integration's outcome is unknown.

## 2. Requirements

- Record the request, identity, policy context, approval, and each business step durably.
- Do not execute the same externally visible side effect twice because of retries or redelivery.
- Make partial completion and pending work understandable to operators.
- Support a safe resolution path when one completed action cannot be rolled back.
- Do not depend on an LLM conversation as the source of truth for workflow state.

## 3. Initial System Context

An approval event starts the workflow. It may query an identity directory, change permissions in two external systems, and send a notification. Each dependency has independent availability and may time out after accepting a request. The model may help summarize evidence, but deterministic workflow transitions govern side effects.

## 4. Example Input / Output

**Input:** The second permission system times out after receiving a revoke request; the worker then crashes before recording a response.

**Outcome:** On recovery, the workflow can determine or safely reconcile the next action without assuming either that the revoke succeeded or that it is safe to repeat blindly.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Are all changes reversible?

**Interviewer:** No. Some systems can restore access, while others require a manual corrective process.

**Candidate:** Can every downstream API accept an idempotency key or return a request status?

**Interviewer:** No. Explain how your design copes with weaker legacy integrations.

**Candidate:** What is the expected behavior after an unrecoverable step fails?

**Interviewer:** The request must remain auditable and enter a clear recovery or escalation state rather than disappearing.

## 6. What the Interviewer Is Evaluating

- Durable state-machine and state-ownership reasoning
- Idempotency, retries, reconciliation, and compensation tradeoffs
- Clear distinction between workflow success and uncertain external side effects
- Operational recovery and audit design

## 7. Likely Interviewer Follow-Ups

- Where would you place idempotency state, and how long would you retain it?
- When would you compensate a prior action versus ask a human to reconcile?
- How would concurrent remediation requests for the same identity be serialized or detected?
- What events and metrics would help an operator resolve stuck workflows?

## 8. Architecture Change Requests

1. The workflow now waits days for a manager decision and must survive deployment and schema changes.
2. One legacy system only supports periodic exports, so its final state is observed asynchronously.
3. Operators need to replay a failed step without replaying already completed side effects.

## 9. Concept Questions and Interview Answers

### Why is exactly-once delivery not enough to guarantee exactly-once effects?

**Interview answer:**

> A broker can control delivery, but it cannot atomically commit an arbitrary external side effect and my workflow record. I design for at-least-once delivery and make each logical effect idempotent or reconcilable.

### What is a compensating action?

**Interview answer:**

> It is a new business action that mitigates an earlier completed step when a later step fails. It is not a database rollback, so I only use it when it is safe and meaningful; otherwise I escalate with the exact state recorded.

## 10. Production Discussion

Discuss workflow versioning, lease or concurrency control, timeout policies, dead-letter and recovery queues, outbox-style event publication, dependency health, replay tooling, and alerts for stuck, repeatedly retried, or manually resolved workflows.

## 11. Security / Safety Angle

How would you prevent an old approval, a forged callback, or an operator replay from applying a broader or stale access change? Include authorization, expiration, audit, and least-privilege considerations.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Durable state and recovery design | /5 |
| Idempotency and consistency reasoning | /5 |
| Operational observability | /5 |
| Security and safety judgment | /5 |
