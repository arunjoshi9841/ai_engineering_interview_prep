# Durable Agent Workflow

**Interviewer:** Design a durable workflow for an approved access-remediation request.

**Me:** I would model this as a durable state machine with explicit business steps. The approval event starts the workflow, but it does not mean every downstream action is complete.

The workflow record would contain the request ID, tenant, identity, approval reference, policy version, workflow version, current state, and timestamps. Each step would have its own record with an operation ID, attempt number, input hash, status, external request ID, and result summary. The audit history would be append-only.

A typical flow could be:

1. Verify the approval and current authorization.
2. Read the identity directory.
3. Revoke access in system A.
4. Revoke access in system B.
5. Notify the owner.
6. Mark the request complete.

The worker would claim a step with a lease. If it crashes, the lease expires and another worker can resume. Before executing a step, it checks whether the step is already complete. For APIs that support idempotency keys, I would send the stable operation ID. A retry would then be recognized as the same logical action.

The difficult case is a timeout after the external system accepted the request. We cannot assume success, and we cannot blindly repeat the action. I would first query the provider’s status or read the target’s current state. If the integration supports neither, the step becomes `indeterminate` and goes to a reconciliation queue or human operator.

Exactly-once message delivery would not solve this completely. The workflow database and an arbitrary external system usually cannot commit atomically together. So I would design for at-least-once delivery, idempotent operations where possible, and explicit reconciliation where necessary.

If system B fails after system A succeeds, I would not pretend the whole workflow rolled back. If restoring system A is safe and meaningful, we can use a compensating action. Otherwise, the workflow enters a clear partial-completion state that tells the operator exactly what happened and what remains.

For a workflow that waits days for approval, I would persist the state and wake it from an event or scheduled timer. Workers should not hold an in-memory process open. Workflow definitions would be versioned, and a running workflow would stay on its original version unless there is an explicit safety migration.

Operators need safe replay tools. They should be able to replay only a failed or reconciled step, with a fresh authorization check. A replay must not rerun already completed side effects.

**Interviewer:** How would you protect against an old approval being replayed?

**Me:** I would bind the approval to the tenant, identity, exact normalized action, workflow operation, policy version, and expiration time. Before execution, I would recheck authorization and current target state. If anything important changed, the approval is stale and the workflow needs a new decision.
