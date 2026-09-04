from typing import TypedDict


class Point(TypedDict):
    x: int
    y: int

def kClosest(points: list[Point], k: int) -> list[Point]:
    raise NotImplementedError("Implement the contract documented in question.md")
