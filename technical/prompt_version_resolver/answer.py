from typing import NotRequired, TypedDict


class PromptVersion(TypedDict):
    tenant_id: str
    prompt_name: str
    version: str
    status: str


class Rollout(TypedDict):
    id: str
    stable_version: str
    candidate_version: NotRequired[str]
    candidate_percent: int


class ResolveRequest(TypedDict):
    tenant_id: str
    prompt_name: str
    actor_key: str
    pinned_version: NotRequired[str]

def resolvePrompt(request: ResolveRequest, rollout: Rollout, versions: list[PromptVersion]) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
