def evaluatePostfix(tokens: list[str]) -> dict[str, object]:
    stack = []

    for token in tokens:
        try:
            value = int(token)
            stack.append(value)
            continue
        except ValueError:
            pass

        if token not in {"+", "-", "*", "/"}:
            return {
                "ok": False,
                "code": "malformed",
            }

        if len(stack) < 2:
            return {
                "ok": False,
                "code": "malformed",
            }

        right = stack.pop()
        left = stack.pop()

        if token == "+":
            stack.append(left + right)

        elif token == "-":
            stack.append(left - right)

        elif token == "*":
            stack.append(left * right)

        elif token == "/":
            if right == 0:
                return {
                    "ok": False,
                    "code": "division_by_zero",
                }

            stack.append(int(left / right))

    if len(stack) != 1:
        return {
            "ok": False,
            "code": "malformed",
        }

    return {
        "ok": True,
        "value": stack.pop(),
    }