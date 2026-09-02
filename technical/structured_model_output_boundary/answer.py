"""Python interface matching the TypeScript contract in question.md."""

from typing import Literal, TypedDict


class ModelDecision(TypedDict):
    category: Literal["billing", "access", "security"]
    confidence: float
    action: Literal["reply", "request_more_information", "escalate"]
    reason: str

def parseModelDecision(raw: str) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
