# Customer-Facing Agent API

**Interviewer:** Design an API for starting agent runs, streaming results, inspecting jobs, cancelling work, and retrieving outputs.

**Me:** I would make the API resource-oriented and support three execution modes: synchronous for short work, streaming for interactive turns, and asynchronous for long-running workflows. The API returns a durable run or job resource as soon as the request is accepted.

Authentication comes from OAuth or a service account. The application derives tenant, user, workflow, and regional authorization from trusted identity context. Clients can select only registered tenant-approved workflow versions. They cannot provide arbitrary prompts, tools, models, or budgets that bypass policy.

For submission, the client sends a scoped idempotency key. The server stores the key with the resulting run ID, so a retry returns the same resource. The key must be scoped by tenant and operation type to prevent collisions or result leakage.

Interactive results can use server-sent events with monotonically increasing event IDs. The client reconnects with `after=41`, and the server resumes from event 42. Events are retained long enough for expected reconnects. The durable event store, not the open connection, is the source of truth.

Cancellation changes the durable state to `cancelling` and propagates a cancellation signal to workers. If an external tool may already have acted, the API returns `indeterminate` or `reconciling`, not a misleading success. Status, citations, approval state, usage, and safe error details are structured fields.

The gateway enforces authentication, object-level authorization, payload limits, rate limits, quotas, and fair use. The application handles workflow lifecycle, idempotency, streaming fan-out, and audit events. Regional routing and customer-managed keys can be selected from tenant policy.

**Interviewer:** How do you evolve a streaming contract?

**Me:** Version the event envelope and keep old versions available during a compatibility window. Add fields compatibly where possible, publish a new API version for breaking changes, and provide SDKs that understand both versions.

**Interviewer:** What happens during a regional failure?

**Me:** New requests follow the tenant’s regional policy and may fail over only to an approved region. Running jobs keep durable state and can resume where policy allows. For a customer requiring private or region-local processing, I would fail closed rather than move data somewhere prohibited.
