# Valid Anagram

## 1. Interview Prompt

Given two strings containing lowercase English letters, determine whether one is an anagram of the other. An anagram must contain exactly the same letters with the same frequencies in a different or identical order.

Implement the function in a language of your choice without sorting either string.

## 2. Requirements

- Inputs contain only characters `a` through `z`.
- Comparison is case-sensitive under that restricted alphabet.
- Empty strings are anagrams of each other.
- Repeated letters must have equal counts.
- Do not sort or modify the inputs.
- Aim for linear time and constant auxiliary space relative to the fixed alphabet.

## 3. Example Input / Output

```text
"listen", "silent" -> true
"aab", "aba"       -> true
"aab", "abb"       -> false
"", ""             -> true
```

## 4. What the Interviewer Is Evaluating

- Character-frequency reasoning
- Use of fixed-domain constraints
- Edge cases and early rejection
- Complexity explanation

## 5. Concept Questions and Interview Answers

### Why must normalization be specified before comparing natural-language strings?

**Interview answer:**

> Case, punctuation, accents, and canonically equivalent Unicode sequences can be treated as equal or different depending on the product. Without a stated policy, “same characters” is ambiguous and valid implementations can disagree.

### Why is auxiliary space constant in the restricted problem?

**Interview answer:**

> The amount of counting state is bounded by the fixed 26-letter alphabet rather than by input length. With an unbounded character set, the same style of state could grow with distinct characters.
