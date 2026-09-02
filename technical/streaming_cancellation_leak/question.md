# Streaming Cancellation Leak

## 1. Interview Prompt

An HTTP endpoint streams model output to a client. Production metrics show that model requests continue consuming tokens after users close the page, and memory grows during frequent reconnects. Diagnose the provided TypeScript code and revise it so cancellation and cleanup are correct.

Focus on one server process and one streaming request. Do not redesign the HTTP framework or model SDK.

## 2. Requirements

- Start one upstream model stream per accepted request.
- When the client connection closes, propagate cancellation to the upstream operation promptly.
- Do not write to or end a response after the connection is no longer writable.
- Release request listeners and upstream stream resources on success, client cancellation, and model failure.
- Cleanup must be safe if more than one terminal event occurs.
- Record client cancellation separately from upstream failure.
- Do not expose raw model or internal error content to the client.

## 3. Provided Code

```ts
interface ModelClient {
  stream(prompt: string, options: { signal: AbortSignal }): AsyncIterable<string>;
}

export async function streamAnswer(
  request: NodeJS.EventEmitter & { body: { prompt: string } },
  response: {
    write(chunk: string): boolean;
    end(chunk?: string): void;
    destroyed: boolean;
    writableEnded: boolean;
    headersSent: boolean;
    statusCode: number;
  },
  model: ModelClient,
): Promise<void> {
  const controller = new AbortController();

  request.on("close", () => {
    metrics.increment("stream.closed");
  });

  const chunks = model.stream(request.body.prompt, { signal: controller.signal });

  for await (const chunk of chunks) {
    response.write(chunk);
  }

  response.end();
}
```

Assume the model iterator observes `AbortSignal` and may also expose cleanup through its async-iterator `return()` behavior.

## 4. Example Input / Output

```text
client disconnects after chunk 4
current behavior: upstream generation continues; later writes target a destroyed response
required behavior: upstream is aborted, no later response write occurs, and cleanup runs once

model fails before any chunk
required behavior: classify as upstream failure, clean up, and return a safe server response when still writable
```

## 5. What the Interviewer Is Evaluating

- Diagnosis of async resource leaks
- Abort propagation and terminal-state reasoning
- Listener and iterator cleanup
- Safe error classification under races

## 6. Concept Questions and Interview Answers

### Why is cancellation cooperative?

**Interview answer:**

> An abort signal communicates that work should stop, but each downstream layer must observe it and release its own resources. It cannot forcibly interrupt arbitrary JavaScript or an external provider that ignores cancellation.

### Why should cleanup be idempotent?

**Interview answer:**

> Disconnect, timeout, iterator failure, and shutdown can race. A cleanup path that tolerates repeated calls prevents double-ending responses, removing resources inconsistently, or miscounting outcomes.
