interface WebhookRequest {
  headers: Readonly<Record<string, string | undefined>>;
  rawBody: Uint8Array;
}

interface VerifiedEvent {
  eventId: string;
  type: string;
  tenantExternalId: string;
  payload: unknown;
}

type IntakeResult =
  | { status: "accepted" }
  | { status: "duplicate" }
  | { status: "rejected"; code: "missing_headers" | "invalid_signature" | "stale" | "invalid_event" };

class WebhookIntake {
  constructor(
    private readonly secret: Uint8Array,
    private readonly allowedTypes: ReadonlySet<string>,
    private readonly enqueue: (event: VerifiedEvent) => Promise<void>,
    private readonly nowMs: () => number,
  ) {}

  handle(request: WebhookRequest): Promise<IntakeResult> {
    throw new Error("not implemented");
  }
}
