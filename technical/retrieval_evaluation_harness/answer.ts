interface EvalCase { id: string; query: string; relevantDocumentIds: ReadonlySet<string>; }
interface Retriever { search(query: string, k: number): Promise<readonly string[]>; }
type CaseResult =
  | { id: string; ok: true; recallAtK: number; reciprocalRank: number }
  | { id: string; ok: false; code: "retriever_failed" | "duplicate_result" };
interface EvalReport {
  cases: readonly CaseResult[];
  meanRecallAtK: number | null;
  meanReciprocalRank: number | null;
  failureCount: number;
}

export async function evaluateRetrieval(
  cases: readonly EvalCase[],
  retriever: Retriever,
  k: number,
): Promise<EvalReport> {
  throw new Error("not implemented");
}
