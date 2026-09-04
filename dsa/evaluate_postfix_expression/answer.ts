type EvalResult = { ok: true; value: number } | { ok: false; code: "malformed" | "division_by_zero" };

export function evaluatePostfix(
  tokens: readonly string[],
): { ok: true; value: number } | { ok: false; code: "malformed" | "division_by_zero" } {
  const stack: number[] = [];

  for (const token of tokens) {
    const value = Number(token);

    if (!Number.isNaN(value)) {
      stack.push(value);
      continue;
    }

    if (!["+", "-", "*", "/"].includes(token)) {
      return {
        ok: false,
        code: "malformed",
      };
    }

    if (stack.length < 2) {
      return {
        ok: false,
        code: "malformed",
      };
    }

    const right = stack.pop()!;
    const left = stack.pop()!;

    if (token === "+") {
      stack.push(left + right);
    } else if (token === "-") {
      stack.push(left - right);
    } else if (token === "*") {
      stack.push(left * right);
    } else if (token === "/") {
      if (right === 0) {
        return {
          ok: false,
          code: "division_by_zero",
        };
      }

      stack.push(Math.trunc(left / right));
    }
  }

  if (stack.length !== 1) {
    return {
      ok: false,
      code: "malformed",
    };
  }

  return {
    ok: true,
    value: stack.pop()!,
  };
}

export function isValidParentheses(input: string): boolean {
  const stack: string[] = [];

  const pairs: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const char of input) {
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
      continue;
    }

    if (char === ")" || char === "]" || char === "}") {
      if (stack.length === 0) {
        return false;
      }

      const opening = stack.pop();

      if (opening !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

export function simplifyPath(path: string): string {
  const stack: string[] = [];

  for (const part of path.split("/")) {
    if (part === "" || part === ".") {
      continue;
    }

    if (part === "..") {
      if (stack.length > 0) {
        stack.pop();
      }
      continue;
    }

    stack.push(part);
  }

  return "/" + stack.join("/");
}