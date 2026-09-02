type RiskLevel = "low" | "high";

interface CallerContext {
  tenantId: string;
  permissions: ReadonlySet<string>;
  requestId: string;
}

interface ToolDefinition<TArgs, TResult> {
  name: string;
  requiredPermission: string;
  risk: RiskLevel;
  validate(args: unknown): args is TArgs;
  execute(args: TArgs, caller: CallerContext): Promise<TResult>;
}

type DispatchResult<TResult> =
  | { ok: true; value: TResult }
  | { ok: false; reason: "unknown_tool" | "invalid_arguments" | "forbidden" };

class ToolRegistry {
  register<TArgs, TResult>(tool: ToolDefinition<TArgs, TResult>): void {
    // Candidate implementation
  }

  dispatch(
    caller: CallerContext,
    proposed: { toolName: string; args: unknown },
  ): Promise<DispatchResult<unknown>> {
    // Candidate implementation
    throw new Error("not implemented");
  }
}
