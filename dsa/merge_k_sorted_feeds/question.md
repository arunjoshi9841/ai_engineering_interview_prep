# Merge K Sorted Feeds

## 1. Interview Prompt

Given `k` arrays sorted by ascending timestamp, merge them into one ordered event list. For equal timestamps, events from the smaller feed index come first; within a feed, preserve input order.

Implement the function in TypeScript without repeatedly scanning every feed.

## 2. Requirements

- Each feed is sorted nondecreasingly by timestamp.
- Preserve every event, including equal timestamps and duplicate payloads.
- Apply feed-index tie-breaking deterministically.
- Do not modify inputs.
- For `N` total events and `k` feeds, aim for `O(N log k)` time and `O(k)` selection space excluding output.

## 3. Example Input / Output

```text
feed0=[(1,a),(3,c)]
feed1=[(1,b),(2,d)]
-> [(1,a),(1,b),(2,d),(3,c)]

[] or [[],[]] -> []
```

## 4. What the Interviewer Is Evaluating

- Heap-based multiway merge
- Stable tie-breaking and feed cursor state
- Empty-feed and complexity handling

## 5. Concept Questions and Interview Answers

### Why does the heap need only one event per feed?

**Interview answer:**

> The next possible global event from a sorted feed is its current head. After consuming it, only that feed's next event can become a new candidate.
