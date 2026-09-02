"""Python solution entry point for this interview exercise."""

from typing import Callable, NotRequired, TypedDict


class CircuitBreakerOptions(TypedDict):
    failure_threshold: int
    cooldown_ms: int
    now: NotRequired[Callable[[], int]]
    is_eligible_failure: Callable[[object], bool]


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
