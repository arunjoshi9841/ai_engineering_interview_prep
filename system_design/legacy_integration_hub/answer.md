# Legacy Integration Hub

**Interviewer:** Design a hub that connects agent workflows to APIs, files, webhooks, and scheduled exports.

**Me:** I would put an anti-corruption layer between workflows and the legacy systems. Workflows should use small, versioned application-owned commands and queries, not raw vendor schemas. The hub translates those contracts through connector-specific adapters.

The hub would have a connector registry, a normalized contract layer, operation state, synchronization workers, and an audit and lineage store. Each connector owns authentication, transport, field mapping, source-specific status values, rate limits, and retry behavior. Shared platform code owns tenant authorization, policy checks, idempotency, scheduling, and observability.

For reads, the hub can call a current API synchronously when the freshness policy allows it. For files, webhooks, and exports, it stores the observed source timestamp and tells callers how stale the data is. The hub is not the business source of truth. That must be explicit per field and per system.

Commands use stable operation IDs. A modern connector can pass that ID as an idempotency key. If a write times out after submission, the operation becomes `indeterminate` until the connector can query status or observe the resulting state. We should never label it completed just because the request was accepted.

Inbound webhooks use signed verification, an inbox record, and deduplication. Batch files are stored as immutable artifacts with checksums and source dates. Before applying a record, the hub compares its source version or timestamp with the latest accepted state. A Tuesday export must not overwrite a Wednesday API result.

Normalized entities should preserve source IDs, canonical IDs, mapping version, source system, and observed time. Conflicting identifiers need an explicit correlation process, not an accidental string match. A mapping change should create a new version and be reversible.

Each connector should have bulkheads and its own queue. A degraded legacy system should not block unrelated systems. Reconciliation jobs can periodically compare hub state with sources that provide no reliable callback. Operators need a safe way to replay an operation or file after reviewing its state.

**Interviewer:** What if a critical API disappears and only a daily export remains?

**Me:** I would switch that connector to an asynchronous freshness mode. The hub would continue accepting queries with a clear last-observed timestamp, disable actions that require current state, and process the daily export as a versioned update. High-risk commands should wait for a reliable source or require explicit human handling.

**Interviewer:** How would you onboard a new connector?

**Me:** The connector would implement the existing capability and data contracts, provide mapping and contract tests, pass security review, and publish its own version. Workflows depend on the normalized contract, so adding the connector should not require changes to every workflow.
