# Shared Agent State Service

**Interviewer:** Design a shared state service for several agents collaborating on one workflow.

**Me:** I would not use one large conversation transcript as the source of truth. I would separate typed workflow state, working context, evidence and claims, semantic references, episodic records, and audit history.

Workflow state includes task ownership, transitions, approvals, deadlines, and completion status. These records need strong consistency and conditional updates. Claims and evidence should usually be append-only, with producer, source, timestamp, revision, sensitivity, and provenance. Working context can be rebuilt and should have a shorter retention period.

Every record is namespaced by tenant, workflow, and state category. Reads and writes carry trusted tenant, user, workflow, and agent capability context. The service checks those permissions itself. An agent cannot grant itself access or use retrieved memory as permission to call a tool.

For concurrency, records have revisions. An update includes the expected revision, and the service applies it only if the revision still matches. If agent B writes using revision 14 after agent A has moved the record to revision 15, B receives a conflict instead of silently overwriting A. Claims can be corrected through supersession or a new claim rather than destructive editing.

I would use a transactional store for workflow metadata and ownership, object storage for large immutable evidence, and a permission-aware search or vector index for semantic recall. The index is derived and eventually consistent. The transactional state remains authoritative.

Memory needs lifecycle controls. Different state types can have different TTLs, retention rules, legal holds, deletion behavior, and compaction. When permissions are revoked, cached and indexed memory needs invalidation. A stale memory item should include its source and freshness, and the model should treat it as evidence to evaluate, not as unquestionable fact.

Change notifications can help agents react to new claims or task assignments, but queries must be bounded by tenant, workflow, category, time, and result count. Quotas and compaction prevent long-running workflows from growing forever.

**Interviewer:** What happens during a regional partition?

**Me:** If both regions need to continue read-only investigation, I would allow independently recorded observations with region and revision metadata. Writes to ownership, approvals, and workflow transitions should remain strongly controlled. After the partition, a reconciliation process can merge append-only evidence and surface conflicts rather than choosing silently.

**Interviewer:** How do you support immediate deletion from active memory but long audit retention?

**Me:** I would delete or tombstone active context and derived indexes promptly, while retaining a separately protected, access-controlled audit record when policy or legal requirements require it. The audit record should contain the minimum necessary reference and access should be separately logged.
