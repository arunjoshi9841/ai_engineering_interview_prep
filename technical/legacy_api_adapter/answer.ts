interface LegacyResponse {
  status: number;
  headers: Readonly<Record<string, string | undefined>>;
  body: unknown;
}

interface LegacyClient {
  getAccount(accountId: string, signal: AbortSignal): Promise<LegacyResponse>;
}

interface AccountStatus {
  accountId: string;
  state: "active" | "suspended" | "closed";
  updatedAt: string | null;
}

type AdapterError =
  | { code: "not_found" }
  | { code: "rate_limited"; retryAfterSeconds?: number }
  | { code: "timeout" | "unavailable" | "malformed_response" };

type AdapterResult =
  | { ok: true; account: AccountStatus }
  | { ok: false; error: AdapterError };

class LegacyAccountAdapter {
  constructor(private readonly client: LegacyClient) {}

  getStatus(accountId: string, signal: AbortSignal): Promise<AdapterResult> {
    throw new Error("not implemented");
  }
}
