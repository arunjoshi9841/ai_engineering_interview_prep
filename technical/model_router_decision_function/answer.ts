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
  | {
      ok: true;
      modelId: string;
      preferenceOrder: readonly Preference[];
    }
  | {
      ok: false;
      code: "invalid_policy" | "no_eligible_model";
    };

export function chooseModel(
  request: RouteRequest,
  candidates: readonly ModelCandidate[],
  preferenceOrder: readonly Preference[],
): RouteResult {
  // Validate policy: each preference exactly once
  if (
    preferenceOrder.length !== 3 ||
    new Set(preferenceOrder).size !== 3 ||
    !preferenceOrder.includes("quality") ||
    !preferenceOrder.includes("cost") ||
    !preferenceOrder.includes("latency")
  ) {
    return {
      ok: false,
      code: "invalid_policy",
    };
  }

  const eligible = candidates.filter((model) => {
    if (!model.healthy) {
      return false;
    }

    if (!model.allowedTenants.has(request.tenantId)) {
      return false;
    }

    if (!model.regions.has(request.region)) {
      return false;
    }

    for (const capability of request.requiredCapabilities) {
      if (!model.capabilities.has(capability)) {
        return false;
      }
    }

    if (request.contextTokens > model.maxContextTokens) {
      return false;
    }

    if (model.estimatedCostUsd > request.maxCostUsd) {
      return false;
    }

    if (model.estimatedLatencyMs > request.maxLatencyMs) {
      return false;
    }

    return true;
  });

  if (eligible.length === 0) {
    return {
      ok: false,
      code: "no_eligible_model",
    };
  }

  const ranked = [...eligible].sort((a, b) => {
    for (const preference of preferenceOrder) {
      if (preference === "quality") {
        if (a.qualityScore !== b.qualityScore) {
          return b.qualityScore - a.qualityScore;
        }
      }

      if (preference === "cost") {
        if (a.estimatedCostUsd !== b.estimatedCostUsd) {
          return a.estimatedCostUsd - b.estimatedCostUsd;
        }
      }

      if (preference === "latency") {
        if (a.estimatedLatencyMs !== b.estimatedLatencyMs) {
          return a.estimatedLatencyMs - b.estimatedLatencyMs;
        }
      }
    }

    // Complete deterministic tie-break
    return a.id.localeCompare(b.id);
  });

  return {
    ok: true,
    modelId: ranked[0].id,
    preferenceOrder: [...preferenceOrder],
  };
}