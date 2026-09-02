# Policy-Aware Tool Registry

## 1. Interview Prompt

An enterprise agent can propose calls to a small set of registered tools. Implement the registry boundary that decides whether a proposed call may run. The model is not an authority: the registry must use the caller's authenticated policy context and the tool's declared policy.

Keep the first version in memory and focus on a clear TypeScript API rather than an HTTP server or model integration.

## 2. Requirements

- A tool has a unique name, an input validator, a required permission, and a risk level.
- A caller has a tenant ID and a set of permissions.
- `dispatch` accepts a proposed tool name and arguments, then either invokes the registered handler or returns a typed rejection.
- Reject unknown tools, invalid arguments, and callers without the required permission. A rejected call must not invoke a handler.
- Record an audit event for every decision, without putting raw secret values into the event.
- The initial scope is a single process; persistence and human approval are follow-up topics.

## 3. Example Input / Output

With a registered `lookup_invoice` tool requiring `invoice:read`:

```ts
await registry.dispatch(
  { tenantId: "acme", permissions: new Set(["invoice:read"]), requestId: "r-17" },
  { toolName: "lookup_invoice", args: { invoiceId: "inv-42" } },
);
// { ok: true, value: { invoiceId: "inv-42", status: "open" } }

await registry.dispatch(
  { tenantId: "acme", permissions: new Set(), requestId: "r-18" },
  { toolName: "lookup_invoice", args: { invoiceId: "inv-42" } },
);
// { ok: false, reason: "forbidden" }
```

## 4. What the Interviewer Is Evaluating

- TypeScript API and runtime-validation design
- Separation of model intent, authorization, and execution
- Safe error handling and auditability
- Clear boundaries for privileged enterprise integrations

## 5. Concept Questions and Interview Answers

### Why should authorization not be delegated to the model?

**Interview answer:**

> Model output is untrusted intent, not a security decision. The application needs deterministic policy checks against an authenticated identity before it grants access or performs a side effect.

### Why validate tool arguments at runtime when TypeScript types exist?

**Interview answer:**

> Types disappear at the process boundary. Tool arguments may come from a model, a client, or an external system, so runtime validation protects the actual data that reaches a privileged handler.
