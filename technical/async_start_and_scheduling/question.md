# Async Start and Scheduling

## 1. Interview Question

An AI assistant must call a retrieval API and a policy API before it can build a prompt. The calls are independent. Explain what a Promise and a coroutine represent, identify whether the code below runs sequentially or concurrently, and rewrite it to minimize latency without introducing threads.

```text
retrieval = await retrieveContext(question)
policy = await loadPolicy(userId)
return buildPrompt(retrieval, policy)
```

Then explain what actually starts each operation in modern TypeScript/Node.js and Python `asyncio`.

## 2. What the Interviewer Is Testing

- A language-agnostic model of async work and cooperative concurrency
- Sequential versus concurrent `await`
- `Promise.all`, `asyncio.gather`, and `asyncio.create_task`
- The difference between creating an awaitable and starting or scheduling work
- Recognition that concurrency is useful for independent I/O, not dependent steps

## 3. Strong Candidate Answer

An async result is a handle to work that may complete later. Awaiting it suspends the current async function so the event loop can run other work; it does not block the thread. The original code is sequential because the second operation is not started until the first finishes.

For independent I/O, start or schedule both operations before awaiting their combined results. In JavaScript, calling an `async` function begins executing its body synchronously until its first suspension and immediately returns a Promise; calling `fetch` initiates the request. Storing those Promises starts both operations before `Promise.all` waits for them. `Promise.all` does not itself make already-created work concurrent—it aggregates the Promises and rejects when one rejects.

In Python, calling an `async def` function normally creates a coroutine object but does not run it. `await asyncio.gather(coro1, coro2)` schedules its coroutine arguments, while `asyncio.create_task(coro)` explicitly schedules a coroutine immediately and returns a Task. Creating tasks first is useful when work must run while the current coroutine does something else; for simply awaiting a group, `gather` is enough. Dependent operations should remain sequential.

## 4. TypeScript Example

```ts
async function preparePrompt(question: string, userId: string) {
  // Calling both functions creates and starts both Promise-producing operations.
  const retrievalPromise = retrieveContext(question);
  const policyPromise = loadPolicy(userId);

  const [retrieval, policy] = await Promise.all([
    retrievalPromise,
    policyPromise,
  ]);

  return buildPrompt(retrieval, policy);
}
```

If `loadPolicy` needs a value returned by `retrieveContext`, the two calls are dependent and should not be started together.

## 5. Python Example

```py
import asyncio

async def prepare_prompt(question: str, user_id: str) -> str:
    # Calling these functions produces coroutine objects; gather schedules them.
    retrieval_coro = retrieve_context(question)
    policy_coro = load_policy(user_id)

    retrieval, policy = await asyncio.gather(
        retrieval_coro,
        policy_coro,
    )
    return build_prompt(retrieval, policy)


async def explicitly_scheduled(question: str, user_id: str) -> str:
    retrieval_task = asyncio.create_task(retrieve_context(question))
    policy_task = asyncio.create_task(load_policy(user_id))
    retrieval, policy = await asyncio.gather(retrieval_task, policy_task)
    return build_prompt(retrieval, policy)
```

## 6. Likely Follow-Up Questions

1. What happens to the other operations when one input to `Promise.all` or `asyncio.gather` fails?
2. When would you prefer `create_task` over passing coroutines directly to `gather`?
3. Does async code make CPU-heavy model preprocessing faster?
4. How do `Promise.allSettled`, `Promise.race`, and `Promise.any` differ from `Promise.all`?
5. How would you measure whether the concurrent version actually improved latency?

## 7. Common Mistakes / Red Flags

- Saying `await` creates a new thread or makes an operation concurrent by itself
- Writing `await first(); await second();` and calling it concurrent
- Claiming `Promise.all` starts Promises that were already started when created
- Assuming a Python coroutine runs merely because its object was created
- Parallelizing calls when the second depends on the first or when fan-out is unbounded

