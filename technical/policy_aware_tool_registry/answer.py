"""Python solution entry point for this interview exercise."""

from typing import TypedDict

class CallerContext(TypedDict):
    tenant_id: str
    permissions: set[str]
    request_id: str


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
