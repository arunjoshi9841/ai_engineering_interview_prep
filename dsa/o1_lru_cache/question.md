# O(1) LRU Cache

## 1. Interview Prompt

Implement a fixed-capacity least-recently-used cache. Both lookup and insertion must run in constant time. When an insertion exceeds capacity, evict the entry that has gone unused for the longest time.

Implement the class in TypeScript.

## 2. Requirements

- Keys and values are numbers.
- `get(key)` returns the value or `undefined` when absent.
- A successful `get` makes that key most recently used.
- `put` updates an existing key's value and makes it most recently used.
- Inserting a new key at capacity evicts exactly the least recently used key.
- Capacity may be `0`; such a cache stores nothing.
- Each `get` and `put` must be `O(1)` average time.
- Do not rely on scanning keys or timestamps to choose an eviction victim.

## 3. Example Input / Output

```text
cache = new LRUCache(2)
put(1, 10)
put(2, 20)
get(1)     -> 10        // key 1 becomes most recent
put(3, 30)              // evicts key 2
get(2)     -> undefined
get(3)     -> 30
put(1, 11)              // updates key 1; size remains 2
```

## 4. What the Interviewer Is Evaluating

- Composition of hash lookup and linked recency ordering
- Pointer and size invariants
- Update, eviction, and zero-capacity edge cases
- Complexity discipline

## 5. Concept Questions and Interview Answers

### Why is average-case complexity stated separately from worst-case complexity?

**Interview answer:**

> Hash-based operations are normally constant time on average, but pathological collision behavior can make the worst case slower. The stated cache contract uses the usual average-case hash-table assumption.
