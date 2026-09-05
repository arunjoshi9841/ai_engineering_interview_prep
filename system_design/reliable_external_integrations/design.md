# Building Reliable External Integrations

An integration is the boundary between your system and someone else’s system. That other system may expose a REST or GraphQL API, an old SOAP service, a webhook, a polling endpoint, a message queue, a daily CSV file, or an MCP server. The protocols differ, but the fundamental problem is the same: external systems fail, evolve, duplicate messages, and use concepts that do not perfectly match yours.

The goal is not to make those differences disappear. It is to confine them to a reliable, observable boundary.

## 1. Give each external system an adapter

Start by defining a small **canonical internal model**: the names and shapes your own product uses for concepts such as customer, invoice, incident, or action result. Then build an adapter for each provider that translates between that model and the provider’s protocol. This is an **anti-corruption layer**: it prevents provider-specific field names, odd status codes, and limitations from leaking across the rest of the codebase.

For example, one CRM may call a customer an `Account`, another a `Company`, and a legacy database may identify it with two columns. Their adapters can all produce an internal `Customer` object. The same pattern works for inbound and outbound flows:

- **Inbound integrations** bring external changes into the system: webhooks, queue events, polls, and files.
- **Outbound integrations** push a command or update to a provider.

REST is resource-oriented HTTP; GraphQL allows a client to request a specific data shape; SOAP is an older XML-based contract; files are batch transfers; event streams and queues deliver change notifications. Pick the protocol the provider supports, but keep the business meaning behind the adapter.

## 2. Make inbound data trustworthy and durable

When a provider calls a webhook endpoint, first verify its signature and timestamp. A valid-looking JSON body is not proof of origin. Resolve the tenant from a trusted provider mapping, store the raw event as evidence, create a canonical event record, and enqueue processing. Acknowledge quickly; slow enrichment should happen asynchronously.

Events are usually delivered **at least once**, so deduplicate with the provider event ID or a carefully designed content key. They can arrive out of order: an “updated” event may arrive before “created,” or version 8 may arrive after version 9. Store the external version when available and apply only newer state. Where ordering cannot be guaranteed, let a reconciliation job compare the provider’s current state with yours.

Polling is necessary when webhooks are unavailable, but it needs a cursor or high-water mark, overlap to avoid missed records, and deduplication for the overlap. File-based integrations need an immutable landing zone, schema validation, checksum, quarantine for bad files, and a clear rule for when a batch is complete.

## 3. Assume outbound calls are unreliable

Every outbound adapter needs a deadline. Without one, stalled connections exhaust workers. Reuse connections through **connection pooling**, but bound pools so a slow provider does not consume all sockets. Respect rate-limit responses and centralize the quota state when multiple workers share an account.

Retry only failures that are safe and likely temporary. Exponential backoff and jitter avoid a synchronized retry storm. A **circuit breaker** pauses calls when a provider is broadly unhealthy. A **bulkhead** puts that provider’s work in its own concurrency pool, preventing a payroll integration outage from blocking unrelated support work. Provider failover is possible only when an alternate provider can deliver equivalent semantics; it is not a generic substitute for a failed API.

For a command that may change state, send an idempotency key or stable operation ID. If a timeout follows, the honest result is “unknown until reconciled.” Query the provider before sending the command again. Persist unrecoverable messages in a **dead-letter queue** with their attempt history and safe replay context, rather than silently dropping them.

## 4. Evolve contracts deliberately

Providers deprecate API versions and fields. Internal schemas evolve too. Make adapters accept the old and new shape during a transition, publish versioned canonical events, and remove old support only after consumers have migrated. Treat a schema mismatch as an observable integration failure, not a parsing detail hidden in a log.

OAuth adds its own lifecycle. Store tokens encrypted, request only the scopes required, refresh them before expiry, and detect revoked consent distinctly from a transient failure. Never pass provider tokens through a model prompt.

Good provider-specific observability includes latency, timeout and error classes, rate-limit events, token-refresh failures, webhook signature failures, event lag, deduplication rate, and reconciliation drift. These metrics tell you whether the problem is your adapter, the provider, or an assumption about the contract.

## 5. Where MCP fits

**Model Context Protocol (MCP)** is an agent-facing integration protocol. An MCP client connects to an MCP server, establishes a transport and session, then uses **capability discovery** to learn about available tools, resources, and prompts.

- **Tools** are callable operations with input schemas.
- **Resources** are named data that a client can read.
- **Prompts** are reusable prompt templates exposed by the server.

Discovery makes it convenient for an agent application to learn an integration at runtime. It does not grant permission. An MCP server can be local to the machine or remote over a network, but either form needs authentication, transport/session lifecycle handling, health checks, deadlines, and logging.

Put an MCP gateway or proxy between agents and untrusted or tenant-sensitive servers. It can decide which servers a tenant may connect to, which discovered tools are visible to a workflow, and what arguments they may receive. Validate schemas before calling a tool and validate tool results before they enter agent context. A result is external input, not trusted instruction.

MCP is useful for wrapping a legacy API behind a consistent agent interface or for controlled tool discovery across many systems. Direct REST can be simpler for a fixed product integration with a small surface. Either way, authorization must be enforced on every call. A discovered MCP tool cannot bypass tenant scope, least privilege, deterministic policy checks, idempotency, timeouts, retries, auditing, or the approval required for consequential actions.
