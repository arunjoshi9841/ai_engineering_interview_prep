from typing import TypedDict

class EvalCase(TypedDict):
    id: str
    query: str
    relevant_document_ids: set[str]

class EvalReport(TypedDict):
    cases: list[object]
    mean_recall_at_k: float | None
    mean_reciprocal_rank: float | None
    failure_count: int

def evaluateRetrieval(cases: list[EvalCase], retriever: object, k: int) -> EvalReport:
    raise NotImplementedError("Implement the contract documented in question.md")
