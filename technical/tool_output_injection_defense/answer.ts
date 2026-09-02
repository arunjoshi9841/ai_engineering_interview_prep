interface Observation {
  trust: "untrusted_external_data";
  sourceTool: "fetch_web_page";
  url: string;
  title: string;
  content: string;
}

type Proposal =
  | { kind: "answer"; text: string }
  | { kind: "tool"; toolName: string; args: unknown };

interface ActionPolicy {
  allowedTools: ReadonlySet<string>;
  authorizedTools: ReadonlySet<string>;
  highRiskTools: ReadonlySet<string>;
  validateArgs(toolName: string, args: unknown): boolean;
}

type ActionDecision =
  | { outcome: "continue" }
  | { outcome: "reject"; code: "tool_forbidden" | "invalid_arguments" }
  | { outcome: "approval_required" };

export function normalizeWebObservation(raw: unknown): Observation {
  throw new Error("not implemented");
}

export function evaluateNextProposal(
  proposal: Proposal,
  policy: ActionPolicy,
): ActionDecision {
  throw new Error("not implemented");
}
