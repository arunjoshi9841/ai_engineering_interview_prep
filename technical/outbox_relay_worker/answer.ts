interface OutboxRecord { id: string; topic: string; payload: unknown; }
interface OutboxStore {
  claim(limit: number): Promise<readonly OutboxRecord[]>;
  markPublished(id: string): Promise<void>;
  releaseFailed(id: string, code: string): Promise<void>;
}
interface Broker {
  publish(topic: string, eventId: string, payload: unknown, signal: AbortSignal): Promise<void>;
}
interface RelaySummary {
  published: number;
  failed: number;
  uncertain: number;
  cancelled: number;
}

export async function relayOnce(
  store: OutboxStore,
  broker: Broker,
  batchSize: number,
  signal: AbortSignal,
): Promise<RelaySummary> {
  throw new Error("not implemented");
}
