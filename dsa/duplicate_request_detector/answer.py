def firstDuplicateRequest(request_ids: list[str]) -> str | None:
    seen: set[str] = set()

    for request in request_ids:
        if request in seen:
            return request

        seen.add(request)

    return None