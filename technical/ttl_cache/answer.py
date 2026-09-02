from typing import Any, Callable, Optional, TypedDict


class Stats(TypedDict):
    hits: int
    misses: int


class TTLCache:
    def __init__(self, capacity: int = 100, default_ttl_seconds: int = 90):
        ...

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ...

    def get(self, key: str) -> Optional[Any]:
        ...

    def get_or_set(
        self,
        key: str,
        ttl_seconds: int,
        factory: Callable[[], Any],
    ) -> Any:
        ...

    def delete(self, key: str) -> None:
        ...

    def stats(self) -> Stats:
        ...
