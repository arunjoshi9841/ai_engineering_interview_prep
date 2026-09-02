interface ModelCandidate {
  id: string;
  healthy: boolean;
  allowedTenants: ReadonlySet<string>;
  regions: ReadonlySet<string>;
  capabilities: ReadonlySet<string>;
  maxContextTokens: number;
  estimatedCostUsd: number;
  estimatedLatencyMs: number;
  qualityScore: number;
}

interface RouteRequest {
  tenantId: string;
  region: string;
  requiredCapabilities: ReadonlySet<string>;
  contextTokens: number;
  maxCostUsd: number;
  maxLatencyMs: number;
}

type Preference = "quality" | "cost" | "latency";
type RouteResult =
  | { ok: true; modelId: string; preferenceOrder: readonly Preference[] }
  | { ok: false; code: "invalid_policy" | "no_eligible_model" };

export function chooseModel(
  request: RouteRequest,
  candidates: readonly ModelCandidate[],
  preferenceOrder: readonly Preference[],
): RouteResult {
  throw new Error("not implemented");
}
