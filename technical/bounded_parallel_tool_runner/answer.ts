interface ToolRequest<TArgs> {
    id: string;
    args: TArgs;
}

type ToolResult<TResult> =
    | { id: string; status: "succeeded"; value: TResult }
    | { id: string; status: "failed"; message: string }
    | { id: string; status: "cancelled" };

export async function runTools<TArgs, TResult>(
    requests: readonly ToolRequest<TArgs>[],
    handler: (request: ToolRequest<TArgs>, signal: AbortSignal) => Promise<TResult>,
    maxConcurrency: number,
    signal: AbortSignal,
): Promise<ToolResult<TResult>[]> {

   if (maxConcurrency <= 0) {
        throw new Error("maxConcurrency must be a positive integer.");
    }

    if(requests.length ===0) return [];

    let res:ToolResult<TResult>[] = new Array(requests.length);
    let nextIndex = 0;

    async function runTool(req: ToolRequest<TArgs>): Promise<ToolResult<TResult>> {
        try {
            if(signal.aborted) {
                return {
                    id: req.id,
                    status: "cancelled"
                }
            }
            const value = await handler(req, signal);
            if(signal.aborted) {
                return {
                    id: req.id,
                    status: "cancelled"
                }
            }
            return {
                id: req.id,
                status: "succeeded",
                value
            }
        } catch(err) {
            if(signal.aborted) {
                return {
                    id: req.id,
                    status: "cancelled"
                }
            }
            return {
                id: req.id,
                status: "failed",
                message: err instanceof Error ? err.message : String(err)
            }
        }
    }

    async function worker() {
        while (nextIndex < requests.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            if(signal.aborted) {
                res[currentIndex] = {
                    id: requests[currentIndex].id,
                    status: "cancelled"
                }
                continue;
            }
            res[currentIndex] = await runTool(requests[currentIndex])
        }
    }

    const poolSize = Math.min(maxConcurrency, requests.length);
    const workers = Array.from({length: poolSize}, ()=>worker())
    await Promise.all(workers)

    return res
}