# Automated Phishing Triage

## 1. Interview Prompt

Design a system that receives suspected phishing emails and helps a security team triage them. It should gather evidence, classify risk, recommend or take bounded actions, and escalate cases that require a human decision.

## 2. Requirements

- Accept email reports and security events from more than one source.
- Preserve the original evidence and produce an explainable triage result.
- Enrich safely from approved internal and external services.
- Automatically perform only explicitly allowed low-risk actions; high-impact actions require approval.
- Handle duplicate reports, delayed dependencies, and uncertain classifications without losing work.

## 3. Initial System Context

An employee-report mailbox and a security event feed both produce incidents. Available integrations include a mail system, an identity system, URL/file analysis services, and a case-management system. Email content, attachments, and enrichment results are untrusted inputs.

## 4. Example Input / Output

**Input:** Two reports refer to the same email and contain a suspicious link; a URL-analysis service is temporarily unavailable.

**Outcome:** The system creates or updates one traceable case, retains evidence, records that enrichment is pending, and routes the case according to risk rather than silently marking it safe.

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Which actions are allowed without a human approval?

**Interviewer:** Creating a case and drafting a user warning are allowed. Disabling an account or deleting mail requires approval.

**Candidate:** What is more harmful here: a false positive or a missed malicious email?

**Interviewer:** Both matter, but the system should make uncertainty explicit and escalate when evidence is insufficient for a consequential action.

**Candidate:** Must enrichment complete before a case is visible?

**Interviewer:** No. A partially enriched case may be shown with its current state and next action.

## 6. What the Interviewer Is Evaluating

- Event intake, evidence handling, and asynchronous workflow design
- Safe use of models and external analysis tools
- Risk-based autonomy, human escalation, and auditability
- Idempotency and partial-failure reasoning

## 7. Likely Interviewer Follow-Ups

- How would you distinguish a redelivered event from a genuinely related new report?
- What prevents malicious email text from instructing the agent to invoke an administrative tool?
- How would you make triage useful during an outage of an enrichment provider?
- Which metrics distinguish a slow pipeline from poor triage quality?

## 8. Architecture Change Requests

1. Analysts want to batch-scan older mailboxes without delaying real-time reports.
2. The identity provider returns a timeout after it may already have completed an approved containment action.
3. A customer requires a reviewer to approve every externally visible user notification.

## 9. Concept Questions and Interview Answers

### Why is an LLM classification not sufficient authorization for a containment action?

**Interview answer:**

> Classification is evidence, not authority. The application should evaluate the caller, policy, risk, and required approval independently, then authorize a narrowly scoped action in code.

### How would you make duplicate event delivery safe?

**Interview answer:**

> I would use stable source identifiers where possible and persist an idempotency record for each logical operation. Related-but-not-identical reports still need a case-correlation decision, so deduplication should not erase evidence.

## 10. Production Discussion

Cover queue backpressure, raw-evidence retention, dependency timeouts and circuit breakers, replayable events, model/prompt versioning, and measures such as case latency, enrichment failure rate, escalation rate, analyst correction rate, and harmful-action prevention.

## 11. Security / Safety Angle

How would you isolate attachments and links, protect sensitive mail content in logs, restrict integration credentials, and audit the evidence and approval behind every containment action?

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Workflow and failure design | /5 |
| Security and safety boundaries | /5 |
| Evidence and observability | /5 |
| Tradeoff reasoning | /5 |
