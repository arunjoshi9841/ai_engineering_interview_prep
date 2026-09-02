"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class EventFrequency(TypedDict):
    event: str
    count: int

def mostFrequentEvent(events: list[str]) -> EventFrequency | None:
    raise NotImplementedError("Implement the contract documented in question.md")
