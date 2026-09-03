type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

interface Job {
  jobId: string;
  documentId: string;
  content: string;
  status: JobStatus;
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  error: string | null;
}

class Mutex {
  private locked = false;
  private waiters: (() => void)[] = [];

  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }

    await new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });

    return () => this.release();
  }

  private release(): void {
    const next = this.waiters.shift();

    if (next) {
      next();
    } else {
      this.locked = false;
    }
  }
}

class JobManager {
  static readonly DEFAULT_MAX_RETRIES = 3;

  private jobs = new Map<string, Job>();
  private queue: string[] = [];
  private idempotencyMap = new Map<string, string>();
  private lock = new Mutex();

  // --- Private Unlocked Helpers ---

  private _enqueue(
    documentId: string,
    content: string,
    idempotencyKey?: string,
    maxRetries = JobManager.DEFAULT_MAX_RETRIES,
  ): string {
    if (idempotencyKey) {
      const existingJobId = this.idempotencyMap.get(idempotencyKey);

      if (existingJobId) {
        return existingJobId;
      }
    }

    const jobId = crypto.randomUUID();

    const job: Job = {
      jobId,
      documentId,
      content,
      status: "QUEUED",
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries,
      error: null,
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    if (idempotencyKey) {
      this.idempotencyMap.set(idempotencyKey, jobId);
    }

    return jobId;
  }

  private _getStatus(jobId: string): JobStatus | null {
    const job = this.jobs.get(jobId);
    return job?.status ?? null;
  }

  // --- Public Safe Interface ---

  async enqueue(
    documentId: string,
    content: string,
    idempotencyKey?: string,
    maxRetries = JobManager.DEFAULT_MAX_RETRIES,
  ): Promise<string> {
    const release = await this.lock.acquire();

    try {
      return this._enqueue(
        documentId,
        content,
        idempotencyKey,
        maxRetries,
      );
    } finally {
      release();
    }
  }

  async getStatus(jobId: string): Promise<JobStatus | null> {
    const release = await this.lock.acquire();

    try {
      return this._getStatus(jobId);
    } finally {
      release();
    }
  }

  async processNext(): Promise<Job | null> {
    let job: Job;

    // Step 1: dequeue under lock
    const release = await this.lock.acquire();

    try {
      const jobId = this.queue.shift();

      if (!jobId) {
        return null;
      }

      job = this.jobs.get(jobId)!;
      job.status = "PROCESSING";
    } finally {
      release();
    }

    // Step 2: process outside lock
    let isSuccess = false;
    let errorMessage: string | null = null;

    try {
      // Simulate RAG ingestion execution
      isSuccess = true;
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : String(error);
    }

    // Step 3: update retry/status under lock
    const releaseUpdate = await this.lock.acquire();

    try {
      if (isSuccess) {
        job.status = "COMPLETED";
        job.error = null;
      } else {
        job.error = errorMessage;

        if (job.retryCount < job.maxRetries) {
          job.retryCount += 1;
          job.status = "QUEUED";

          // requeue for retry
          this.queue.push(job.jobId);
        } else {
          job.status = "FAILED";
        }
      }
    } finally {
      releaseUpdate();
    }

    return job;
  }
}