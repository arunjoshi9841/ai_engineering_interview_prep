from collections import deque
import time


class RateLimiter:
    MAX_REQUESTS = 3
    WINDOW_SECONDS = 60

    def __init__(self, max_requests: int = MAX_REQUESTS, window_seconds: int = WINDOW_SECONDS) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.timestamps: deque[float] = deque()

    def allow_request(self) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds

        # Evict timestamps outside the 60s sliding window
        while self.timestamps and self.timestamps[0] <= cutoff:
            self.timestamps.popleft()

        # Enforce rate limit
        if len(self.timestamps) < self.max_requests:
            self.timestamps.append(now)
            return True
        return False


# from fastapi import FastAPI, HTTPException, Response, status

# app = FastAPI()


# @app.get("/api/ingest")
# async def ingest_document():
#     # If rate limit exceeded (e.g., limit is 3 requests per 60s)
#     retry_after_seconds = 45

#     return Response(
#         content='{"error": "Rate limit exceeded"}',
#         status_code=status.HTTP_429_TOO_MANY_REQUESTS,
#         headers={
#             "Retry-After": str(retry_after_seconds),
#             "Content-Type": "application/json",
#         },
#     )