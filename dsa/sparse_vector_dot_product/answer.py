"""Python interface matching the TypeScript contract in question.md."""

from typing import TypedDict


class SparseEntry(TypedDict):
    index: int
    value: int

def sparseDotProduct(left: list[SparseEntry], right: list[SparseEntry]) -> int:
    raise NotImplementedError("Implement the contract documented in question.md")
