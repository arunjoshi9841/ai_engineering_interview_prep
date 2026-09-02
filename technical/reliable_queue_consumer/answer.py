"""Python solution entry point for this interview exercise."""

from typing import TypedDict

class ProvisioningEvent(TypedDict):
    operation_id: str
    user_id: str
    attempt: int


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
