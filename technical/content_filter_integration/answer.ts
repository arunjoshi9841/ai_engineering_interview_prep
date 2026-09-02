type FilterDecision =
  | { allowed: true; policyVersion: string }
  | { allowed: false; category: string; policyVersion: string; reviewRef: string };
interface ContentFilter { classify(text: string, signal: AbortSignal): Promise<FilterDecision>; }
interface Generator { generate(input: string, signal: AbortSignal): Promise<string>; }
type SafeGenerationResult =
  | { status: "completed"; output: string; policyVersion: string }
  | { status: "blocked"; stage: "input" | "output"; category: string; reviewRef: string }
  | { status: "failed"; code: "invalid_input" | "filter_unavailable" | "model_failed" | "cancelled" };

export async function generateWithSafety(
  input: string,
  filter: ContentFilter,
  generator: Generator,
  signal: AbortSignal,
): Promise<SafeGenerationResult> {
  throw new Error("not implemented");
}
