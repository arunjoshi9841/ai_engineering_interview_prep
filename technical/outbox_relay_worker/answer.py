from typing import Any, TypedDict


class OutboxRecord(TypedDict):
    id: str
    topic: str
    payload: Any


class RelaySummary(TypedDict):
    published: int
    failed: int
    uncertain: int
    cancelled: int

def relayOnce(store: object, broker: object, batch_size: int, signal: object) -> RelaySummary:
    raise NotImplementedError("Implement the contract documented in question.md")
