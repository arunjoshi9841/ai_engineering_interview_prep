# Automated Phishing Triage

**Interviewer:** Design a system that receives suspected phishing emails and helps a security team triage them.

**Me:** I would design this as an asynchronous, evidence-first workflow. The system should never lose the original email, and it should make uncertainty visible instead of forcing every case into safe or malicious.

The input can come from an employee mailbox or a security event feed. An intake service would authenticate the source, assign a stable event ID, store the original message and attachments in protected storage, and create a case. If the same report is delivered again, the event ID and an idempotency record prevent duplicate processing. If two reports look related but are not identical, I would link them to the same case while preserving both pieces of evidence.

The case would move through states such as `received`, `enriching`, `ready_for_triage`, `awaiting_approval`, `resolved`, or `needs_review`. A queue would trigger enrichment jobs for URL analysis, file analysis, identity checks, and mail metadata. Each dependency would have a timeout, retry policy, and circuit breaker. If a service is unavailable, the case remains visible with enrichment marked as pending.

I would use deterministic checks for things like sender authentication, suspicious domains, known malicious hashes, and employee reporting patterns. An LLM could summarize evidence or help classify the case, but its output would be treated as one signal, not as authorization.

The result might say:

> High risk. The URL is newly registered, the sender failed authentication, and the attachment matches a known malicious hash. URL analysis is still pending. Recommend analyst review before containment.

Creating a case and drafting a warning are low-risk actions. Disabling an account, deleting mail, or blocking a sender are higher-impact actions. Those should be checked by a policy service and require approval when configured. The tool gateway would enforce the final authorization.

Because email content and attachments are untrusted, I would isolate them from administrative tools. The agent would receive typed evidence objects, not unrestricted instructions from the email. Tool permissions would come from the authenticated workflow and tenant policy, never from the message itself.

For older mailbox scans, I would use a separate batch queue with lower priority and a concurrency limit. Real-time reports would have their own queue and reserved capacity. That protects urgent cases during a large scan.

I would measure time to first case, time to final triage, enrichment failure rate, duplicate rate, escalation rate, analyst correction rate, false positives, false negatives, and prevented harmful actions. I would also log which evidence and policy version supported every decision, while redacting sensitive message content from normal logs.

**Interviewer:** What happens if containment times out after the identity provider may have completed it?

**Me:** I would mark the action as indeterminate, not failed. We would use a request ID to query the provider’s status or reconcile against the current account state. Only after that check would we decide whether a retry or manual action is safe.
