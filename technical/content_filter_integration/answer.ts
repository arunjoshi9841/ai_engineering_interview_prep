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
  const max_input_length = 10_000;

  if (signal.aborted) {
    return { status: "failed", code: "cancelled" };
  }
  if (input.trim() === "") {
    return { status: "failed", code: "invalid_input" };
  }
    
  const text = input.slice(0, max_input_length);

  // 1. Classify Input
  let inputDecision: FilterDecision;
  try {
    inputDecision = await filter.classify(text, signal);
  } catch (error) {
    if (signal.aborted) {
      return { status: "failed", code: "cancelled" };
    }
    return { status: "failed", code: "filter_unavailable" };
  }

  if (!inputDecision.allowed) {
    return {
      status: "blocked",
      stage: "input",
      category: inputDecision.category,
      reviewRef: inputDecision.reviewRef,
    };
  }

  // 2. Generate Output
  let output: string;
  try {
    if (signal.aborted) {
      return { status: "failed", code: "cancelled" };
    }
    output = await generator.generate(text, signal);
  } catch (error) {
    if (signal.aborted) {
      return { status: "failed", code: "cancelled" };
    }
    return { status: "failed", code: "model_failed" };
  }

  // 3. Classify Output
  let outputDecision: FilterDecision;
  try {
    if (signal.aborted) {
      return { status: "failed", code: "cancelled" };
    }
    outputDecision = await filter.classify(output, signal);
  } catch (error) {
    if (signal.aborted) {
      return { status: "failed", code: "cancelled" };
    }
    return { status: "failed", code: "filter_unavailable" };
  }

  if (!outputDecision.allowed) {
    return {
      status: "blocked",
      stage: "output",
      category: outputDecision.category,
      reviewRef: outputDecision.reviewRef,
    };
  }

  // 4. Return Completed Result with exact policyVersion
  return {
    status: "completed",
    output,
    policyVersion: outputDecision.policyVersion,
  };
}