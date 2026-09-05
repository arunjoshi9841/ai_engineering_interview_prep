# Designing the Data Layer for Distributed Systems

Most system-design problems become easier once you ask one question first: *which copy of this data is authoritative?* A distributed system can have many copies of a customer record—a primary database row, a cache entry, a search document, a read replica, and an analytics table—but only one should decide what is true.

This guide starts with that source of truth and grows outward into search, scale, events, and recovery.

## 1. Choose a store for the job

A **relational database** stores structured rows with relationships. It is a strong default for orders, permissions, workflow state, and anything that needs transactions or rich queries. A transaction gives an all-or-nothing guarantee: if an order creates both a payment record and an inventory reservation, either both are committed or neither is.

A **key-value store** maps a key directly to a value. It is useful when the normal question is “give me the session for this ID” or “what is the current counter for this tenant?” Document stores are similar, but make it easier to retrieve and update a self-contained JSON-like record. Neither is automatically faster or more scalable than SQL; they are a good fit when their access pattern matches the problem.

**Object storage** holds large, immutable blobs: uploads, images, audit artifacts, backups, and data exports. Put the file there, and keep its ID, owner, checksum, and lifecycle metadata in a database. Do not make an API server stream a multi-gigabyte upload if a presigned object-storage URL can accept it directly.

## 2. Separate authority from convenience

Suppose the orders database is authoritative. A search index makes orders easy to find by words. A cache makes popular order pages fast. A read replica allows reports without competing with writes. These are all **derived stores**: useful copies that can be recreated from the source of truth.

That distinction matters during a bug or outage. If the cache is wrong, discard it. If an index is corrupt, rebuild it. If the authoritative database is lost, the business data is lost. Derived stores should therefore carry the source version they were built from, and their update process must be observable.

An **index** is an extra data structure that makes a query fast, much like an index in a book. It speeds reads but costs storage and makes writes slower because the index must also change. Create indexes for measured query patterns, not every possible column.

A cache is a temporary copy near the caller. It needs a key that includes every security-relevant dimension, such as tenant and permission scope. Time-to-live expiry bounds staleness, but it does not solve urgent changes such as access revocation. Those require deliberate invalidation. “We will clear the cache somehow” is not a design.

## 3. Replicate for availability, partition for scale

**Replication** copies data to multiple machines or regions. A primary may accept writes while read replicas answer ordinary reads. This increases read capacity and can improve local latency, but replicas can lag. A user who writes a profile change and immediately reads from a replica may temporarily see the older version.

That leads to a consistency choice. **Strong consistency** means a read sees the latest acknowledged write according to a defined ordering. **Eventual consistency** means replicas converge later, so a read may be stale for a while. Use strong consistency for balances, approvals, and permission changes. Eventual consistency is usually acceptable for feed caches, search indexing, and analytics—provided the product can tolerate it.

When one machine cannot hold or serve the data, **partition** it, also called **sharding**. Choose a key that keeps related work together, commonly tenant ID, account ID, or user ID. The goal is that a normal request talks to one shard. A directory service can map a tenant to its shard.

Cross-shard access is expensive because it needs many network calls and coordination. Design it out of the request path where possible: keep a small denormalized read model, precompute aggregates, or run an asynchronous report. If a cross-shard operation is unavoidable, be explicit about its consistency and failure behavior.

## 4. Coordinate changes without pretending the network is perfect

A database transaction works well inside one database. A **distributed transaction** tries to make several independent databases or services commit together. It can be appropriate in limited, tightly controlled cases, but it increases latency and availability risk because everyone must coordinate.

For independent services, use a **saga** instead. Each service performs its own local transaction and emits the next step. If a later step fails, the workflow runs compensating actions: for example, release inventory after payment authorization fails. Compensation is not magic reversal; an email cannot be unsent, and a payment may need a refund rather than deletion. Design those outcomes as product behavior.

The next problem is publishing a change. If an application writes an order row and then crashes before sending the “order created” event, downstream systems never learn about it. The **outbox pattern** fixes this by writing the order and an outbox event in the same local transaction. A relay later reads the outbox and publishes events. If it publishes twice, consumers deduplicate using the event ID.

**Change data capture (CDC)** reads committed database changes from a log and turns them into an event stream. It is excellent for keeping search, analytics, and warehouse data updated. Both outbox and CDC consumers must tolerate duplicates, delayed messages, out-of-order delivery, and replay. Delivery is usually at least once; correctness comes from idempotent handlers and version checks.

An **event-driven architecture** lets services react asynchronously to these changes. It is helpful when the work does not need to block the original request. **CQRS**—command query responsibility segregation—takes this further: writes use an authoritative command model, while reads use independently shaped views. Use it when read patterns genuinely need different scale or structure, not as decoration.

## 5. Plan the data lifecycle

Data changes shape over time. Make schema migrations additive first: add a nullable field or a new table, deploy readers that understand both forms, backfill, switch writers, then remove the old form only after verification. Version events too; an old consumer may still be running when a new producer deploys.

Keep frequently accessed **hot** data on fast storage. Move less-used **warm** data to cheaper storage, and **cold** historical data to archive according to retention, legal, and retrieval requirements. This is a cost decision and a product decision: archived data is only useful if retrieval is tested and understood.

Finally, recovery must be engineered, not promised. Define the **RPO** (recovery point objective), the maximum acceptable amount of lost recent data, and the **RTO** (recovery time objective), the maximum acceptable downtime. Take backups, copy them independently, rehearse restores, and document how every cache, index, replica, and analytical view is rebuilt from authoritative data. A backup no one has restored is just a hopeful file.
