# Risk-Based Approval Service

**Interviewer:** Design an approval service for consequential agent actions.

**Me:** I would separate risk evaluation from execution. The model can propose an action, but a deterministic policy service decides whether it is allowed automatically, rejected, or sent for approval.

The request would include the authenticated actor, tenant, workflow, tool, normalized arguments, target, evidence references, policy version, and operation ID. The approval service evaluates action type, impact, reversibility, authorization, evidence completeness, and tenant policy. Model-reported confidence can be a signal, but it cannot be trusted as policy input.

An approval request would be immutable and bound to the exact normalized action. For example, approval to suspend user U-17 for 60 minutes must not authorize the same user for 24 hours. The binding should include the tenant, actor, target, tool, arguments hash, workflow operation, policy version, evidence references, required number of approvers, and expiration time.

The lifecycle could be `created`, `pending`, `approved`, `rejected`, `expired`, `cancelled`, `superseded`, or `consumed`. A one-person or two-person rule would come from policy. Separation of duties prevents the person or workflow that created the request from approving it when required.

Reviewer views should show enough evidence to make a decision without exposing unnecessary sensitive content. I would use governed references, redacted previews, source timestamps, and the reason the policy requested approval. The approval decision itself should be stored as an append-only event.

Duplicate callbacks and concurrent decisions need conditional updates. Only the first valid transition from `pending` should win. A callback for an already completed request returns the existing result rather than applying a second decision.

Approval is not permanent authorization. Immediately before execution, the tool gateway rechecks identity, permissions, current policy, target state, approval scope, and expiry. If the target changed or the policy was revoked, the approval becomes stale and execution stops.

For emergency break-glass access, I would require a narrowly scoped role, strong authentication, short expiry, reason, second-party visibility where practical, and a complete audit trail. It should be an exception path, not a general bypass.

**Interviewer:** What if execution times out after the approval is consumed?

**Me:** The approval should be tied to a stable operation ID. The executor reconciles the external state before retrying. The approval is not reused for a materially different action, and an indeterminate result remains visible until resolved.

**Interviewer:** How do you prevent approval fatigue?

**Me:** Use policy thresholds, risk grouping, clear evidence summaries, expiration, escalation, and batching only for genuinely equivalent low-risk actions. High-impact actions should remain individually understandable.
