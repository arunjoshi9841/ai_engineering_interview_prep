"""Python solution entry point for this interview exercise."""

from typing import Any, TypedDict

class WebhookRequest(TypedDict):
    headers: dict[str, str | None]
    raw_body: bytes

class VerifiedEvent(TypedDict):
    event_id: str
    type: str
    tenant_external_id: str
    payload: Any


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
