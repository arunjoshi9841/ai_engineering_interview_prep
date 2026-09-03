# Concurrent Document Batch with Partial Failures

## 1. Interview Question

You receive 200 documents and must call an external extraction API once per document. Return one outcome per input in input order, including failures, and never run more than five calls at once.

Explain why an unbounded `Promise.all` or `asyncio.gather` may be unsafe, how fail-fast and collect-all behavior differ, and implement a small bounded version.

## 2. What the Interviewer Is Testing

- Concurrent batch execution without unbounded fan-out
- `Promise.all` versus `Promise.allSettled`
- `asyncio.gather` with and without `return_exceptions=True`
- Partial-failure contracts and stable input/result mapping
- Semaphore, worker-pool, or `p-limit`-style concurrency control

## 3. Strong Candidate Answer

Starting all 200 calls at once may exhaust sockets, memory, a provider quota, or the downstream service. I would bound concurrency and return an explicit success/failure result for each document so one bad input does not erase useful results.

`Promise.all` fulfills when all inputs fulfill and rejects as soon as one rejects; it does not automatically cancel siblings. `Promise.allSettled` waits for every input and returns a status for each. `Promise.any` returns the first fulfillment and rejects only if all reject, while `Promise.race` settles with the first settlement, successful or not. None of these combinators is a concurrency limiter.

By default, `asyncio.gather` propagates the first exception to its waiter; `return_exceptions=True` collects exceptions alongside values. It also does not provide a concurrency bound. A semaphore or fixed worker pool supplies that bound. I would catch errors at the per-item boundary and keep stable IDs or array positions.

## 4. TypeScript Example

```ts
type Outcome<T> =
  | { id: string; ok: true; value: T }
  | { id: string; ok: false; error: string };

async function extractBatch<T>(
  docs: readonly { id: string; text: string }[],
  extract: (text: string) => Promise<T>,
  limit = 5,
): Promise<Outcome<T>[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("limit must be a positive integer");
  }
  const results = new Array<Outcome<T>>(docs.length);
  let next = 0;

  async function worker() {
    while (next < docs.length) {
      const index = next++;
      const doc = docs[index];
      try {
        results[index] = { id: doc.id, ok: true, value: await extract(doc.text) };
      } catch (error) {
        results[index] = { id: doc.id, ok: false, error: "extraction failed" };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, docs.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
```

A small library such as `p-limit` can express the same policy in application code, but the interview concept is the concurrency gate, not the package.

## 5. Python Example

```py
import asyncio
from collections.abc import Awaitable, Callable

async def extract_batch(
    docs: list[dict[str, str]],
    extract: Callable[[str], Awaitable[object]],
    limit: int = 5,
) -> list[dict[str, object]]:
    if limit < 1:
        raise ValueError("limit must be positive")
    semaphore = asyncio.Semaphore(limit)

    async def run_one(doc: dict[str, str]) -> dict[str, object]:
        async with semaphore:
            try:
                value = await extract(doc["text"])
                return {"id": doc["id"], "ok": True, "value": value}
            except Exception:
                return {"id": doc["id"], "ok": False, "error": "extraction failed"}

    # gather preserves the order of its awaitable arguments.
    return await asyncio.gather(*(run_one(doc) for doc in docs))
```

This creates one coroutine per document but permits only five extraction calls inside the semaphore. For extremely large or streaming inputs, use a bounded queue and a fixed number of workers so even pending tasks remain bounded.

## 6. Likely Follow-Up Questions

1. What happens to sibling operations after `Promise.all` rejects?
2. When would `Promise.allSettled` be preferable to catching inside each task?
3. How does `asyncio.gather(..., return_exceptions=True)` change the result contract?
4. Is a semaphore enough for a stream containing millions of documents?
5. How would rate limits, cancellation, or retries interact with the concurrency limit?

## 7. Common Mistakes / Red Flags

- Calling `Promise.all` or `gather` a concurrency limiter
- Launching an unbounded number of external calls
- Losing the mapping between an error and its input document
- Assuming fail-fast aggregation cancels or rolls back completed sibling calls
- Holding a semaphore while sleeping for a long retry delay without discussing throughput
