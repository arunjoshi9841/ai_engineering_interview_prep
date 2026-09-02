interface Evidence {
  id: string;
  text: string;
}

interface DraftClaim {
  text: string;
  factual: boolean;
  citations: readonly { evidenceId: string; quote: string }[];
}

type CitationIssue =
  | {
      claimIndex: number;
      code: "empty_claim" | "missing_citation" | "duplicate_citation";
    }
  | {
      claimIndex: number;
      code: "unknown_evidence" | "invalid_quote";
      evidenceId: string;
    };

export function checkCitationIntegrity(
  claims: readonly DraftClaim[],
  evidence: readonly Evidence[],
): readonly CitationIssue[] {
  const evidence_map = new Map(evidence.map((e) => [e.id, e]));
  const issues: CitationIssue[] = [];

  claims.forEach((claim, claimIndex) => {
    if (claim.text.trim().length === 0) {
      issues.push({ claimIndex, code: "empty_claim" });
    }
    if (claim.factual && claim.citations.length === 0) {
      issues.push({ claimIndex, code: "missing_citation" });
    }

    const seenEvidenceIds = new Set<string>();
    claim.citations.forEach((citation) => {
      const quote = citation.quote.trim();
      if (!evidence_map.has(citation.evidenceId)) {
        issues.push({
          claimIndex,
          code: "unknown_evidence",
          evidenceId: citation.evidenceId,
        });
      } else {
        const evidenceText = evidence_map.get(citation.evidenceId)!.text;
        if (quote.length < 1 || quote.length > 300) {
          issues.push({
            claimIndex,
            code: "invalid_quote",
            evidenceId: citation.evidenceId,
          });
        }
        if (!evidenceText.includes(quote)) {
          issues.push({
            claimIndex,
            code: "invalid_quote",
            evidenceId: citation.evidenceId,
          });
        }
      }
      if (seenEvidenceIds.has(citation.evidenceId)) {
        issues.push({
          claimIndex,
          code: "duplicate_citation"
        });
      } else {
        seenEvidenceIds.add(citation.evidenceId);
      }
    });
  });

  return issues;
}
