# Building a Security Investigation Assistant

A security investigation assistant helps analysts turn a noisy alert into an evidence-backed decision. It should not act like an all-knowing analyst, and it should never hide uncertainty behind fluent language. The reliable role for AI is to gather, organize, summarize, and recommend—while deterministic controls and humans decide high-impact containment.

## 1. Preserve the alert before interpreting it

Alerts may arrive from email reporting, endpoint detection, an identity provider, a SIEM, or a third-party feed. Authenticate the source, assign a stable event ID, store the original payload and attachments in protected evidence storage, and create a case record. The case record becomes the durable source of truth for status and ownership.

Next, normalize each source into a canonical form: tenant, source, event time, affected user or device, alert type, severity, raw-evidence reference, and extracted fields. Normalization lets an analyst compare a phishing email and an endpoint alert without every downstream component understanding each vendor’s terminology.

Duplicates are normal. A single email can be reported by twenty employees and a security product can retry an alert. Deduplicate by provider event ID and content identifiers, but retain every original report as evidence. Link related alerts into a case rather than collapsing facts into one untraceable summary.

## 2. Gather evidence in bounded steps

Extract **indicators of compromise (IOCs)** such as URLs, domains, IP addresses, file hashes, sender identities, and account IDs. Queue enrichment jobs for threat intelligence, domain age, endpoint activity, sign-in history, mail metadata, and related historical incidents. Each integration needs deadlines, retry policy, and a status such as `complete`, `unavailable`, or `indeterminate`; missing enrichment must not silently look like clean evidence.

Knowledge retrieval can add internal playbooks, prior incident patterns, and tenant-specific policy. It must be permission-aware and cite its sources. An email body, log message, or threat report is untrusted data, not an instruction to the assistant. Process suspicious files in an isolated environment and keep administrative tools outside the model’s direct control.

## 3. Use specialists only when they are genuinely independent

For a complex investigation, an identity specialist can inspect sign-in behavior while an endpoint specialist checks process activity and an email specialist checks message authentication. This is useful only if the specialists have different tools or evidence sources. Multiple agents repeating the same model’s guess do not create confidence.

Give each specialist a narrow capability set and a bounded budget for time, tool calls, and tokens. Instead of sharing one large mutable conversation, require them to write typed claims:

```text
claim: "URL is newly registered"
source: domain-intelligence result
observed_at: 2026-09-04T15:21Z
confidence: high
evidence_ref: protected://case/…/domain-report
```

An orchestrator aggregates those claims into an incident timeline. It should preserve conflicting claims, evidence age, and gaps. Two sources disagreeing is a reason to ask an analyst, not a reason to take a majority vote.

## 4. Recommend, abstain, and escalate

The system can combine deterministic signals and model-generated summaries into a recommendation: likely phishing, likely benign, needs more evidence, or urgent analyst review. Explain the evidence that supports the recommendation and the evidence that is still missing. A low-confidence or conflicting case should **abstain** from a verdict and escalate; that is safer than forcing every alert into “malicious” or “safe.”

The analyst experience should surface the original artifacts, extracted IOCs, enrichment freshness, claims, incident timeline, recommendation, and uncertainty. Analysts can correct the outcome, add evidence, and record why an alert was closed or escalated. Those corrections create carefully governed evaluation data.

Track false positives, false negatives, time to preliminary summary, time to resolution, evidence completeness, enrichment failures, analyst override rate, and escalation precision. These are more meaningful than asking whether the assistant wrote a persuasive summary.

## 5. Separate investigation from containment

Containment actions—isolating an endpoint, disabling a user, quarantining mail, or blocking a domain—can cause real harm if wrong. Treat them as a separate controlled workflow. The assistant may recommend an action, but an action gateway validates target, authorization, current policy, and risk level. High-impact actions require an approval bound to the exact target and arguments.

Execute with an idempotency key and record a provider operation ID. If an endpoint-isolation request times out, do not immediately send another one or declare failure. Reconcile the endpoint’s current state first. Record the recommendation, approval, execution outcome, and all supporting evidence in an audit trail that can survive an incident review.

This design keeps automation valuable without granting it undeserved authority: it shortens investigation, makes evidence easier to reason about, and reserves consequential security actions for controls that can be inspected and trusted.
