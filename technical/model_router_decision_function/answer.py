"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class ModelCandidate(TypedDict):
    id: str
    healthy: bool
    allowed_tenants: set[str]
    regions: set[str]
    capabilities: set[str]
    max_context_tokens: int
    estimated_cost_usd: float
    estimated_latency_ms: int
    quality_score: float


class RouteRequest(TypedDict):
    tenant_id: str
    region: str
    required_capabilities: set[str]
    context_tokens: int
    max_cost_usd: float
    max_latency_ms: int

def chooseModel(request: RouteRequest, candidates: list[ModelCandidate], preference_order: list[str]) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
