from typing import Literal, TypedDict

class AggregateResult(TypedDict):
    status: Literal["complete", "partial"]
    needs_review: bool
    missing: list[str]
    evidence_ids: list[str]
    outcomes: list[object]

def aggregateSpecialists(expected: list[str], outcomes: list[object], confidence_threshold: float) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
