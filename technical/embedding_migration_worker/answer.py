"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class Chunk(TypedDict):
    tenant_id: str
    document_id: str
    chunk_id: str
    source_revision: int
    content_digest: str
    text: str


class MigrationSummary(TypedDict):
    completed: int
    skipped: int
    stale: int
    failed: int

def migrateBatch(deps: object, limit: int, target_version: str, expected_dimension: int, signal: object) -> MigrationSummary:
    raise NotImplementedError("Implement the contract documented in question.md")
