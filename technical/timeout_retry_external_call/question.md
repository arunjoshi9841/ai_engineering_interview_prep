# Timeout and Safe Retry for an External Call

## 1. Interview Question

An agent calls an external ticketing API. The dependency sometimes hangs, returns `429`, or returns `400`. Add a per-attempt timeout and a small exponential-backoff retry policy. Explain which failures you would retry, how cancellation should work, and why a timeout does not prove that a ticket was not created.

Keep the implementation interview-sized. Assume the caller supplies one stable idempotency key for the logical create operation.

## 2. What the Interviewer Is Testing

- Time bounds and cooperative cancellation
- `Promise.race`, `AbortController`, `asyncio.wait_for`, and `asyncio.timeout`
- Exponential backoff and selective retry decisions
- Idempotency and ambiguous outcomes for side-effecting APIs
- Awareness that abandoning a wait is not the same as stopping underlying work

## 3. Strong Candidate Answer

A timeout bounds how long this caller waits; it does not establish the downstream result. The ticketing service may commit a ticket and lose or delay the response. I would send the same stable idempotency key on every attempt and rely on the service's idempotency contract or reconcile an ambiguous outcome before issuing a new logical operation.

I would usually retry transient transport failures, `408`, `429`, and selected `5xx` responses, respecting `Retry-After` where supported. Most other `4xx` responses are caller errors and should fail immediately. Retries need a small cap, exponential backoff, and normally jitter; they also consume an overall latency budget.

In JavaScript, `Promise.race` alone only stops waiting for the losing Promise. `AbortController` must be passed to `fetch` so it can cooperatively cancel the request. In Python, `asyncio.timeout` or `asyncio.wait_for` cancels the awaited coroutine on expiry, but cleanup is still cooperative and an external service cannot be rolled back by local cancellation.

## 4. TypeScript Example

```ts
const retryable = (status: number) =>
  status === 408 || status === 429 || status >= 500;

class NonRetryableError extends Error {}

async function createTicket(body: object, key: string): Promise<unknown> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error("ticket request timed out"));
      }, 2_000);
    });

    let response: Response;
    try {
      response = await Promise.race([
        fetch("https://tickets.example/v1/tickets", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": key,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }),
        timeout,
      ]);

    } catch (error) {
      if (attempt === 2) throw error;
      // In real code, distinguish caller cancellation from retryable failures.
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
      continue;
    } finally {
      if (timer) clearTimeout(timer);
    }

    if (response.ok) return await response.json();
    if (!retryable(response.status)) {
      throw new NonRetryableError(`non-retryable HTTP ${response.status}`);
    }
    if (attempt === 2) throw new Error(`retryable HTTP ${response.status}`);
    await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
  }
  throw new Error("unreachable");
}
```

The production version should combine an external caller signal with the per-attempt signal, never retry caller-initiated cancellation, add jitter, and honor an overall deadline.

## 5. Python Example

```py
import asyncio
import httpx

def retryable(status: int) -> bool:
    return status in {408, 429} or status >= 500


async def create_ticket(
    body: dict[str, object],
    key: str,
    client: httpx.AsyncClient,
) -> object:
    for attempt in range(3):
        try:
            async with asyncio.timeout(2):
                response = await client.post(
                    "/v1/tickets",
                    json=body,
                    headers={"Idempotency-Key": key},
                )
            if response.is_success:
                return response.json()
            if not retryable(response.status_code):
                raise RuntimeError(
                    f"non-retryable HTTP {response.status_code}"
                )
        except (TimeoutError, httpx.RequestError):
            if attempt == 2:
                raise

        if attempt == 2:
            raise RuntimeError("retryable HTTP failure")
        await asyncio.sleep(0.1 * 2**attempt)

    raise RuntimeError("unreachable")
```

For Python versions without the timeout context manager, `await asyncio.wait_for(operation(), timeout=2)` expresses the same per-attempt bound. A production policy would add jitter, observe `Retry-After`, preserve cancellation, and validate the JSON response.

## 6. Likely Follow-Up Questions

1. Why is `Promise.race([operation, timeout])` insufficient by itself?
2. Which failures are retryable, and why are most `4xx` responses not?
3. What should happen if the caller cancels during exponential backoff?
4. How would you add jitter and an overall deadline?
5. What can you do when the external API does not support idempotency keys?

## 7. Common Mistakes / Red Flags

- Retrying every error, including validation failures and caller cancellation
- Creating a fresh idempotency key for each retry
- Claiming a timeout proves no external side effect occurred
- Using `Promise.race` while leaving unobserved underlying work running
- Retrying forever, synchronizing every caller on identical delays, or ignoring `Retry-After`
