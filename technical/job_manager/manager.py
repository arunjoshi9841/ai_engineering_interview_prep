import time
import uuid
from collections import deque
from threading import Lock
from typing import Dict, Optional, TypedDict


class Job(TypedDict):
    job_id: str
    document_id: str
    content: str
    status: str  # "QUEUED", "PROCESSING", "COMPLETED", "FAILED"
    created_at: float
    retry_count: int
    max_retries: int
    error: Optional[str]


class JobManager:
    DEFAULT_MAX_RETRIES = 3

    def __init__(self) -> None:
        self.jobs: Dict[str, Job] = {}
        self.queue: deque[str] = deque()
        self.idempotency_map: Dict[str, str] = {}
        self.lock = Lock()

    # --- Private Unlocked Helpers ---

    def _enqueue(
        self,
        document_id: str,
        content: str,
        idempotency_key: Optional[str] = None,
        max_retries: int = DEFAULT_MAX_RETRIES,
    ) -> str:
        if idempotency_key and idempotency_key in self.idempotency_map:
            return self.idempotency_map[idempotency_key]

        job_id = str(uuid.uuid4())
        job: Job = {
            "job_id": job_id,
            "document_id": document_id,
            "content": content,
            "status": "QUEUED",
            "created_at": time.time(),
            "retry_count": 0,
            "max_retries": max_retries,
            "error": None,
        }

        self.jobs[job_id] = job
        self.queue.append(job_id)

        if idempotency_key:
            self.idempotency_map[idempotency_key] = job_id

        return job_id

    def _get_status(self, job_id: str) -> Optional[str]:
        job = self.jobs.get(job_id)
        return job["status"] if job else None

    # --- Public Thread-Safe Interface ---

    def enqueue(
        self,
        document_id: str,
        content: str,
        idempotency_key: Optional[str] = None,
        max_retries: int = DEFAULT_MAX_RETRIES,
    ) -> str:
        with self.lock:
            return self._enqueue(document_id, content, idempotency_key, max_retries)

    def get_status(self, job_id: str) -> Optional[str]:
        with self.lock:
            return self._get_status(job_id)

    def process_next(self) -> Optional[Job]:
        job: Optional[Job] = None

        # Step 1: Dequeue next job under lock
        with self.lock:
            if not self.queue:
                return None
            job_id = self.queue.popleft()
            job = self.jobs[job_id]
            job["status"] = "PROCESSING"

        # Step 2: Perform processing outside lock
        is_success = False
        error_msg = None
        try:
            # Simulate RAG ingestion execution
            is_success = True
        except Exception as e:
            error_msg = str(e)

        # Step 3: Handle status & retry state under lock
        with self.lock:
            if is_success:
                job["status"] = "COMPLETED"
                job["error"] = None
            else:
                job["error"] = error_msg
                if job["retry_count"] < job["max_retries"]:
                    job["retry_count"] += 1
                    job["status"] = "QUEUED"
                    # Requeue for next attempt
                    self.queue.append(job["job_id"])
                else:
                    job["status"] = "FAILED"

        return job