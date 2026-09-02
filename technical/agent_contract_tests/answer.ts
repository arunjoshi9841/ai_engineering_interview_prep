interface LookupRequest {
  tenantId: string;
  customerId: string;
}

type LookupResult =
  | { ok: true; customer: { id: string; state: "active" | "closed" } }
  | {
      ok: false;
      error: {
        code:
          | "invalid_request"
          | "not_found"
          | "rate_limited"
          | "timeout"
          | "unavailable"
          | "malformed_response"
          | "cancelled";
        retryAfterSeconds?: number;
      };
    };

interface CustomerLookupAdapter {
  lookup(request: LookupRequest, signal: AbortSignal): Promise<LookupResult>;
}

interface ContractFixture {
  adapter: CustomerLookupAdapter;
  arrange(
    outcome:
      | "success"
      | "not_found"
      | "rate_limited"
      | "timeout"
      | "unavailable"
      | "malformed_response"
      | "pending_until_abort"
      | "sensitive_failure",
  ): Promise<void>;
  dependencyAttemptCount(): number;
  capturedTelemetry(): readonly unknown[];
  close(): Promise<void>;
}

type FixtureFactory = () => Promise<ContractFixture>;

export function customerLookupContract(
  name: string,
  createFixture: FixtureFactory,
): void {
  throw new Error("not implemented");
}
