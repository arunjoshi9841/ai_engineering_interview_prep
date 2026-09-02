"""Python interface matching the TypeScript contract in question.md."""

from typing import Literal, TypedDict


class ReindexEvent(TypedDict):
    tenant_id: str
    document_id: str
    revision: int
    kind: Literal["upsert", "delete"]

def coalesceReindexEvents(events: list[ReindexEvent]) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
