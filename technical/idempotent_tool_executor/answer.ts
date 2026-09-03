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

class TimeoutError extends Error {}

class IdempotentExecutor {
  private executions = new Map<
    string,
    Promise<ExecutionResult<unknown>>
  >();

  constructor(private readonly options: ExecutorOptions) {}

  private key<TArgs>(call: ToolCall<TArgs>): string {
    return `${call.tenantId}:${call.toolName}:${call.idempotencyKey}`;
  }

  async execute<TArgs, TResult>(
    call: ToolCall<TArgs>,
    handler: (args: TArgs) => Promise<TResult>,
  ): Promise<ExecutionResult<TResult>> {
    const key = this.key(call);

    const existing = this.executions.get(key);

    if (existing) {
      return existing as Promise<ExecutionResult<TResult>>;
    }

    const execution = this.run(call, handler);
    this.executions.set(key, execution);

    return execution;
  }

  private async run<TArgs, TResult>(
    call: ToolCall<TArgs>,
    handler: (args: TArgs) => Promise<TResult>,
  ): Promise<ExecutionResult<TResult>> {
    try {
      const value = await Promise.race([
        handler(call.args),

        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new TimeoutError("tool execution timed out"));
          }, this.options.timeoutMs);
        }),
      ]);

      return {
        status: "completed",
        value,
      };
    } catch (error) {
      if (error instanceof TimeoutError) {
        return {
          status: "indeterminate",
        };
      }

      return {
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }
}