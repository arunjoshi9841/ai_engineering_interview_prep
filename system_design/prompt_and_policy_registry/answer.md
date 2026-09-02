# Prompt and Policy Registry

**Interviewer:** Design a registry for prompts and deterministic agent policies.

**Me:** I would make every prompt, schema, tool contract, and policy version immutable. Authors edit drafts, but activation always creates or references a reviewed release bundle. A bundle gives a workflow one reproducible configuration identity.

The lifecycle could be `draft`, `in_review`, `approved`, `active`, `retired`, and `revoked`. The registry validates templates, required variables, schemas, references, tool compatibility, and policy conflicts before promotion. High-risk workflows require separation of duties and two reviewers.

A release bundle might contain a prompt version, output schema, tool policy, and model policy. Workflows pin the bundle at start, so a new active version does not unexpectedly change a running workflow. An emergency revocation is the exception. It can stop or escalate workflows using a bundle that is unsafe.

I would store artifacts in immutable storage with transactional metadata and signed manifests. Distribution services publish snapshots to regions and offline clients. Clients can cache a snapshot for a bounded period, but the registry needs a revocation channel for urgent changes. Secrets never belong in prompts or previews. They are resolved from approved runtime references.

Rollout uses staged pointers by tenant, environment, or percentage. Promotion can require evaluation evidence, and every override is audited. Rollback changes the default for new work by moving the active pointer to a previous immutable bundle. It does not rewrite the bundle or silently change running executions.

**Interviewer:** What if a prompt references a field that the schema does not contain?

**Me:** Promotion fails compatibility validation before activation. I would also run contract tests with representative inputs and require the tool and policy references to resolve to approved versions.

**Interviewer:** How would you handle a vulnerable tool instruction?

**Me:** I would mark the affected version revoked, publish the revocation through the fastest available channel, block new runs, and decide whether active runs must stop based on risk. That is different from an ordinary rollback because the version is declared unsafe.
