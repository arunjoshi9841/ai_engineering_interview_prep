# Document Ingestion Job Manager

## 1. Interview Prompt

A RAG service accepts documents through an API, but parsing and indexing may take longer than an HTTP request should remain open. Implement an in-memory job manager that accepts ingestion work, exposes job status, and processes queued jobs with bounded retries.

The interviewer will provide a synchronous document-processing function that either completes successfully or raises an exception. Focus on queue and state behavior rather than document parsing.

## 2. Requirements

- `enqueue` accepts a document ID, content, an optional idempotency key, and a retry limit, then returns a job ID.
- Reusing a non-empty idempotency key returns the original job ID and must not enqueue duplicate work.
- New jobs start as `QUEUED` and are processed in FIFO order.
- `get_status` returns the current status or `None` for an unknown job ID.
- `process_next` returns `None` when no work is available.
- Before processing begins, the selected job becomes `PROCESSING`.
- A successful attempt becomes `COMPLETED`.
- A failed attempt is requeued while retries remain; otherwise it becomes `FAILED` and retains a safe error description.
- `max_retries` counts retries after the initial attempt.
- Queue and job-state operations must be safe for multiple worker threads in one process.
- Slow document processing must not block unrelated calls to `enqueue` or `get_status`.
- Persistence and recovery after a process restart are outside the initial implementation.

## 3. Example Input / Output

```text
enqueue("doc-17", "...", idempotency_key="upload-42") -> "job-a"
enqueue("doc-17", "...", idempotency_key="upload-42") -> "job-a"
get_status("job-a")                                    -> "QUEUED"

process_next() succeeds
get_status("job-a")                                    -> "COMPLETED"
```

For a job configured with `max_retries=2`, a failed first attempt is requeued with `retry_count=1`; a failed first retry is requeued with `retry_count=2`; a failed second retry, the third total attempt, becomes `FAILED`.

## 4. What the Interviewer Is Evaluating

- Queue and state-machine organization
- Idempotency and retry semantics
- Correct lock scope under concurrent workers
- Clear failure handling and status contracts
- Ability to distinguish an interview-sized implementation from a durable production design

## 5. Concept Questions and Interview Answers

### Why should document processing happen outside the manager's coordination lock?

**Interview answer:**

> The lock should protect short state transitions, not slow ingestion work. Holding it during processing would block status reads, new submissions, and other workers, turning one slow document into system-wide head-of-line blocking.

### Why does an idempotent enqueue not make processing exactly once?

**Interview answer:**

> It deduplicates repeated submissions for the same logical job, but a worker can still retry after an uncertain outcome or crash. Side effects inside processing need their own stable operation identity or reconciliation strategy.
