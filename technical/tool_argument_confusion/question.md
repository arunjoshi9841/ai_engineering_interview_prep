# Tool Argument Confusion

## 1. Interview Prompt

An agent proposes arguments for a privileged `suspend_user` tool. A staging test showed that a request containing `"approved": "false"` executed, and another request selected a tenant supplied by the model. Diagnose the provided boundary, identify the unsafe assumptions, and describe a concrete correction and test plan.

Do not redesign the complete tool platform. Focus on runtime argument handling and the boundary between model data and trusted execution context.

## 2. Requirements

Your diagnosis should:

- Identify which fields are model-proposed and which must come only from authenticated or approval context.
- Explain how implicit type coercion and permissive parsing can change the meaning of inputs.
- Identify malformed, extra, and ambiguous values that the code accepts.
- Define a strict external argument contract for the tool.
- Keep authorization and approval checks separate from schema validation.
- Recommend tests that prove rejected inputs cannot reach the handler.
- Define safe error and audit behavior without logging sensitive reasons or identifiers unnecessarily.

## 3. Provided Code

```text
interface TrustedContext {
  tenantId: string;
  approvalGranted: boolean;
}

function buildSuspendArgs(raw: unknown, context: TrustedContext) {
  const input = raw as Record<string, unknown>;

  return {
    tenantId: String(input.tenantId ?? context.tenantId),
    userId: String(input.userId),
    durationMinutes: parseInt(String(input.durationMinutes), 10),
    notifyUser: Boolean(input.notifyUser),
    approved: Boolean(input.approved ?? context.approvalGranted),
    reason: String(input.reason ?? ""),
  };
}

export async function dispatchSuspend(raw: unknown, context: TrustedContext) {
  const args = buildSuspendArgs(raw, context);

  if (!args.approved || args.durationMinutes > 1440) {
    return { ok: false, reason: "rejected" };
  }

  return suspendUser(args);
}
```

Observed inputs include `{"approved":"false"}`, `{"notifyUser":"false"}`, `{"durationMinutes":"30minutes"}`, missing `userId`, and an extra `tenantId`.

## 4. Example Input / Output

```text
input: { approved: "false", notifyUser: "false", durationMinutes: "30minutes" }
current interpretation: approved=true, notifyUser=true, durationMinutes=30

input: { tenantId: "other-tenant", userId: 42, durationMinutes: -10 }
current interpretation: tenant selected by model, userId="42", negative duration accepted

required outcome: ambiguous or out-of-contract model arguments are rejected before handler invocation; trusted fields cannot be overridden
```

## 5. What the Interviewer Is Evaluating

- Evidence-based diagnosis of coercion and trust-boundary failures
- Strict runtime-contract design
- Separation of validation, authorization, and approval
- Adversarial test and audit reasoning

## 6. Concept Questions and Interview Answers

### Why is coercion dangerous at a privileged boundary?

**Interview answer:**

> Coercion can turn invalid input into a valid-looking but different command. At a privileged boundary I would reject ambiguity so the executed action has exactly the meaning that was validated and approved.

### Why should trusted context not be merged with model arguments?

**Interview answer:**

> A generic merge makes field precedence easy to get wrong and can let untrusted data shadow identity or policy. I would construct an internal command explicitly from validated model fields and separately supplied trusted fields.
