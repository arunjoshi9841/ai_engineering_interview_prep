type Verdict = "benign" | "suspicious" | "unknown";
type SpecialistOutcome =
  | { specialist: string; status: "succeeded"; verdict: Verdict; confidence: number; evidenceIds: readonly string[] }
  | { specialist: string; status: "failed" | "timed_out"; code: string };

interface AggregateResult {
  status: "complete" | "partial";
  needsReview: boolean;
  missing: readonly string[];
  evidenceIds: readonly string[];
  outcomes: readonly SpecialistOutcome[];
}

type AggregateResponse =
  | { ok: true; result: AggregateResult }
  | { ok: false; code: "invalid_configuration" | "invalid_outcome" | "duplicate_specialist" | "unexpected_specialist" };

export function aggregateSpecialists(
  expected: readonly string[],
  outcomes: readonly SpecialistOutcome[],
  confidenceThreshold: number,
): AggregateResponse {
  throw new Error("not implemented");
}
