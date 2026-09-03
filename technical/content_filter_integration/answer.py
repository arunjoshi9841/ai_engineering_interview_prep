import asyncio
from dataclasses import dataclass
from typing import Literal, Protocol, Union

# --- Filter Decision Types ---

@dataclass(frozen=True)
class AllowedDecision:
    policyVersion: str
    allowed: Literal[True] = True

@dataclass(frozen=True)
class BlockedDecision:
    category: str
    policyVersion: str
    reviewRef: str
    allowed: Literal[False] = False

FilterDecision = Union[AllowedDecision, BlockedDecision]


# --- Safe Generation Result Types ---

@dataclass(frozen=True)
class CompletedResult:
    output: str
    policyVersion: str
    status: Literal["completed"] = "completed"

@dataclass(frozen=True)
class BlockedResult:
    stage: Literal["input", "output"]
    category: str
    reviewRef: str
    status: Literal["blocked"] = "blocked"

@dataclass(frozen=True)
class FailedResult:
    code: Literal["invalid_input", "filter_unavailable", "model_failed", "cancelled"]
    status: Literal["failed"] = "failed"

SafeGenerationResult = Union[CompletedResult, BlockedResult, FailedResult]


# --- Interfaces (Protocols) ---

class ContentFilter(Protocol):
    async def classify(self, text: str, signal: asyncio.Event) -> FilterDecision:
        ...

class Generator(Protocol):
    async def generate(self, input_text: str, signal: asyncio.Event) -> str:
        ...


# --- Fixed Implementation ---

async def generate_with_safety(
    input_text: str,
    content_filter: ContentFilter,
    generator: Generator,
    signal: asyncio.Event,
) -> SafeGenerationResult:
    max_input_length = 10_000
    max_metadata_length = 256

    def is_cancelled() -> bool:
        return signal.is_set()

    # 1. Validation & Pre-checks
    if is_cancelled():
        return FailedResult(code="cancelled")
    if not isinstance(input_text, str) or not input_text.strip():
        return FailedResult(code="invalid_input")

    text = input_text[:max_input_length]

    # 2. Filter Input
    if is_cancelled():
        return FailedResult(code="cancelled")

    try:
        input_decision = await content_filter.classify(text, signal)
    except asyncio.CancelledError:
        return FailedResult(code="cancelled")
    except Exception:
        return FailedResult(code="cancelled" if is_cancelled() else "filter_unavailable")

    if not input_decision.allowed:
        # Guarantee narrowing for BlockedDecision attributes
        if isinstance(input_decision, BlockedDecision):
            return BlockedResult(
                stage="input",
                category=input_decision.category[:max_metadata_length],
                reviewRef=input_decision.reviewRef[:max_metadata_length],
            )

    # 3. Generate Output
    if is_cancelled():
        return FailedResult(code="cancelled")

    try:
        output = await generator.generate(text, signal)
    except asyncio.CancelledError:
        return FailedResult(code="cancelled")
    except Exception:
        return FailedResult(code="cancelled" if is_cancelled() else "model_failed")

    # 4. Filter Output
    if is_cancelled():
        return FailedResult(code="cancelled")

    try:
        output_decision = await content_filter.classify(output, signal)
    except asyncio.CancelledError:
        return FailedResult(code="cancelled")
    except Exception:
        return FailedResult(code="cancelled" if is_cancelled() else "filter_unavailable")

    if not output_decision.allowed:
        if isinstance(output_decision, BlockedDecision):
            return BlockedResult(
                stage="output",
                category=output_decision.category[:max_metadata_length],
                reviewRef=output_decision.reviewRef[:max_metadata_length],
            )

    # 5. Return Completed Result with Output Policy Version
    return CompletedResult(
        output=output,
        policyVersion=output_decision.policyVersion,
    )