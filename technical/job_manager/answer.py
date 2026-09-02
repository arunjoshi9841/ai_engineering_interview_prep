from typing import Optional, TypedDict


class Job(TypedDict):
    job_id: str
    document_id: str
    content: str
    status: str
    created_at: float
    retry_count: int
    max_retries: int
    error: Optional[str]


class JobManager:
    def enqueue(
        self,
        document_id: str,
        content: str,
        idempotency_key: Optional[str] = None,
        max_retries: int = 3,
    ) -> str:
        ...

    def get_status(self, job_id: str) -> Optional[str]:
        ...

    def process_next(self) -> Optional[Job]:
        ...
