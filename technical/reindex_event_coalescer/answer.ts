interface ReindexEvent {
  tenantId: string;
  documentId: string;
  revision: number;
  kind: "upsert" | "delete";
}

type CoalesceResult =
  | { ok: true; operations: readonly ReindexEvent[] }
  | { ok: false; code: "invalid_event" | "conflicting_revision" };

export function coalesceReindexEvents(
  events: readonly ReindexEvent[],
): CoalesceResult {
  throw new Error("not implemented");
}
