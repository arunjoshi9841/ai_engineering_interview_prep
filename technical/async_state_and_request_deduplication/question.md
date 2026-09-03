# Async State and In-Flight Request Deduplication

## 1. Interview Question

An API receives several simultaneous requests for the same document. Each handler checks an in-memory cache and, on a miss, calls an expensive parser. Review common async-loop mistakes, explain whether races can occur in single-threaded JavaScript or one Python event loop, and implement in-flight deduplication so concurrent callers share one parse operation.

The completed value may be cached elsewhere; focus here on deduplicating work that is currently in progress and cleaning up after success or failure.

## 2. What the Interviewer Is Testing

- Correct async iteration in TypeScript and Python
- Why `forEach(async ...)` does not await callback Promises
- Logical races across `await` suspension points
- When `asyncio.Lock` or another coordination mechanism is useful
- The in-flight Promise/Task deduplication pattern and cleanup correctness

## 3. Strong Candidate Answer

Concurrency bugs do not require simultaneous CPU instructions. In JavaScript, one event-loop thread can interleave multiple handlers whenever one awaits; two handlers can both observe a missing entry and both start the same request. Python coroutines have the same check-then-await interleaving risk. Local variables are isolated, but shared mutable state and multi-step invariants need coordination.

In JavaScript, `array.forEach(async item => ...)` ignores the Promises returned by the callback, so the outer function finishes before the work. Use `for...of` with `await` for sequential processing, or create Promises and await an aggregate for concurrent processing. In Python, `for item in items: await work(item)` is sequential. Building coroutine objects without awaiting or scheduling them does no work; use `gather`/tasks for concurrency.

For in-flight deduplication, store the Promise or Task synchronously before yielding control and return it to later callers. Remove it in `finally`, but only if the map still refers to that same operation. In Python, a short lock around check-and-publish makes the invariant explicit and remains necessary if construction or surrounding logic can yield. Never hold the lock while awaiting the slow parse. This only deduplicates within one process; cross-process deduplication needs shared durable coordination or downstream idempotency.

## 4. TypeScript Example

```ts
const inFlight = new Map<string, Promise<ParsedDocument>>();

function parseOnce(id: string): Promise<ParsedDocument> {
  const existing = inFlight.get(id);
  if (existing) return existing;

  const promise = parseDocument(id);
  inFlight.set(id, promise); // publish before any await in this function

  const cleanup = () => {
    if (inFlight.get(id) === promise) inFlight.delete(id);
  };
  void promise.then(cleanup, cleanup);
  return promise;
}

async function sequential(ids: string[]) {
  for (const id of ids) await parseOnce(id);
}

async function concurrent(ids: string[]) {
  await Promise.all(ids.map((id) => parseOnce(id)));
}

// Avoid: ids.forEach(async (id) => { await parseOnce(id); });
```

The single-threaded check-and-set is atomic with respect to other JavaScript callbacks because it contains no `await`. A mutex would become relevant with worker threads, a yielding gap, or a more complex shared invariant.

## 5. Python Example

```py
import asyncio

in_flight: dict[str, asyncio.Task[object]] = {}
in_flight_lock = asyncio.Lock()

async def _run_and_cleanup(document_id: str) -> object:
    try:
        return await parse_document(document_id)
    finally:
        current = asyncio.current_task()
        async with in_flight_lock:
            if in_flight.get(document_id) is current:
                in_flight.pop(document_id)


async def parse_once(document_id: str) -> object:
    async with in_flight_lock:
        task = in_flight.get(document_id)
        if task is None:
            task = asyncio.create_task(_run_and_cleanup(document_id))
            in_flight[document_id] = task

    # One cancelled waiter should not cancel work shared by other callers.
    return await asyncio.shield(task)


async def sequential(ids: list[str]) -> None:
    for document_id in ids:
        await parse_once(document_id)


async def concurrent(ids: list[str]) -> None:
    await asyncio.gather(*(parse_once(document_id) for document_id in ids))
```

Cancellation policy needs an explicit decision: one caller cancelling should often stop waiting without cancelling the shared task for every other caller, for example by awaiting it through `asyncio.shield`.

## 6. Likely Follow-Up Questions

1. Why does `forEach(async ...)` often return before its callbacks finish?
2. Can a race condition occur in single-threaded JavaScript? Give a check-then-act example.
3. When can Python avoid `asyncio.Lock`, and why should slow work not run while holding it?
4. What should happen if one waiter cancels while other callers still need the shared operation?
5. How would this design change with multiple Node.js processes or FastAPI workers?

## 7. Common Mistakes / Red Flags

- Assuming one event-loop thread makes every multi-step operation race-free
- Using `forEach(async ...)` and never observing callback rejections
- Creating Python coroutine objects without awaiting or scheduling them
- Holding a lock while awaiting slow external work
- Leaving rejected Promises or failed Tasks permanently in the in-flight map
- Claiming an in-memory map deduplicates work across processes
