# Sparse Vector Dot Product

## 1. Interview Prompt

Two very high-dimensional vectors contain mostly zeros. Each vector is supplied as its nonzero entries sorted by index. Return their dot product without expanding either vector into a dense array.

Implement the function in TypeScript and explain the complexity in terms of the nonzero entries.

## 2. Requirements

- Each entry contains a non-negative integer index and a nonzero finite value.
- Entries within each vector are strictly increasing by index.
- The logical vector dimensions are equal, but the dimension may be much larger than either entry list.
- Missing indices represent zero.
- Empty vectors are valid.
- Do not mutate the inputs or allocate a dense vector.
- Aim for time linear in the total number of supplied entries and constant auxiliary space.
- Assume products and the final sum remain finite JavaScript numbers.

## 3. Example Input / Output

```text
left  = [{ index: 0, value: 2 }, { index: 5, value: 3 }]
right = [{ index: 1, value: 7 }, { index: 5, value: 4 }]
result = 12

left = []
right = [{ index: 2, value: 9 }]
result = 0
```

## 4. What the Interviewer Is Evaluating

- Exploitation of sorted sparse representations
- Efficient intersection reasoning
- Boundary handling and loop invariants
- Complexity analysis using sparse input size

## 5. Concept Questions and Interview Answers

### Why express complexity using nonzero counts?

**Interview answer:**

> The dense dimension may be enormous but is not represented or visited. The actual input size is the number of stored entries, so that is the meaningful basis for time and memory analysis.

### What tradeoff does a map representation make?

**Interview answer:**

> A map supports direct expected-time lookup and tolerates arbitrary input order, but it adds hashing and memory overhead. Sorted entries can be more compact and enable ordered processing.
