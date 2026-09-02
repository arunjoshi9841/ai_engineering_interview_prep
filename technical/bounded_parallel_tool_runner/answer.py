import asyncio
from typing import Awaitable, Callable, Generic, List, TypeVar, TypedDict, Union


TArgs = TypeVar("TArgs")
TResult = TypeVar("TResult")

class ToolRequest(TypedDict, Generic[TArgs]):
    id: str
    args: TArgs

class SucceededToolResult(TypedDict, Generic[TResult]):
    id: str
    status: str # "succeeded"
    value: TResult

class FailedToolResult(TypedDict):
    id: str
    status: str # "failed"
    message: str

class CancelledToolResult(TypedDict):
    id: str
    status: str # "cancelled"

ToolResult = Union[SucceededToolResult[TResult], FailedToolResult, CancelledToolResult]

async def run_tools(requests: List[ToolRequest[TArgs]], handler: Callable[[ToolRequest[TArgs], asyncio.Event],
                      Awaitable[TResult]],
    max_concurrency: int,
    signal: asyncio.Event) -> List[ToolResult[TResult]]:
    
    
    if not requests:
        return []
    
    res:List[ToolResult[TResult]] = [None] * len(requests)

    if max_concurrency <= 0:
        raise ValueError("max_concurrency must be greater than 0")
    
    next_index: int = 0
    
    async def run_tool(request: ToolRequest[TArgs]):
        try:
            if signal.is_set():
                return {
                    "id": request["id"],
                    "status": "cancelled"
                }
            value = await handler(request, signal)
            if signal.is_set():
                return {
                    "id": request["id"],
                    "status": "cancelled"
                }
            return {
                "id": request["id"],
                "status": "succeeded",
                "value": value
            }
        except Exception as e:
            if signal.is_set():
                return {
                    "id": request["id"],
                    "status": "cancelled"
                }
            return {
                "id": request["id"],
                "status": "failed",
                "message": str(e)
            }
    async def worker():
        nonlocal next_index
        while True:
            async with lock:
                if next_index >= len(requests):
                    break
                index = next_index
                next_index += 1
            if signal.is_set():
                res[index] = {
                    "id": requests[index]["id"],
                    "status": "cancelled"
                }
                continue
            res[index] = await run_tool(requests[index])
    pool_size = min(max_concurrency, len(requests))
    tasks = [asyncio.create_task(worker()) for _ in range(pool_size)]
    await asyncio.gather(*tasks)
    return res
    