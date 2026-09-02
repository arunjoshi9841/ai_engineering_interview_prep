"""Python solution entry point for this interview exercise."""

from typing import Literal, NotRequired, TypedDict


class TaskState(TypedDict):
    id: str
    owner: Literal["supervisor", "agent-a", "agent-b"]
    status: Literal["ready", "running", "waiting", "completed", "failed"]
    waiting_for: NotRequired[str]
    lease_version: int


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
