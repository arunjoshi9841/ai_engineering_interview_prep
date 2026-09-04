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
  | {
      code: "timeout" | "unavailable" | "malformed_response";
    };

type AdapterResult =
  | { ok: true; account: AccountStatus }
  | { ok: false; error: AdapterError };

class LegacyAccountAdapter {
  constructor(private readonly client: LegacyClient) {}

  async getStatus(
    accountId: string,
    signal: AbortSignal,
  ): Promise<AdapterResult> {
    try {
      const resp = await this.client.getAccount(accountId, signal);

      if (resp.status === 404) {
        return {
          ok: false,
          error: { code: "not_found" },
        };
      }

      if (resp.status === 429) {
        const rawRetryAfter = resp.headers["retry-after"];
        const parsedRetryAfter = rawRetryAfter ? Number(rawRetryAfter) : NaN;

        return {
          ok: false,
          error: {
            code: "rate_limited",
            retryAfterSeconds:
              Number.isFinite(parsedRetryAfter) && parsedRetryAfter >= 0
                ? parsedRetryAfter
                : undefined,
          },
        };
      }

      if (resp.status === 503) {
        return {
          ok: false,
          error: { code: "unavailable" },
        };
      }

      if (resp.status !== 200) {
        return {
          ok: false,
          error: { code: "unavailable" },
        };
      }

      // Legacy API can return logical errors with HTTP 200
      if (
        typeof resp.body === "object" &&
        resp.body !== null &&
        "error" in resp.body
      ) {
        const body = resp.body as {
          error?: {
            code?: unknown;
          };
        };

        if (body.error?.code === "MISSING") {
          return {
            ok: false,
            error: { code: "not_found" },
          };
        }

        return {
          ok: false,
          error: { code: "malformed_response" },
        };
      }

      const account = this.normalizeAccount(resp.body);

      if (!account) {
        return {
          ok: false,
          error: { code: "malformed_response" },
        };
      }

      return {
        ok: true,
        account,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false,
          error: { code: "timeout" },
        };
      }

      return {
        ok: false,
        error: { code: "unavailable" },
      };
    }
  }

  private normalizeAccount(body: unknown): AccountStatus | null {
    if (typeof body !== "object" || body === null) {
      return null;
    }

    const value = body as Record<string, unknown>;

    // v1
    if ("status_code" in value) {
      const hasExpectedTypes =
        typeof value.account_id === "string" &&
        value.account_id.trim().length > 0 &&
        typeof value.status_code === "string" &&
        (value.updated_at === null || typeof value.updated_at === "string");

      if (!hasExpectedTypes) {
        return null;
      }

      const stateMap: Record<string, AccountStatus["state"]> = {
        A: "active",
        S: "suspended",
        C: "closed",
      };

      const state = stateMap[value.status_code as string];

      if (!state) {
        return null;
      }

      return {
        accountId: value.account_id as string,
        state,
        updatedAt: value.updated_at as string | null,
      };
    }

    // v2
    if ("state" in value) {
      const hasExpectedTypes =
        typeof value.accountId === "string" &&
        value.accountId.trim().length > 0 &&
        typeof value.state === "string" &&
        (value.updatedAt === null || typeof value.updatedAt === "string");

      if (!hasExpectedTypes) {
        return null;
      }

      const stateMap: Record<string, AccountStatus["state"]> = {
        ACTIVE: "active",
        SUSPENDED: "suspended",
        CLOSED: "closed",
      };

      const state = stateMap[value.state as string];

      if (!state) {
        return null;
      }

      return {
        accountId: value.accountId as string,
        state,
        updatedAt: value.updatedAt as string | null,
      };
    }

    return null;
  }
}
