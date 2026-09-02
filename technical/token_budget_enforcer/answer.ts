type ReserveResult =
  | { ok: true; reservationId: string }
  | { ok: false; code: "budget_exhausted" | "invalid_estimate" };

interface BudgetSummary {
  limit: number;
  reserved: number;
  consumed: number;
  available: number;
}

class TokenBudget {
  constructor(limit: number) {}

  reserve(estimatedTokens: number): ReserveResult {
    throw new Error("not implemented");
  }

  settle(reservationId: string, actualTokens: number): void {
    throw new Error("not implemented");
  }

  cancel(reservationId: string): void {
    throw new Error("not implemented");
  }

  summary(): BudgetSummary {
    throw new Error("not implemented");
  }
}
