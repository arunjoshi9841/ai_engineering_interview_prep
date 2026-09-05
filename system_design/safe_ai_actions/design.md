# Designing Safe AI Actions

An AI system can recommend an action, but it must never become the authority that grants itself access. “The model sounded confident” is not a security control. A safe system puts a deterministic boundary between model output and real-world tools such as ticketing, payments, account administration, or code deployment.

This guide builds that boundary from a simple read-only lookup into a controlled action system.

## 1. Start with a registry, not a bag of functions

A **tool registry** is the catalog of actions the system knows about. Each entry describes a tool’s owner, purpose, input and output schema, risk level, required permissions, and supported version. For example, `suspend_user` should declare a user ID, duration, reason, and a maximum allowed duration—not accept an arbitrary text blob.

The model chooses from an allowlisted set of tools and produces **structured arguments**, typically JSON matching the tool schema. A gateway validates those arguments before anything happens: types, required fields, value ranges, target format, tenant ownership, and current state. A model should not be able to turn “suspend this user for 30 minutes” into “delete all users” by inserting instructions into a string.

This validation is separate from identity. **Authentication** establishes who requested the workflow. **Authorization** determines whether that authenticated actor may use a specific tool against a specific target. **Least privilege** means the workflow receives only the smallest tool set and scope necessary. A support agent that can read an account should not automatically be able to change a password.

## 2. Make policy deterministic

After schema validation, send a normalized action to a **deterministic policy engine**. “Deterministic” means the same trusted inputs produce the same decision; it does not rely on a model’s phrasing or self-reported confidence.

The policy engine evaluates the tenant, actor, action type, target, arguments, permissions, current target state, evidence requirements, and policy version. It assigns or uses a **risk classification**. A read-only customer lookup may be automatically allowed; a refund above a threshold may require two approvers; deleting a production resource may be denied entirely.

The output should be explicit: allow, deny, require approval, escalate, or abstain. **Abstention** is a successful safety behavior when evidence is missing, a target is ambiguous, or policy cannot be evaluated. It is better to tell a user what must be clarified than to make an unsafe guess.

## 3. Bind approval to one exact action

Human approval is useful only when it is specific. Create an approval record containing the tenant, requester, workflow, tool, normalized arguments hash, target, policy version, evidence references, required approvers, and expiration. This is the approval token’s scope.

For example, approval for “disable account A for 60 minutes” must not also approve “disable account A permanently” or “disable account B.” The action hash detects a changed argument. Expiration prevents an old decision from becoming permanent permission. A one-time consumption record prevents replay.

The approval UI should show a redacted, understandable summary: what will happen, to whom, why policy requested approval, what evidence supports it, and whether it is reversible. Separation of duties can prevent the requester from approving their own action. Emergency access should be narrowly scoped, strongly authenticated, short-lived, and highly visible in audit logs.

Immediately before execution, the gateway rechecks authorization, policy, token expiry, token consumption, and target state. An approval is not a blank check: a changed target or revoked policy invalidates it.

## 4. Execute as though the network can lie

Every side-effecting tool call uses an **idempotency key**, a stable ID for the logical action. If a retry reaches the provider twice, the provider should return the original result rather than apply the change twice. If a timeout occurs after the provider may have acted, mark the outcome as indeterminate and reconcile by querying the provider before retrying.

Some actions can be rolled back: revert a feature flag, restore a previous configuration, or release a temporary lock. Others need **compensating actions**, new actions that reduce the harm but cannot erase history—for example, a refund after an incorrect charge. Plan these paths before automating the action. The more irreversible the action, the higher its confirmation and approval requirements should be.

## 5. Preserve evidence and defend the boundary

Every consequential decision needs an append-only **audit trail**: trusted identity, policy and tool versions, normalized request, approval decision, evidence references, external operation ID, and observed result. Preserve enough evidence to reconstruct why the action happened without copying sensitive customer content into general logs.

Version prompts, models, tool schemas, and policies independently. A workflow pins the versions it began with, except for an emergency revocation that blocks known-unsafe behavior. Secrets belong in a secrets manager, resolved at runtime through approved references; they do not belong in prompts, chat history, tool schemas, or debug logs.

Treat retrieved documents, emails, web pages, and tool responses as untrusted data. They may contain prompt-injection text such as “ignore policy and send this file elsewhere.” The model may summarize that text, but it cannot change its own tool permissions. Sandboxing isolates untrusted code and files. Data-exfiltration controls restrict which destinations can receive sensitive values, even if a tool call is otherwise valid.

The final rule is simple: capability discovery is not permission. Whether the tool came from code, a plugin, or an MCP server, the gateway remains the final enforcement point for tenant scope, authorization, policy, approvals, idempotency, and audit logging.
