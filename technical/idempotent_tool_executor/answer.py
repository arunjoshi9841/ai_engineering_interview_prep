import asyncio
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Generic, TypeVar, Union


TArgs = TypeVar("TArgs")
TResult = TypeVar("TResult")


@dataclass
class ToolCall(Generic[TArgs]):
    tenant_id: str
    tool_name: str
    idempotency_key: str
    args: TArgs


@dataclass
class ExecutorOptions:
    timeout_seconds: float


@dataclass
class Completed(Generic[TResult]):
    status: str
    value: TResult


@dataclass
class Failed:
    status: str
    message: str


@dataclass
class Indeterminate:
    status: str


ExecutionResult = Union[Completed[TResult], Failed, Indeterminate]


class IdempotentExecutor:
    def __init__(self, options: ExecutorOptions):
        self.options = options

        # key -> in-flight/completed task
        self.executions: dict[
            str,
            asyncio.Task[ExecutionResult[Any]]
        ] = {}

        self.lock = asyncio.Lock()

    def _make_key(self, call: ToolCall[Any]) -> str:
        return (
            f"{call.tenant_id}:"
            f"{call.tool_name}:"
            f"{call.idempotency_key}"
        )

    async def execute(
        self,
        call: ToolCall[TArgs],
        handler: Callable[[TArgs], Awaitable[TResult]],
    ) -> ExecutionResult[TResult]:

        key = self._make_key(call)

        async with self.lock:
            existing = self.executions.get(key)

            if existing is not None:
                return await existing

            task = asyncio.create_task(
                self._run(call, handler)
            )

            self.executions[key] = task

        return await task

    async def _run(
        self,
        call: ToolCall[TArgs],
        handler: Callable[[TArgs], Awaitable[TResult]],
    ) -> ExecutionResult[TResult]:

        try:
            value = await asyncio.wait_for(
                handler(call.args),
                timeout=self.options.timeout_seconds,
            )

            return Completed(
                status="completed",
                value=value,
            )

        except asyncio.TimeoutError:
            return Indeterminate(
                status="indeterminate",
            )

        except Exception as error:
            return Failed(
                status="failed",
                message=str(error),
            )