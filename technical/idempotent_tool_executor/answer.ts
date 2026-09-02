interface ToolCall<TArgs> {
  tenantId: string;
  toolName: string;
  idempotencyKey: string;
  args: TArgs;
}

interface ExecutorOptions {
  timeoutMs: number;
}

type ExecutionResult<TResult> =
  | { status: "completed"; value: TResult }
  | { status: "failed"; message: string }
  | { status: "indeterminate" };

class IdempotentExecutor {
  constructor(private readonly options: ExecutorOptions) {}

  execute<TArgs, TResult>(
    call: ToolCall<TArgs>,
    handler: (args: TArgs) => Promise<TResult>,
  ): Promise<ExecutionResult<TResult>> {
    // Candidate implementation
    throw new Error("not implemented");
  }
}
