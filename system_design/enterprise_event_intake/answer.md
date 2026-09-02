# Enterprise Event Intake

**Interviewer:** Design an intake platform for high-volume webhooks, queues, file drops, and scheduled imports.

**Me:** I would build a common intake envelope around source-specific gateways. Each gateway authenticates the source before trusting tenant or event fields. Signed webhooks need signature verification and replay protection, customer topics need authenticated subscriptions, and files need secure transfer, scanning, and validation.

After authentication, the platform stores the raw event or file as immutable evidence under governed retention. A normalization service creates a versioned canonical envelope with trusted tenant, source, event type, source ID, source timestamp, received timestamp, schema version, payload reference, and lineage.

Malformed events go to quarantine with a reason and source reference. Schema evolution is handled through a registry and compatible versions. Consumers should understand the canonical contract rather than every source format.

Deduplication uses a source event ID when available, along with an inbox record and retention window. If a source has no stable ID, we can use a carefully defined fingerprint, but we should avoid merging genuinely related events just because their content looks similar. Deduplication should prevent duplicate routing without destroying evidence.

Ordering is defined per source or entity. If a sequence number arrives out of order, the platform can buffer briefly, mark a gap, or route under a source-specific policy. I would not impose a global order across unrelated tenants and event types.

Routing happens only after normalization and authorization. The router uses the trusted tenant, event type, policy, and workflow version to send work to an approved downstream queue. Event content can describe a request, but it cannot grant an agent authority.

For 10x bursts, I would partition the broker, use bounded buffers, apply tenant-aware quotas, and reserve capacity for important event classes. A tenant reconnecting with a 20x backlog should be throttled or processed with a fair-share budget so it does not starve real-time traffic from others.

Replay is controlled and explicit. A replay carries a replay ID, original event ID, scope, workflow version, and operator or service identity. Downstream effects still need stable operation IDs and idempotency. Corrections should be represented as new events that refer to the earlier event, not as edits to history.

**Interviewer:** What if a poison event blocks a partition?

**Me:** I would limit processing attempts, move the event to quarantine or a dead-letter queue, and continue with later events when the source’s ordering guarantees allow it. Operators get a clear reason and can fix or replay the event safely.

**Interviewer:** Where should raw payloads live?

**Me:** Large or sensitive payloads belong in governed object storage, encrypted and scoped to the tenant and region. The streaming envelope carries a reference, checksum, and metadata rather than copying the entire payload through every service.
