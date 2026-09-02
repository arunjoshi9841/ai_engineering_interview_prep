# Multi-Tenant Agent Platform

**Interviewer:** Design a platform for enterprise customers to configure and run AI agents.

**Me:** Sure. I’ll start by clarifying the boundaries. Customers should be able to configure an agent, choose approved tools, define risk rules, and start runs. A run might finish immediately, or it might take a while and wait for approval. The most important requirements are tenant isolation, durable state, safe tool access, and support for multiple model providers.

I would split the platform into four main areas:

1. A control plane for tenant settings, agent definitions, policies, model configuration, and tool registration.
2. An execution plane that runs workflows asynchronously and stores durable run state.
3. A tool gateway that is the only path for agent-initiated calls into customer systems.
4. A model gateway that hides provider-specific details such as authentication, retries, rate limits, and structured output support.

When a user starts a run, the API authenticates the user and checks the tenant policy. It creates a durable run record and returns a run ID quickly. A queue then picks up the work. Workers load the pinned agent and policy versions, gather permitted context, call the model, and ask the tool gateway to perform any actions.

I would keep workflow state outside the model context. The database would store the current state, completed steps, approval status, retry information, and idempotency keys. The model can help decide what to do next, but it should not be the source of truth for whether an access change or financial action already happened.

For tenant isolation, I would enforce tenant scope at every boundary, not just put a tenant ID in a request. That includes databases, object storage, retrieval, credentials, queues, caches, logs, quotas, and audit queries. Each request should carry an authenticated identity, tenant, workflow, and policy context that downstream services verify.

Low-risk and read-only actions can run automatically. A consequential action should go through deterministic policy checks and possibly human approval. The model can suggest an action, but it cannot grant itself permission.

For scale, I would use stateless workers, partitioned queues, per-tenant quotas, and backpressure. A noisy tenant should not be able to consume all worker capacity or model budget. Run state and audit events would be durable, while detailed traces and temporary context could have different retention policies.

**Interviewer:** What if a customer needs a dedicated environment?

**Me:** I would keep the shared control plane for configuration, policy, and status, but deploy the execution plane, model calls, retrieval, and credentials inside that customer’s environment. The same contracts and audit events should work in both shared and dedicated modes.

**Interviewer:** How would you stop a bad agent across active runs?

**Me:** I would support version revocation and a kill switch in the policy service. Workers would check that state before starting sensitive steps, and the tool gateway would check it again before every consequential action. That gives us a fast enforcement point even if a worker has stale context.
