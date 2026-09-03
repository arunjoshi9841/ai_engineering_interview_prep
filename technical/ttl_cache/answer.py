import time
from threading import Lock
from typing import Any, Callable, Optional, TypedDict


class CacheItem(TypedDict):
    value: Any
    expiry: float


class Stats(TypedDict):
    hits: int
    misses: int


class TTLCache:
    DEFAULT_CAPACITY = 100
    DEFAULT_TTL_SECONDS = 90

    def __init__(
        self,
        capacity: int = DEFAULT_CAPACITY,
        default_ttl_seconds: int = DEFAULT_TTL_SECONDS,
    ):
        self.capacity = capacity
        self.default_ttl_seconds = default_ttl_seconds
        self.cache: dict[str, CacheItem] = {}
        self.lock = Lock()

        self.hits = 0
        self.misses = 0

    def _set(self, key: str, value: Any, ttl_seconds: Optional[int]) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl_seconds
        # Uses monotonic clock to protect against system clock shifts
        expiry_time = time.monotonic() + ttl

        # dict.pop() removes key if present; avoids separate 'if key in self.cache' check
        self.cache.pop(key, None)

        if len(self.cache) >= self.capacity:
            # Evict LRU item (first key in insertion order)
            lru_key = next(iter(self.cache))
            self.cache.pop(lru_key)

        self.cache[key] = {"value": value, "expiry": expiry_time}

    def _get(self, key: str) -> Optional[Any]:
        # Single dict lookup using dict.get()
        item = self.cache.get(key)
        if item is None:
            self.misses += 1
            return None

        if time.monotonic() > item["expiry"]:
            self.cache.pop(key, None)
            self.misses += 1
            return None

        # Re-insert item via pop() to refresh MRU position cleanly
        item = self.cache.pop(key)
        self.cache[key] = item
        self.hits += 1

        return item["value"]

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        with self.lock:
            self._set(key, value, ttl_seconds)

    def get(self, key: str) -> Optional[Any]:
        with self.lock:
            return self._get(key)

    def get_or_set(
        self, key: str, ttl_seconds: int, factory: Callable[[], Any]
    ) -> Any:
        with self.lock:
            val = self._get(key)
            if val is not None:
                return val

            new_val = factory()
            self._set(key, new_val, ttl_seconds)
            return new_val

    def delete(self, key: str) -> None:
        with self.lock:
            self.cache.pop(key, None)

    def stats(self) -> Stats:
        with self.lock:
            return {"misses": self.misses, "hits": self.hits}