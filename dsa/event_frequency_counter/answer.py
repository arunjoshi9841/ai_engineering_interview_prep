from typing import TypedDict


class EventFrequency(TypedDict):
    event: str
    count: int


def most_frequent_event(
    events: list[str],
) -> EventFrequency | None:
    if len(events) == 0:
        return None

    counts: dict[str, int] = {}

    for event in events:
        counts[event] = counts.get(event, 0) + 1

    highest_event: str | None = None
    highest_count = 0

    for event, count in counts.items():
        if count > highest_count:
            highest_event = event
            highest_count = count

    if highest_event is None:
        return None

    return {
        "event": highest_event,
        "count": highest_count,
    }