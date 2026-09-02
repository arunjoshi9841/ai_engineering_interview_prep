interface PromptVersion {
  tenantId: string;
  promptName: string;
  version: string;
  status: "active" | "inactive";
}

interface Rollout {
  id: string;
  stableVersion: string;
  candidateVersion?: string;
  candidatePercent: number;
}

interface ResolveRequest {
  tenantId: string;
  promptName: string;
  actorKey: string;
  pinnedVersion?: string;
}

type Resolution =
  | { ok: true; version: string; rolloutId: string; reason: "pinned" | "stable" | "candidate" }
  | { ok: false; code: "invalid_config" | "version_unavailable" };

export function resolvePrompt(
  request: ResolveRequest,
  rollout: Rollout,
  versions: readonly PromptVersion[],
): Resolution {
  throw new Error("not implemented");
}
