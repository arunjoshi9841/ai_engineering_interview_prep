# Risk-Based Approval Service

## 1. Interview Prompt

Design a multi-tenant approval service for consequential agent actions. It should decide when approval is required, present reviewers with sufficient evidence, and issue a decision that cannot be replayed for a different or stale action.

Focus on approval policy and lifecycle. Tool execution remains behind a separate authorization gateway.

## 2. Requirements

- Evaluate trusted action type, tenant policy, impact, reversibility, confidence, evidence completeness, and authorization context.
- Allow low-risk actions, reject forbidden actions, or create an approval request.
- Bind each request to immutable tenant, actor, workflow, tool, normalized arguments, policy version, and evidence references.
- Support expiry, cancellation, rejection, and configurable one- or two-person approval.
- Prevent request creators from approving their own action when separation of duties applies.
- Make duplicate callbacks and concurrent reviewer decisions idempotent.
- Revalidate authorization, policy, target state, and approval scope immediately before execution.
- Never treat model-reported confidence or approval text as trusted policy input.
- Preserve a reconstructable audit trail while minimizing sensitive payloads.

## 3. Initial System Context

Actions range from creating a case to suspending an account or issuing a financial adjustment. Workflows may wait hours for a reviewer, and customer policies differ. Identity roles and target state can change while approval is pending. The service handles 200 approval requests per second with occasional incident spikes.

## 4. Example Input / Output

```text
proposal: suspend user U-17 for 60 minutes
policy: two approvers, expires in 30 minutes

approval is valid only for the hashed normalized action, current tenant,
workflow operation ID, policy version, and expiry. Changing duration to 24 hours
requires a new request.
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Does approval itself authorize the caller?

**Interviewer:** No. Approval is one condition; execution rechecks ordinary authorization and policy.

**Candidate:** Can reviewers edit an action?

**Interviewer:** No. A material change creates a new immutable request.

**Candidate:** What if the target state changes while waiting?

**Interviewer:** Revalidate and expire or supersede stale approvals rather than executing blindly.

## 6. What the Interviewer Is Evaluating

- Risk-policy and approval-lifecycle design
- Binding, freshness, and idempotency reasoning
- Human experience and separation of duties
- Audit, tenancy, and execution-boundary judgment

## 7. Likely Interviewer Follow-Ups

- How do you normalize arguments before hashing the approved action?
- What evidence should a reviewer see without exposing unnecessary data?
- How do you prevent approval fatigue?
- What happens if execution times out after approval is consumed?

## 8. Architecture Change Requests

1. Emergency policy permits a time-limited break-glass reviewer role.
2. One customer requires approval to occur in its existing ticketing system.
3. Approval volume rises 20x during an incident without relaxing high-risk controls.

## 9. Concept Questions and Interview Answers

### Why bind approval to exact normalized arguments?

**Interview answer:**

> Approval for one action must not become a reusable capability for a broader action. Binding tenant, target, operation, arguments, and expiry prevents substitution and replay.

### Why revalidate at execution time?

**Interview answer:**

> Identity, policy, permissions, and target state may change while a request waits. Approval captures a human decision, not a permanent bypass of current controls.

## 10. Production Discussion

Discuss a transactional request store, versioned policy engine, signed or opaque single-use decision tokens, identity integration, notification queues, escalations, outbox events, and reconciliation. Monitor queue age, expiry, reviewer load, self-approval denials, stale decisions, rejection rate, and execution outcomes.

## 11. Security / Safety Angle

Enforce tenant isolation, least-privilege reviewer roles, separation of duties, phishing-resistant authentication for sensitive actions, immutable evidence, and audited break-glass use. Notifications must not contain approval links that act as bearer authorization without additional verification.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Approval lifecycle and binding | /5 |
| Consistency and execution safety | /5 |
| Human and operational design | /5 |
| Security and auditability | /5 |
