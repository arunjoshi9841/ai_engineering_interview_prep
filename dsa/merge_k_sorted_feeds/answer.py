"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class FeedEvent(TypedDict):
    timestamp: int
    payload: str

def mergeSortedFeeds(feeds: list[list[FeedEvent]]) -> list[FeedEvent]:
    raise NotImplementedError("Implement the contract documented in question.md")
