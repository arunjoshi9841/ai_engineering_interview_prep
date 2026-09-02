type BreakerState = "closed" | "open" | "half_open";

interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
  now?: () => number;
  isEligibleFailure: (error: unknown) => boolean;
}

class CircuitOpenError extends Error {}

class CircuitBreaker {
  constructor(private readonly options: CircuitBreakerOptions) {}

  execute<T>(operation: () => Promise<T>): Promise<T> {
    throw new Error("not implemented");
  }

  state(): BreakerState {
    throw new Error("not implemented");
  }
}
