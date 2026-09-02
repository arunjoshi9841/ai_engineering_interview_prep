interface PlanStep {
  id: string;
  dependsOn: readonly string[];
  toolName: string;
  args: unknown;
  estimatedTokens: number;
  estimatedCostUsd: number;
  approvalRef?: string;
}
interface PlanPolicy {
  allowedTools: ReadonlySet<string>;
  authorizedTools: ReadonlySet<string>;
  highRiskTools: ReadonlySet<string>;
  maxTokens: number;
  maxCostUsd: number;
  validateArgs(toolName: string, args: unknown): boolean;
  approvalValid(step: PlanStep): boolean;
}
interface PlanIssue {
  stepId?: string;
  code:
    | "too_many_steps"
    | "duplicate_step"
    | "duplicate_dependency"
    | "missing_dependency"
    | "cycle"
    | "tool_forbidden"
    | "invalid_arguments"
    | "approval_required"
    | "invalid_estimate"
    | "budget_exceeded";
}

export function validatePlan(
  steps: readonly PlanStep[],
  policy: PlanPolicy,
): readonly PlanIssue[] {
  const issues: PlanIssue[] = [];

  // 1. Plan-level checks
  if (steps.length > 20) {
    issues.push({ code: "too_many_steps" });
  }

  const totalTokens = steps.reduce((sum, s) => sum + s.estimatedTokens, 0);
  const totalCost = steps.reduce((sum, s) => sum + s.estimatedCostUsd, 0);

  if (
    totalTokens > policy.maxTokens ||
    totalCost > policy.maxCostUsd
  ) {
    issues.push({ code: "budget_exceeded" });
  }

  const stepById = new Map<string, PlanStep>();

  for (const step of steps) {
    if (stepById.has(step.id)) {
      issues.push({ stepId: step.id, code: "duplicate_step" });
    } else {
      stepById.set(step.id, step);
    }
  }

  // 2. Per-step checks
  for (const step of steps) {
    if (
      !Number.isFinite(step.estimatedTokens) ||
      !Number.isFinite(step.estimatedCostUsd) ||
      step.estimatedTokens < 0 ||
      step.estimatedCostUsd < 0
    ) {
      issues.push({ stepId: step.id, code: "invalid_estimate" });
    }

    if (
      !policy.allowedTools.has(step.toolName) ||
      !policy.authorizedTools.has(step.toolName)
    ) {
      issues.push({ stepId: step.id, code: "tool_forbidden" });
    }

    if (!policy.validateArgs(step.toolName, step.args)) {
      issues.push({ stepId: step.id, code: "invalid_arguments" });
    }

    if (
      policy.highRiskTools.has(step.toolName) &&
      (!step.approvalRef || !policy.approvalValid(step))
    ) {
      issues.push({ stepId: step.id, code: "approval_required" });
    }

    const seenDeps = new Set<string>();

    for (const dep of step.dependsOn) {
      if (seenDeps.has(dep)) {
        issues.push({ stepId: step.id, code: "duplicate_dependency" });
      }

      seenDeps.add(dep);

      if (!stepById.has(dep)) {
        issues.push({ stepId: step.id, code: "missing_dependency" });
      }
    }
  }

  // 3. Cycle detection
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function hasCycle(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;

    visiting.add(id);

    const step = stepById.get(id);

    if (step) {
      for (const dep of step.dependsOn) {
        if (stepById.has(dep) && hasCycle(dep)) {
          return true;
        }
      }
    }

    visiting.delete(id);
    visited.add(id);
    return false;
  }

  for (const step of steps) {
    visiting.clear();

    if (hasCycle(step.id)) {
      issues.push({ stepId: step.id, code: "cycle" });
    }
  }

  return issues;
}
