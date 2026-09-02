# Enterprise Tool Gateway

**Interviewer:** Design a gateway through which AI agents invoke customer-approved enterprise tools.

**Me:** I would make the gateway the security and reliability boundary between model intent and real-world side effects. The model can propose an action, but the gateway decides whether that exact action is allowed.

The request would include the authenticated caller, tenant, workflow, operation ID, tool name, tool version, normalized arguments, policy context, and requested action. The gateway would then perform several checks:

1. Is this tool enabled for the tenant and workflow?
2. Is the caller allowed to use it?
3. Do the arguments match the schema and allowed ranges?
4. Is the action read-only, reversible, or consequential?
5. Does it require approval?
6. Is the request a duplicate or retry?

Only after those checks would the gateway obtain a narrowly scoped credential and call the connector. Secrets would stay in a secret manager and would never be returned to the model or written to ordinary logs.

I would avoid making the gateway one giant codebase. Each connector would implement a standard contract describing capabilities, schemas, authentication, timeout behavior, retry rules, idempotency support, and response normalization. The gateway owns the common policy, authorization, rate limiting, audit, and lifecycle logic. Connector-specific behavior stays in adapters.

For a retried `create_case` request, the stable operation ID becomes the idempotency key. The gateway stores the operation state and passes the key downstream when supported. If the downstream call succeeds but the response is lost, the gateway first checks status before trying again. If the legacy system has no idempotency support or status API, the result is indeterminate and needs reconciliation rather than an automatic blind retry.

The gateway should return structured outcomes such as `completed`, `rejected`, `approval_required`, `pending`, `failed_retryable`, or `indeterminate`. Every outcome should have a safe message, operation ID, and audit reference. Audit records should include the initiating identity, tenant, policy decision, validated argument summary, connector version, and external outcome. Sensitive values should be redacted or referenced securely.

To prevent a read tool from becoming a data-exfiltration path, I would enforce filters, row limits, field allowlists, pagination limits, and purpose-based access. A user who may view one customer record should not automatically be able to export the entire database through an agent.

I would apply tenant-aware rate limits and reserve capacity for important traffic. A high-volume read-only customer should not starve other tenants. Each connector would have health checks, circuit breakers, and a clear retry classification.

New customer connectors would go through schema validation, permission review, security testing, contract tests, and operator approval before becoming available to agents. Policy changes and emergency revocations would be versioned and audited.

**Interviewer:** How is schema validation different from authorization?

**Me:** Schema validation asks whether the request is well formed. Authorization asks whether this identity, tenant, workflow, and policy may perform that specific action with those arguments. A request can pass one check and fail the other, so we need both outside the model.

**Interviewer:** What is the most important safety rule here?

**Me:** Never let model output directly become authority. The gateway must independently enforce identity, tenant scope, policy, approval, argument limits, and idempotency before any external side effect occurs.
