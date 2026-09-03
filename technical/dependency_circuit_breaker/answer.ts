type BreakerState = "closed" | "open" | "half_open";

interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
  now?: () => number;
  isEligibleFailure: (error: unknown) => boolean;
}

class CircuitOpenError extends Error {
  constructor() {
    super("Circuit breaker is open");
  }
}

class CircuitBreaker {
  private failCount = 0;
  private lastFailTimestamp = 0;

  private probeInFlight = false;

  constructor(private readonly options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.state();

    if (state === "open") {
      throw new CircuitOpenError();
    }

    if (state === "half_open") {
      if (this.probeInFlight) {
        throw new CircuitOpenError();
      }

      this.probeInFlight = true;
    }

    try {
      const result = await operation();

      // Success means the downstream service appears healthy.
      this.failCount = 0;
      this.lastFailTimestamp = 0;

      return result;
    } catch (error) {
      if (this.options.isEligibleFailure(error)) {
        this.failCount++;
        this.lastFailTimestamp = this.now();
      }

      throw error;
    } finally {
      if (state === "half_open") {
        this.probeInFlight = false;
      }
    }
  }

  state(): BreakerState {
    if (this.failCount < this.options.failureThreshold) {
      return "closed";
    }

    const cooldownElapsed =
      this.now() - this.lastFailTimestamp >= this.options.cooldownMs;

    if (cooldownElapsed) {
      return "half_open";
    }

    return "open";
  }

  private now(): number {
    return this.options.now?.() ?? Date.now();
  }
}