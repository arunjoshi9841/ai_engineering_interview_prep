interface LoopState {
  startedAtMs: number;
  stepsUsed: number;
  toolCallsUsed: number;
  tokensUsed: number;
  recentActionSignatures: readonly string[];
}

type Proposal =
  | { kind: "tool"; toolName: string; args: unknown; risk: "low" | "high" }
  | { kind: "finish"; text: string };

interface LoopPolicy {
  maxSteps: number;
  maxToolCalls: number;
  maxTokens: number;
  maxElapsedMs: number;
  allowedTools: ReadonlySet<string>;
  actionSignature(proposal: Extract<Proposal, { kind: "tool" }>): string;
}

type GuardDecision =
  | { outcome: "continue" }
  | { outcome: "stop"; reason: "finished" | "step_budget" | "tool_budget" | "token_budget" | "deadline" }
  | { outcome: "escalate"; reason: "tool_forbidden" | "approval_required" | "repeated_action" | "invalid_finish" };

export function guardNextStep(
  state: LoopState,
  proposal: Proposal,
  policy: LoopPolicy,
  nowMs: number,
): GuardDecision {
  throw new Error("not implemented");
}
