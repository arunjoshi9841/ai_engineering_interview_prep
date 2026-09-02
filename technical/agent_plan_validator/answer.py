from typing import Callable, Set, TypedDict


class PlanStep(TypedDict):
    id: str
    depends_on: list[str]
    tool_name: str
    args: dict
    estimated_tokens: float
    estimated_cost_usd: float
    approval_ref: str | None

class PlanPolicy(TypedDict):
    allowed_tools: Set[str]
    authorized_tools: Set[str]
    high_risk_tools: Set[str]
    max_tokens: float
    max_cost_usd: float
    validate_args: Callable[[str, dict], bool]
    approval_valid: Callable[[PlanStep], bool]

class PlanIssue(TypedDict):
    step_id: str | None
    code: str 
    # "too_many_steps" 
    # "duplicate_step" 
    # "duplicate_dependency"
    # "missing_dependency"
    # "cycle"
    # "tool_forbidden"
    # "invalid_arguments"
    # "approval_required"
    # "invalid_estimate"
    # "budget_exceeded"

def validate_plan(steps: list[PlanStep], policy: PlanPolicy) -> list[PlanIssue]:
    issues: list[PlanIssue] = []

    if len(steps) > 20:
        issues.append({"step_id": None, "code": "too_many_steps"})

    step_by_id: dict[str, PlanStep] = {}
    total_tokens = 0
    total_cost = 0

    # Build lookup first
    for step in steps:
        if step["id"] in step_by_id:
            issues.append({
                "step_id": step["id"],
                "code": "duplicate_step",
            })
        else:
            step_by_id[step["id"]] = step

    # Main validation loop
    for step in steps:
        step_id = step["id"]

        # estimates
        if (
            step["estimated_tokens"] < 0
            or step["estimated_cost_usd"] < 0
        ):
            issues.append({
                "step_id": step_id,
                "code": "invalid_estimate",
            })
        else:
            total_tokens += step["estimated_tokens"]
            total_cost += step["estimated_cost_usd"]

        # tool permissions
        if (
            step["tool_name"] not in policy["allowed_tools"]
            or step["tool_name"] not in policy["authorized_tools"]
        ):
            issues.append({
                "step_id": step_id,
                "code": "tool_forbidden",
            })

        # arguments
        if not policy["validate_args"](
            step["tool_name"],
            step["args"],
        ):
            issues.append({
                "step_id": step_id,
                "code": "invalid_arguments",
            })

        # approval
        if (
            step["tool_name"] in policy["high_risk_tools"]
            and (
                step["approval_ref"] is None
                or not policy["approval_valid"](step)
            )
        ):
            issues.append({
                "step_id": step_id,
                "code": "approval_required",
            })

        # dependencies
        seen_deps: set[str] = set()

        for dep in step["depends_on"]:
            if dep in seen_deps:
                issues.append({
                    "step_id": step_id,
                    "code": "duplicate_dependency",
                })
            else:
                seen_deps.add(dep)

            if dep not in step_by_id:
                issues.append({
                    "step_id": step_id,
                    "code": "missing_dependency",
                })

    # plan-wide budget
    if (
        total_tokens > policy["max_tokens"]
        or total_cost > policy["max_cost_usd"]
    ):
        issues.append({
            "step_id": None,
            "code": "budget_exceeded",
        })

    # cycle detection
    visited: set[str] = set()
    visiting: set[str] = set()

    def has_cycle(step_id: str) -> bool:
        if step_id in visiting:
            return True

        if step_id in visited:
            return False

        visiting.add(step_id)

        for dep in step_by_id[step_id]["depends_on"]:
            if dep in step_by_id and has_cycle(dep):
                return True

        visiting.remove(step_id)
        visited.add(step_id)

        return False

    for step in steps:
        if has_cycle(step["id"]):
            issues.append({
                "step_id": step["id"],
                "code": "cycle",
            })

    return issues