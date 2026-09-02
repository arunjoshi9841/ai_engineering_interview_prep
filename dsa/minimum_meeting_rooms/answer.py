"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class Meeting(TypedDict):
    start: int
    end: int

def minimumMeetingRooms(meetings: list[Meeting]) -> int:
    raise NotImplementedError("Implement the contract documented in question.md")
