"""Python solution entry point for this interview exercise."""

from typing import TypedDict

class Subject(TypedDict):
    tenant_id: str
    user_id: str
    roles: list[str]

class RetrievalFilter(TypedDict):
    tenant_id: str
    allowed_roles_any_of: list[str]
    include_tenant_visible: bool

class RetrievedChunk(TypedDict):
    id: str
    document_title: str
    text: str

class ContextItem(TypedDict):
    source_id: str
    title: str
    text: str


def solve(*args: object, **kwargs: object) -> object:
    raise NotImplementedError("Implement the contract documented in question.md")
