interface Chunk {
  tenantId: string;
  documentId: string;
  chunkId: string;
  sourceRevision: number;
  contentDigest: string;
  text: string;
}

interface MigrationDeps {
  claim(limit: number): Promise<readonly Chunk[]>;

  alreadyCurrent(
    chunk: Chunk,
    version: string,
  ): Promise<boolean>;

  embed(
    texts: readonly string[],
    signal: AbortSignal,
  ): Promise<readonly number[][]>;

  writeShadow(
    chunk: Chunk,
    version: string,
    vector: readonly number[],
  ): Promise<"written" | "stale">;

  markComplete(
    chunkId: string,
    contentDigest: string,
    version: string,
  ): Promise<void>;
}

interface MigrationSummary {
  completed: number;
  skipped: number;
  stale: number;
  failed: number;
}

export async function migrateBatch(
  deps: MigrationDeps,
  limit: number,
  targetVersion: string,
  expectedDimension: number,
  signal: AbortSignal,
): Promise<MigrationSummary> {
  const embedBatchSize = 20;
  const maxConcurrentBatches = 4;

  const summary: MigrationSummary = {
    completed: 0,
    skipped: 0,
    stale: 0,
    failed: 0,
  };

  // 1. Claim a bounded batch from the DB
  const claimedChunks = await deps.claim(limit);

  // 2. Filter out chunks that already have this embedding version
  const pendingChunks: Chunk[] = [];

  for (const chunk of claimedChunks) {
    if (signal.aborted) {
      summary.skipped++;
      continue;
    }

    try {
      const current = await deps.alreadyCurrent(
        chunk,
        targetVersion,
      );

      if (current) {
        summary.skipped++;
        continue;
      }

      pendingChunks.push(chunk);
    } catch {
      summary.failed++;
    }
  }

  //  3. Split chunks into embedding batches
  //  [
  //    [chunk1, chunk2, chunk3],
  //    [chunk4, chunk5, chunk6],
  //    [chunk7, chunk8]
  //  ]
  const batches: Chunk[][] = [];

  for (
    let i = 0;
    i < pendingChunks.length;
    i += embedBatchSize
  ) {
    batches.push(
      pendingChunks.slice(i, i + embedBatchSize),
    );
  }

  // 4. Process one embedding batch
  const processBatch = async (batch: Chunk[]) => {
    if (signal.aborted) {
      summary.skipped += batch.length;
      return;
    }

    let vectors: readonly number[][];

    try {
      // One embedding API call for many texts
      vectors = await deps.embed(
        batch.map((chunk) => chunk.text),
        signal,
      );
    } catch {
      if (signal.aborted) {
        summary.skipped += batch.length;
      } else {
        summary.failed += batch.length;
      }

      return;
    }

    // Provider should return one vector per input text
    if (vectors.length !== batch.length) {
      summary.failed += batch.length;
      return;
    }

    // 5. Write results concurrently within the batch
    await Promise.all(
      batch.map(async (chunk, index) => {
        try {
          if (signal.aborted) {
            summary.skipped++;
            return;
          }

          const vector = vectors[index];

          if (
            !vector ||
            vector.length !== expectedDimension
          ) {
            summary.failed++;
            return;
          }

          const result = await deps.writeShadow(
            chunk,
            targetVersion,
            vector,
          );

          // Chunk changed after being claimed
          if (result === "stale") {
            summary.stale++;
            return;
          }

          await deps.markComplete(
            chunk.chunkId,
            chunk.contentDigest,
            targetVersion,
          );

          summary.completed++;
        } catch {
          if (signal.aborted) {
            summary.skipped++;
          } else {
            summary.failed++;
          }
        }
      }),
    );
  };

  // 6. Run multiple embedding batches concurrently
  let nextBatchIndex = 0;

  const worker = async () => {
    while (nextBatchIndex < batches.length) {
      const index = nextBatchIndex;
      nextBatchIndex++;

      await processBatch(batches[index]);
    }
  };

  const concurrency = Math.min(
    maxConcurrentBatches,
    batches.length,
  );

  await Promise.all(
    Array.from({ length: concurrency }, worker),
  );

  return summary;
}