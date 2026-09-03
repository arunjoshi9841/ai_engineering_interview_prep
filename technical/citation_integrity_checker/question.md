# Citation Integrity Checker

## 1. Interview Prompt

An enterprise assistant returns a structured draft whose factual claims cite retrieved evidence. Implement a checker in a language of your choice that rejects missing, fabricated, or structurally invalid citations before the draft can be rendered.

Do not decide semantic truth with another model. Focus on deterministic provenance and exact supporting-quote checks.

## 2. Requirements

- Every factual claim must cite at least one evidence ID.
- Every cited ID must exist in the authorized evidence supplied for this request.
- A claim supplies one supporting quote per cited evidence item; each quote must occur exactly in that evidence text.
- Quotes must contain 1 through 300 characters after trimming.
- Reject duplicate evidence IDs within one claim and claims with no non-whitespace text.
- Do not accept citations from model-provided titles or URLs as substitutes for evidence IDs.
- Return all bounded issue codes without echoing evidence text.
- An empty claim list is valid; evidence authorization is assumed to have happened before this checker.

## 3. Example Input / Output

```text
evidence e-7 text: "Expense reports are due within 30 days."
claim: "Reports are due within 30 days.", citation=(e-7, "due within 30 days")
-> no issues

claim cites e-99                         -> unknown_evidence
factual claim has no citations           -> missing_citation
quote does not occur in cited evidence   -> invalid_quote
```

## 4. What the Interviewer Is Evaluating

- Provenance and validation-boundary design
- Clear handling of fabricated and missing references
- Efficient lookup and complete issue reporting
- Understanding of deterministic checks versus semantic evaluation

## 5. Concept Questions and Interview Answers

### What does citation integrity guarantee here?

**Interview answer:**

> It guarantees that references point to evidence actually supplied to this request and that the quoted text exists there. It does not by itself prove that the evidence entails the model's wording.

### Why use stable evidence IDs?

**Interview answer:**

> Titles and URLs can change or collide. A stable, version-aware identifier makes provenance auditable and prevents the model from inventing a plausible-looking reference.
