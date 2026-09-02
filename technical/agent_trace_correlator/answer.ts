interface TraceEvent {
  tenantId: string;
  workflowId: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  stepId: string;
  attempt: number;
  type: "workflow" | "retrieval" | "model" | "tool" | "approval";
  timestampMs: number;
}

interface TraceIssue {
  code:
    | "duplicate_span"
    | "missing_parent"
    | "parent_cycle"
    | "invalid_event";
  spanId?: string;
}

interface TraceSummary {
  tenantId: string;
  workflowId: string;
  traceId: string;
  events: readonly TraceEvent[];
  issues: readonly TraceIssue[];
}

function hasParentCycle(
  spanId: string,
  spans: ReadonlyMap<string, TraceEvent>,
  visited: Set<string>,
  path: Set<string>
): boolean {
  if (path.has(spanId)) return true;
  if (visited.has(spanId)) return false;

  visited.add(spanId);
  path.add(spanId);

  const parentSpanId = spans.get(spanId)?.parentSpanId;

  if (
    parentSpanId &&
    spans.has(parentSpanId) &&
    hasParentCycle(parentSpanId, spans, visited, path)
  ) {
    return true;
  }

  path.delete(spanId);
  return false;
}

export function correlateAgentTraces(
  events: readonly TraceEvent[]
): readonly TraceSummary[] {
  const grouped = new Map<
    string,
    {
      tenantId: string;
      workflowId: string;
      traceId: string;
      events: TraceEvent[];
    }
  >();

  // Group by correlation boundary.
  for (const event of events) {
    const key = JSON.stringify([
      event.tenantId,
      event.workflowId,
      event.traceId,
    ]);

    let group = grouped.get(key);

    if (!group) {
      group = {
        tenantId: event.tenantId,
        workflowId: event.workflowId,
        traceId: event.traceId,
        events: [],
      };

      grouped.set(key, group);
    }

    group.events.push(event);
  }

  const summaries: TraceSummary[] = [];

  for (const group of grouped.values()) {
    const issues: TraceIssue[] = [];

    const spanCounts = new Map<string, number>();
    const spans = new Map<string, TraceEvent>();

    // Build indexes once.
    for (const event of group.events) {
      spanCounts.set(
        event.spanId,
        (spanCounts.get(event.spanId) ?? 0) + 1
      );

      // First entry is enough for relationship validation.
      if (!spans.has(event.spanId)) {
        spans.set(event.spanId, event);
      }
    }

    // Validate events and relationships.
    for (const event of group.events) {
      if (
        !event.tenantId.trim() ||
        !event.workflowId.trim() ||
        !event.traceId.trim() ||
        !event.spanId.trim() ||
        !event.stepId.trim() ||
        !Number.isInteger(event.attempt) ||
        event.attempt < 0
      ) {
        issues.push({
          code: "invalid_event",
          spanId: event.spanId || undefined,
        });
      }

      if ((spanCounts.get(event.spanId) ?? 0) > 1) {
        issues.push({
          code: "duplicate_span",
          spanId: event.spanId,
        });
      }

      if (
        event.parentSpanId &&
        !spans.has(event.parentSpanId)
      ) {
        issues.push({
          code: "missing_parent",
          spanId: event.spanId,
        });
      }
    }

    // Parent graph cycle detection.
    const visited = new Set<string>();

    for (const event of group.events) {
      if (
        !visited.has(event.spanId) &&
        hasParentCycle(
          event.spanId,
          spans,
          visited,
          new Set()
        )
      ) {
        issues.push({
          code: "parent_cycle",
          spanId: event.spanId,
        });
      }
    }

    const sortedEvents = [...group.events].sort(
      (a, b) =>
        a.timestampMs - b.timestampMs ||
        a.spanId.localeCompare(b.spanId)
    );

    summaries.push({
      tenantId: group.tenantId,
      workflowId: group.workflowId,
      traceId: group.traceId,
      events: sortedEvents,
      issues,
    });
  }

  return summaries;
}