import time
from typing import Any, Awaitable, Callable, NotRequired, TypedDict


class CircuitOpenError(Exception):
    """Raised when an operation is executed while the circuit is open."""
    pass


class CircuitBreakerOptions(TypedDict):
    failure_threshold: int
    cooldown_ms: int
    now: NotRequired[Callable[[], int]]
    is_eligible_failure: NotRequired[Callable[[BaseException], bool]]


class CircuitBreaker:
    def __init__(self, options: CircuitBreakerOptions) -> None:
        self.options = options
        self.fail_count = 0
        self.last_fail_time_stamp = 0
        self.probe_in_flight = False

    def now(self) -> int:
        if "now" in self.options and self.options["now"] is not None:
            return self.options["now"]()
        return int(time.time() * 1000)

    def state(self) -> str:
        if self.fail_count < self.options["failure_threshold"]:
            return "closed"

        time_has_elapsed = (self.now() - self.last_fail_time_stamp) > self.options["cooldown_ms"]
        if time_has_elapsed:
            return "half_open"

        return "open"

    async def execute(self, operation: Callable[[], Awaitable[Any]]) -> Any:
        current_state = self.state()

        if current_state == "open":
            raise CircuitOpenError("Circuit is OPEN")

        if current_state == "half_open":
            if self.probe_in_flight:
                raise CircuitOpenError("Circuit is HALF-OPEN (probe in flight)")
            self.probe_in_flight = True

        try:
            result = await operation()

            # Success means the downstream service appears healthy.
            self.fail_count = 0
            self.last_fail_time_stamp = 0

            return result
        except BaseException as error:
            is_eligible = self.options.get("is_eligible_failure")
            
            # Count failure if option is omitted OR if the callback returns True
            if is_eligible is None or is_eligible(error):
                self.fail_count += 1
                self.last_fail_time_stamp = self.now()

            raise error
        finally:
            if current_state == "half_open":
                self.probe_in_flight = False