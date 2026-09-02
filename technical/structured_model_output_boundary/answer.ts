type Category = "billing" | "access" | "security";
type Action = "reply" | "request_more_information" | "escalate";

interface ModelDecision {
  category: Category;
  confidence: number;
  action: Action;
  reason: string;
}

type ParseResult =
  | { ok: true; decision: ModelDecision }
  | { ok: false; code: "invalid_json" | "invalid_schema" | "policy_violation" };

export function parseModelDecision(raw: string): ParseResult {
  throw new Error("not implemented");
}
