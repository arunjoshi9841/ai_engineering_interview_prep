# TTL Cache

## 1. Interview Prompt

An enterprise AI service repeatedly loads configuration and retrieval metadata from a slow dependency. Implement a small, in-memory cache that supports time-based expiration and a fixed capacity.

Keep the first version synchronous and local to one Python process. Focus on correctness, clear state management, and behavior under concurrent callers rather than integrating a distributed cache.

## 2. Requirements

- Store values under string keys with either a caller-supplied TTL or a default TTL.
- `get` returns the stored value when it is present and unexpired; otherwise it returns `None`.
- Values expire lazily when accessed. A background cleanup thread is not required.
- When the cache is at capacity, inserting a new key evicts the least recently used unexpired key.
- A successful `get` refreshes the key's recency but does not extend its TTL.
- `get_or_set` returns a cached value or calls the supplied factory once to populate the missing key.
- Track cache hits and misses. An absent or expired key counts as one miss.
- Public operations must be safe when called by multiple threads in the same process.
- For the initial exercise, keys and values are small, configured capacities and TTLs are positive, and `None` is not a cacheable value.

## 3. Example Input / Output

```text
cache = TTLCache(capacity=2, default_ttl_seconds=30)

set("policy:a", valueA)
set("policy:b", valueB)
get("policy:a")                 -> valueA
set("policy:c", valueC)        -> evicts "policy:b"
get("policy:b")                 -> None

get_or_set("policy:d", 10, loadD) -> returns loadD() and caches its result
```

If `policy:a` is accessed after its expiration time, `get("policy:a")` returns `None` and records a miss.

## 4. What the Interviewer Is Evaluating

- Requirement clarification and edge-case discipline
- Appropriate map and ordering choices for bounded caching
- TTL and clock reasoning
- Thread-safety and lock-scope judgment
- Complexity awareness and testability

## 5. Concept Questions and Interview Answers

### Why should expiration use a monotonic clock?

**Interview answer:**

> TTL is an elapsed-time calculation. A monotonic clock only moves forward, so an NTP correction or manual wall-clock change cannot unexpectedly extend or immediately expire entries.

### What is the tradeoff in holding one lock while the factory runs?

**Interview answer:**

> It prevents duplicate loads, but one slow factory blocks every cache operation, including unrelated keys. In production I would usually coordinate loading per key, then publish the completed value safely into the shared cache.
