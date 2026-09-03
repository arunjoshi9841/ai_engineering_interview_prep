# Merge Sorted Arrays

## 1. Interview Prompt

Two arrays are sorted in nondecreasing order. The first has trailing capacity for every value in the second. Merge the second array into the first in place.

Implement the function in a language of your choice in linear time without sorting the combined result or allocating another array proportional to the inputs.

## 2. Requirements

- `first` has length `firstCount + second.length`; only its first `firstCount` positions initially contain sorted values.
- Its remaining positions contain placeholders that are not part of the input data.
- `second` is sorted and may contain duplicates and negative values.
- Modify `first` so it contains every value in nondecreasing order; do not modify `second`.
- Use `O(firstCount + second.length)` time and constant auxiliary space.

## 3. Example Input / Output

```text
first=[1,3,5,0,0,0], firstCount=3, second=[2,3,4]
-> first=[1,2,3,3,4,5]

first=[0,0], firstCount=0, second=[1,2]
-> first=[1,2]

first=[-2,0,0], firstCount=1, second=[-3,7]
-> first=[-3,-2,7]
```

## 4. What the Interviewer Is Evaluating

- Reverse pointer traversal without overwriting unread values
- Exhaustion and duplicate handling
- In-place boundary management
- Complexity and code clarity

## 5. Concept Questions and Interview Answers

### Why is the merge linear?

**Interview answer:**

> Each populated input position is read and written at most once, so total work is proportional to the combined number of values.
