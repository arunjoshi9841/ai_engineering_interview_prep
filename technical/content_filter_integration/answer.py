"""Python interface matching the TypeScript contract in question.md."""

from typing import Literal, TypedDict

class FilterDecision(TypedDict):
    allowed: bool
    policy_version: str

class SafeGenerationResult(TypedDict):
    status: Literal["completed", "blocked", "failed"]

def generateWithSafety(input: str, filter: object, generator: object, signal: object) -> SafeGenerationResult:
    raise NotImplementedError("Implement the contract documented in question.md")
