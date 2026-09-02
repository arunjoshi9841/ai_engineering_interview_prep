# Multi-Tenant Agent Platform

## 1. Interview Prompt

Design the platform that lets enterprise customers configure, deploy, and operate AI agents that use different models and approved enterprise integrations. Explain the first production version you would build and the boundaries you would preserve as customers, agents, and integrations grow.

## 2. Requirements

- Customer administrators can configure an agent, its approved tools, and its risk policy.
- Users and enterprise events can start an agent run and receive a durable status or result.
- Customer data, credentials, policy, and audit history must remain isolated.
- The platform must support different model providers and customer deployment constraints without coupling every workflow to one vendor.
- High-risk actions need an approval path; failures must be visible and recoverable.

## 3. Initial System Context

Assume customer administrators use a control-plane API, while agent runs invoke models, retrieval, and customer systems through configured integrations. Customers may require different identity providers and deployment environments. The interviewer is interested in component boundaries, state ownership, and the critical request path—not a cloud-vendor-specific diagram.

## 4. Example Input / Output

**Input:** Tenant `northwind` enables an invoice-review agent with read-only finance tools and a policy that requires approval before creating an exception.

**Outcome:** A run is accepted with a traceable run ID. It can report `completed`, `awaiting_approval`, or `failed_recoverably`, without exposing another tenant's configuration, data, or credentials.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Do all customers share the same runtime, or must the design support dedicated deployments?

**Interviewer:** Support both as deployment options; explain which control-plane concerns remain common.

**Candidate:** Which actions can an agent perform automatically?

**Interviewer:** Read-only work and low-risk drafts may be automatic. Consequential changes require policy evaluation and may require approval.

**Candidate:** Is immediate response required for every run?

**Interviewer:** No. Long-running work may be asynchronous, but callers need reliable status.

## 6. What the Interviewer Is Evaluating

- Separation of control plane, execution, and enterprise integration concerns
- Tenant isolation and authorization design
- Durable workflow state, model abstraction, and bounded autonomy
- Practical reliability, observability, and scaling judgment

## 7. Likely Interviewer Follow-Ups

- Which data needs strong consistency, and where is eventual consistency acceptable?
- How would you stop a compromised or malfunctioning agent across all active runs?
- How would you prevent one tenant's traffic or model budget from affecting another's?
- What identity and policy context must accompany a tool call?

## 8. Architecture Change Requests

1. A customer requires its model calls and agent runtime to run in its own environment while still using the shared control plane.
2. Usage grows twentyfold, with a few tenants producing most of the asynchronous work.
3. A new model provider is added, but its structured-output and audit capabilities differ from existing providers.

## 9. Concept Questions and Interview Answers

### Why should agent workflow state be separate from model context?

**Interview answer:**

> Model context is transient and probabilistic; it is not a reliable record of business progress. I would persist run state, approvals, completed side effects, and retry metadata outside the model so a run can be audited and resumed safely.

### What does tenant isolation mean beyond adding a tenant ID to requests?

**Interview answer:**

> The tenant context has to constrain every boundary: authentication, authorization, data access, retrieval, credentials, quotas, logs, and audit queries. A tag without enforced checks at those boundaries is only a convention.

## 10. Production Discussion

Discuss per-tenant quotas and backpressure, stateless execution workers, durable run state, provider health and fallback policy, configuration rollout, and telemetry that links a user request to model calls, retrieval, tool calls, approvals, and final outcome.

## 11. Security / Safety Angle

How would you ensure a model cannot expand its own tool permissions, use a credential belonging to another customer, or turn untrusted retrieved content into an unauthorized action?

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| System boundaries and state design | /5 |
| Tenant isolation and security | /5 |
| Reliability and observability | /5 |
| Tradeoff and scaling judgment | /5 |
