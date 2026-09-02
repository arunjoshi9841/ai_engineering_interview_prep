type EvalResult = { ok: true; value: number } | { ok: false; code: "malformed" | "division_by_zero" };
export function evaluatePostfix(tokens: readonly string[]): EvalResult {
  throw new Error("not implemented");
}
