type Status = "running" | "waiting" | "completed" | "failed";

interface WorkflowState {
  id: string;
  revision: number;
  status: Status;
  checkpoint: Readonly<Record<string, unknown>>;
}

type TransitionResult =
  | { ok: true; state: WorkflowState; replayed: boolean }
  | { ok: false; code: "not_found" | "invalid_transition" | "revision_conflict" | "idempotency_conflict" };

class CheckpointStore {
  create(id: string): WorkflowState { throw new Error("not implemented"); }
  get(id: string): WorkflowState | null { throw new Error("not implemented"); }
  transition(
    id: string,
    expectedRevision: number,
    operationId: string,
    nextStatus: Status,
    checkpoint: Readonly<Record<string, unknown>>,
  ): TransitionResult { throw new Error("not implemented"); }
}
