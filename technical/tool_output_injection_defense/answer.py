"""Python interface matching the TypeScript contract in question.md."""

from typing import Any, Literal, TypedDict

class Observation(TypedDict):
    trust: Literal["untrusted_external_data"]
    source_tool: Literal["fetch_web_page"]
    url: str
    title: str
    content: str

class ActionPolicy(TypedDict):
    allowed_tools: set[str]
    authorized_tools: set[str]
    high_risk_tools: set[str]
    validate_args: Any

def normalizeWebObservation(raw: object) -> Observation:
    raise NotImplementedError("Implement the contract documented in question.md")

def evaluateNextProposal(proposal: dict[str, object], policy: ActionPolicy) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
