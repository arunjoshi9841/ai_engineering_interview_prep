# Agent Trace Correlator

## 1. Interview Prompt

Agent telemetry arrives out of order from model, retrieval, tool, approval, and workflow services. Implement a TypeScript function that groups events into workflow traces and reports broken correlation relationships.

Do not build a tracing backend or calculate latency from unsynchronized clocks.

## 2. Requirements

- Each event contains tenant, workflow, trace, span, optional parent span, step, attempt, type, and timestamp.
- Group only events with the same tenant, workflow, and trace IDs.
- Reject reuse of a span ID within a grouped trace.
- Report missing parent span IDs and a parent cycle.
- Sort events by timestamp, then span ID for deterministic display; do not claim this is causal order.
- Preserve attempts separately so retries are visible.
- Reject blank identifiers and invalid attempt numbers.
- Return all valid trace summaries plus bounded issue codes without payload content.

## 3. Example Input / Output

```text
tool span t2 parent=model span m1 -> linked
retry attempt 2 with new span     -> remains distinct
span x parent=missing             -> missing_parent
span a parent=b, b parent=a       -> parent_cycle
same traceId across two tenants   -> separate traces
```

## 4. What the Interviewer Is Evaluating

- Composite correlation boundaries
- Graph integrity and retry visibility
- Deterministic output without false ordering claims
- Observability data hygiene

## 5. Concept Questions and Interview Answers

### Why keep workflow ID and trace ID?

**Interview answer:**

> A workflow may span long waits or multiple technical traces, while a trace follows one distributed execution path. Both are useful and should not be collapsed.

### Why are retries separate attempts?

**Interview answer:**

> Merging them hides duplicate work and uncertain outcomes. Stable step identity plus distinct attempt and operation IDs preserves what actually happened.
