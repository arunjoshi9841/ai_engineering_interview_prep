from typing import TypedDict

class LoopState(TypedDict):
    started_at_ms: int
    steps_used: int
    tool_calls_used: int
    tokens_used: int
    recent_action_signatures: list[str]

class LoopPolicy(TypedDict):
    max_steps: int
    max_tool_calls: int
    max_tokens: int
    max_elapsed_ms: int
    allowed_tools: set[str]

def guardNextStep(state: LoopState, proposal: dict[str, object], policy: LoopPolicy, now_ms: int) -> dict[str, object]:
    raise NotImplementedError("Implement the contract documented in question.md")
