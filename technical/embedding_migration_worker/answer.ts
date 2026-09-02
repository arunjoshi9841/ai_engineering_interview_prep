interface Chunk { tenantId: string; documentId: string; chunkId: string; sourceRevision: number; contentDigest: string; text: string; }
interface MigrationDeps {
  claim(limit: number): Promise<readonly Chunk[]>;
  alreadyCurrent(chunk: Chunk, version: string): Promise<boolean>;
  embed(texts: readonly string[], signal: AbortSignal): Promise<readonly number[][]>;
  writeShadow(chunk: Chunk, version: string, vector: readonly number[]): Promise<"written" | "stale">;
  markComplete(chunkId: string, contentDigest: string, version: string): Promise<void>;
}

interface MigrationSummary { completed: number; skipped: number; stale: number; failed: number; }

export async function migrateBatch(
  deps: MigrationDeps,
  limit: number,
  targetVersion: string,
  expectedDimension: number,
  signal: AbortSignal,
): Promise<MigrationSummary> {
  throw new Error("not implemented");
}
