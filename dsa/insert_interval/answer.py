"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class Interval(TypedDict):
    start: int
    end: int

def insertInterval(intervals: list[Interval], addition: Interval) -> list[Interval]:
    raise NotImplementedError("Implement the contract documented in question.md")
