from dataclasses import dataclass
from typing import Dict, Literal, TypedDict, Union


class Evidence(TypedDict):
    id: str
    text: str


class Citation(TypedDict):
    evidence_id: str
    quote: str


class DraftClaim(TypedDict):
    text: str
    factual: bool
    citations: list[Citation]
    
@dataclass(frozen=True)
class ClaimIssue:
    claimIndex: int
    code: Literal["empty_claim", "missing_citation", "duplicate_citation"]


@dataclass(frozen=True)
class EvidenceIssue:
    claimIndex: int
    code: Literal["unknown_evidence", "invalid_quote"]
    evidenceId: str


CitationIssue = Union[ClaimIssue, EvidenceIssue]

def checkCitationIntegrity(claims: list[DraftClaim], evidence: list[Evidence]) -> list[CitationIssue]:
    
    # Every factual claim must cite at least one evidence ID.
    # Every cited ID must exist in the authorized evidence supplied for this request.
    # A claim supplies one supporting quote per cited evidence item; each quote must occur exactly in that evidence text.
    # Quotes must contain 1 through 300 characters after trimming.
    # Reject duplicate evidence IDs within one claim and claims with no non-whitespace text.
    # Do not accept citations from model-provided titles or URLs as substitutes for evidence IDs.
    # Return all bounded issue codes without echoing evidence text.
    # An empty claim list is valid; evidence authorization is assumed to have happened before this checker.
    
    evidence_set = Dict[str, Evidence]({e["id"]: e for e in evidence})
    issues: list[CitationIssue] = []
    for claim_index, claim in enumerate(claims):
        if len(claim["citations"]) == 0 and claim["factual"]:
            issues.append(ClaimIssue(claimIndex=claim_index, code="missing_citation"))
        if len(claim["text"].strip()) == 0:
            issues.append(ClaimIssue(claimIndex=claim_index, code="empty_claim"))
        seen_evidence_ids = set()
        for citation in claim["citations"]:
            if citation["evidence_id"] not in evidence_set:
                issues.append(EvidenceIssue(claimIndex=claim_index, code="unknown_evidence", evidenceId=citation["evidence_id"]))
            else:
                evidence_text = evidence_set[citation["evidence_id"]]["text"]
                quote = citation["quote"].strip()
                if len(quote) < 1 or len(quote) > 300:
                    issues.append(EvidenceIssue(claimIndex=claim_index, code="invalid_quote", evidenceId=citation["evidence_id"]))
                elif quote not in evidence_text:
                    issues.append(EvidenceIssue(claimIndex=claim_index, code="invalid_quote", evidenceId=citation["evidence_id"]))
            if citation["evidence_id"] in seen_evidence_ids:
                issues.append(ClaimIssue(claimIndex=claim_index, code="duplicate_citation"))
            else:
                seen_evidence_ids.add(citation["evidence_id"])
    return issues
            
        
    
    
    
