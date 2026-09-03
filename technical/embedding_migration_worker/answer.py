import asyncio

from dataclasses import dataclass
from typing import List, Protocol, Sequence, Literal


@dataclass(frozen=True)
class Chunk:
    tenant_id: str
    document_id: str
    chunk_id: str
    source_revision: int
    content_digest: str
    text: str


class MigrationDeps(Protocol):

    async def claim(self, limit: int) -> Sequence[Chunk]:
        ...

    async def already_current(
        self,
        chunk: Chunk,
        version: str,
    ) -> bool:
        ...

    async def embed(
        self,
        texts: Sequence[str],
        cancel_event: asyncio.Event,
    ) -> Sequence[Sequence[float]]:
        ...

    async def write_shadow(
        self,
        chunk: Chunk,
        version: str,
        vector: Sequence[float],
    ) -> Literal["written", "stale"]:
        ...

    async def mark_complete(
        self,
        chunk_id: str,
        content_digest: str,
        version: str,
    ) -> None:
        ...


@dataclass
class MigrationSummary:
    completed: int = 0
    skipped: int = 0
    stale: int = 0
    failed: int = 0


async def migrate_batch(
    deps: MigrationDeps,
    limit: int,
    target_version: str,
    expected_dimension: int,
    cancel_event: asyncio.Event,
) -> MigrationSummary:

    embed_batch_size = 20
    max_concurrent_batches = 4

    summary = MigrationSummary()

    claimed_chunks = await deps.claim(limit)

    # Filter chunks that already have the target embedding
    pending_chunks: List[Chunk] = []

    for chunk in claimed_chunks:
        if cancel_event.is_set():
            summary.skipped += 1
            continue

        try:
            current = await deps.already_current(
                chunk,
                target_version,
            )

            if current:
                summary.skipped += 1
                continue

            pending_chunks.append(chunk)

        except Exception:
            summary.failed += 1

    # Split chunks into embedding batches
    batches: List[List[Chunk]] = []

    for i in range(
        0,
        len(pending_chunks),
        embed_batch_size,
    ):
        batches.append(
            pending_chunks[i:i + embed_batch_size]
        )

    async def process_batch(batch: List[Chunk]) -> None:

        if cancel_event.is_set():
            summary.skipped += len(batch)
            return

        try:
            vectors = await deps.embed(
                [chunk.text for chunk in batch],
                cancel_event,
            )
        except Exception:
            if cancel_event.is_set():
                summary.skipped += len(batch)
            else:
                summary.failed += len(batch)
            return

        if len(vectors) != len(batch):
            summary.failed += len(batch)
            return

        async def process_chunk(
            chunk: Chunk,
            index: int,
        ) -> None:

            if cancel_event.is_set():
                summary.skipped += 1
                return

            vector = vectors[index]

            if len(vector) != expected_dimension:
                summary.failed += 1
                return

            try:
                result = await deps.write_shadow(
                    chunk,
                    target_version,
                    vector,
                )

                if result == "stale":
                    summary.stale += 1
                    return

                await deps.mark_complete(
                    chunk.chunk_id,
                    chunk.content_digest,
                    target_version,
                )

                summary.completed += 1

            except Exception:
                summary.failed += 1

        tasks = []

        for index, chunk in enumerate(batch):
            tasks.append(
                process_chunk(chunk, index)
            )

        await asyncio.gather(*tasks)

    # Run up to 4 embedding batches concurrently
    for i in range(
        0,
        len(batches),
        max_concurrent_batches,
    ):
        batch_group = batches[
            i:i + max_concurrent_batches
        ]

        tasks = []

        for batch in batch_group:
            tasks.append(process_batch(batch))

        await asyncio.gather(*tasks)

    return summary