"""Python solution entry point for this interview exercise."""

from typing import TypedDict

class StepRun(TypedDict):
    workflow_id: str
    step: str
    operation_id: str


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
