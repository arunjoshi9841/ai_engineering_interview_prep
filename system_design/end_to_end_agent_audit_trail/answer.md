# End-to-End Agent Audit Trail

**Interviewer:** Design an audit trail that can explain why a consequential agent workflow reached an outcome.

**Me:** I would treat this as durable evidence, not as ordinary application logs or distributed tracing. The goal is to reconstruct what happened without rerunning the workflow.

Every workflow gets a stable workflow ID. Each step, attempt, and external operation gets its own ID. Those identifiers travel through APIs, queues, model calls, retrieval, tool gateways, approvals, and callbacks. The audit event envelope would include the tenant, actor, producer identity, event type, event time, ingestion time, schema version, causation ID, correlation ID, and integrity metadata.

Events would record important facts such as the originating request, authorization decision, workflow and policy versions, prompt and model versions, evidence references, tool proposals, validation results, approvals, errors, and final outcomes. I would keep large prompts, documents, and tool payloads outside the main event. The audit record can store a hash, immutable version reference, or governed pointer instead.

The write path should be append-only for normal application actors. Services should authenticate as registered producers, and audit publication can use an outbox so a business transition and its audit event are not easily separated. A durable, partitioned ingestion service would accept events and store them in immutable storage. A hot index would support recent investigations, while older data moves to lower-cost retention tiers.

I would not invent a global order because events arrive late and clocks differ. Instead, I would preserve per-workflow sequence numbers, causation links, producer sequence numbers, event time, and ingestion time. The investigation view should show when ordering is uncertain or an event is missing.

If a queue redelivers a message, the second attempt can have a different attempt ID but the same logical operation ID. That lets the investigator see that there were two attempts without mistaking them for two external side effects.

Tenant investigators should see only their authorized scope. Platform security and compliance roles need separate, audited access. Retention, legal hold, deletion, field-level access, and customer-managed keys should be policy-driven. If someone needs to correct an inaccurate event, we append a correction or annotation instead of rewriting the original.

Integrity can use append-only permissions, immutable storage, signed producer events, and chained or independently anchored digests. I would also run completeness checks for producer gaps, failed verification, missing sequences, and unexpected deletion attempts.

**Interviewer:** How is this different from tracing?

**Me:** Tracing is mainly for performance and debugging. It may be sampled and retained briefly. Audit evidence needs stronger completeness, integrity, retention, privacy, and access controls. They can share IDs, but a trace span cannot replace an audit record.

**Interviewer:** What if a service completes a side effect but cannot publish its audit event?

**Me:** The service should use an outbox or durable local record before acknowledging completion. A reconciliation process can republish missing audit events, and the investigation view should show any remaining evidence gap instead of hiding it.
