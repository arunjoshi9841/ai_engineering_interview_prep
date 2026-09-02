# Evaluate Postfix Expression

## 1. Interview Prompt

Evaluate an arithmetic expression supplied as postfix tokens. Operands are integers; operators are `+`, `-`, `*`, and `/`.

Implement the function in TypeScript and reject malformed expressions.

## 2. Requirements

- Each operand token is a canonical signed decimal integer.
- Each binary operator consumes the two most recent values in left-to-right operand order.
- Division truncates toward zero and division by zero is invalid.
- Exactly one value must remain after all tokens.
- Empty input, unknown tokens, missing operands, and extra operands are invalid.
- Assume valid intermediate results remain safe integers.
- Use linear time and stack space proportional to expression depth.

## 3. Example Input / Output

```text
["2","1","+","3","*"] -> 9
["4","13","5","/","+"] -> 6
["5","2","-"] -> 3
["+"] -> malformed
["2","0","/"] -> division_by_zero
```

## 4. What the Interviewer Is Evaluating

- Stack evaluation order
- Parsing and malformed-input handling
- Noncommutative operator correctness

## 5. Concept Questions and Interview Answers

### Why is postfix convenient to evaluate?

**Interview answer:**

> Operator order is explicit, so no precedence rules or parentheses are needed. A stack retains operands until an operator consumes them.
