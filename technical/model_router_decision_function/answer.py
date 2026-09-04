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


def choose_model(
    request: RouteRequest,
    candidates: list[ModelCandidate],
    preference_order: list[str],
) -> dict[str, object]:

    # validate policy
    if (
        preference_order.count("quality") != 1
        or preference_order.count("cost") != 1
        or preference_order.count("latency") != 1
        or len(preference_order) != 3
    ):
        return {
            "ok": False,
            "code": "invalid_policy",
        }

    valid_models: list[ModelCandidate] = []

    # hard constraints
    for model in candidates:
        if not model["healthy"]:
            continue

        if request["tenant_id"] not in model["allowed_tenants"]:
            continue

        if request["region"] not in model["regions"]:
            continue

        if not request["required_capabilities"].issubset(
            model["capabilities"]
        ):
            continue

        if request["context_tokens"] > model["max_context_tokens"]:
            continue

        if model["estimated_cost_usd"] > request["max_cost_usd"]:
            continue

        if model["estimated_latency_ms"] > request["max_latency_ms"]:
            continue

        valid_models.append(model)

    if not valid_models:
        return {
            "ok": False,
            "code": "no_eligible_model",
        }

    def sort_key(model: ModelCandidate) -> tuple:
        values = []

        for preference in preference_order:
            if preference == "quality":
                # higher is better
                values.append(-model["quality_score"])

            elif preference == "cost":
                # lower is better
                values.append(model["estimated_cost_usd"])

            elif preference == "latency":
                # lower is better
                values.append(model["estimated_latency_ms"])

        # deterministic complete tie-breaker
        values.append(model["id"])

        return tuple(values)

    chosen = sorted(
        valid_models,
        key=sort_key,
    )[0]

    return {
        "ok": True,
        "model": chosen,
        "reason": {
            "preference_order": list(preference_order),
        },
    }