# Enterprise Tool Gateway

## 1. Interview Prompt

Design a central gateway through which AI agents invoke customer-approved enterprise tools. It must let teams add integrations without giving models unrestricted access to customer systems, while preserving dependable execution and an audit trail.

## 2. Requirements

- Accept a proposed tool action with authenticated actor, tenant, workflow, and policy context.
- Enforce tool allowlists, authorization, input schemas, risk rules, and approval requirements outside the model.
- Manage scoped credentials and protect secrets from models, callers, and logs.
- Apply timeouts, rate controls, retries, and idempotency according to each tool's behavior.
- Return safe, structured results and emit auditable records for successful, failed, rejected, and pending actions.

## 3. Initial System Context

Agents use customer-specific REST, GraphQL, and legacy adapters. Some calls are read-only; others create tickets, alter records, or request a security action. Tool descriptions and outputs may contain untrusted text, and integrations have different authentication methods, limits, and response semantics.

## 4. Example Input / Output

**Input:** An agent proposes `create_case` with an incident payload and a workflow identity. The same request may be retried after a client timeout.

**Outcome:** The gateway returns a structured execution, rejection, or approval-pending result. A retry cannot create an indistinguishable second case, and the audit record identifies the initiating identity, authorization decision, validated arguments, and external outcome.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is the gateway the only path to every integration?

**Interviewer:** Treat it as the required path for agent-initiated actions; existing non-agent applications may have separate paths.

**Candidate:** How are policies defined and who owns them?

**Interviewer:** Customer administrators define policy within platform guardrails. Policy changes must be auditable and take effect predictably.

**Candidate:** Should the gateway automatically retry all errors?

**Interviewer:** No. Retries depend on the operation's idempotency, error category, and downstream health.

## 6. What the Interviewer Is Evaluating

- Clear separation of model intent from application authorization
- Integration contract, secret, and credential-boundary design
- Reliability controls for heterogeneous external systems
- Auditability, policy evolution, and operational judgment

## 7. Likely Interviewer Follow-Ups

- How would you represent tool capabilities and risk levels without making the gateway a giant integration monolith?
- What happens if a tool succeeds but the network response is lost?
- How would you prevent an agent from using a read tool to exfiltrate an entire sensitive dataset?
- Which actions require a human approval even when the caller is authorized?

## 8. Architecture Change Requests

1. Customers want to publish new connectors, but platform operators must review their permissions and schemas before agents can use them.
2. A high-volume read-only tool becomes a noisy-neighbor risk for other tenants.
3. One critical legacy integration has no idempotency support and only exposes a delayed status export.

## 9. Concept Questions and Interview Answers

### How are schema validation and authorization different?

**Interview answer:**

> Schema validation checks that a request is well formed. Authorization decides whether this identity, tenant, workflow, and policy may perform that specific operation with those arguments. Both are required, and neither should rely on model compliance.

### Why is least privilege especially important for agent tools?

**Interview answer:**

> Agents consume untrusted inputs and can make imperfect decisions, so a broad credential turns a single mistake into a large blast radius. Narrow tools, scopes, and argument constraints reduce what any one workflow can do.

## 10. Production Discussion

Discuss connector contract tests, versioned policies and schemas, per-tool health and circuit breakers, tenant-aware rate limits, credential rotation, replay-safe audit events, dependency dashboards, and safe redaction of request and response data.

## 11. Security / Safety Angle

How would you contain direct or indirect prompt injection, malicious tool output, confused-deputy attacks, secret disclosure, and policy bypass attempts at this boundary?

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Security boundary and authorization | /5 |
| Integration and reliability design | /5 |
| Auditability and operations | /5 |
| Tradeoff reasoning | /5 |
