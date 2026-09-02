# Prompt and Policy Registry

## 1. Interview Prompt

Design a registry for prompts and deterministic agent policies used across tenants and environments. It must support controlled authoring, review, versioning, compatibility checks, rollout, rollback, and reproducible workflow execution.

Focus on artifact lifecycle and distribution. Prompt rendering and policy evaluation engines are consumers of this registry.

## 2. Requirements

- Store immutable prompt, schema, tool-contract, and policy versions with provenance.
- Package compatible versions into a release bundle referenced by workflows.
- Support draft, review, approved, active, retired, and revoked lifecycle states.
- Enforce role separation and tenant/environment scope for publication.
- Validate references, templates, required variables, schemas, and incompatible tool changes before activation.
- Support deterministic staged rollout, emergency rollback, and revocation.
- Preserve historical content required to reconstruct past decisions.
- Distribute signed or integrity-checked snapshots with bounded cache staleness.
- Keep secrets out of artifacts and rendered previews.
- Gate promotion using evaluation results and record overrides.

## 3. Initial System Context

Hundreds of workflows across tenants use shared base prompts plus tenant policies. Deployments span regions and occasionally run offline from cached configuration. A prompt change may require a new structured-output schema or tool policy. High-risk workflows require two reviewers.

## 4. Example Input / Output

```text
bundle b-42:
  prompt support_triage@7
  output_schema@3
  tool_policy@12
  model_policy@5

promotion blocked: prompt@7 references field absent from schema@3
rollback: active pointer returns to immutable b-41; running workflows retain pinned b-42
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Can active artifacts be edited?

**Interviewer:** No. Create a new version.

**Candidate:** Should running workflows switch when the active bundle changes?

**Interviewer:** No. They retain the bundle pinned at start unless an explicit safety revocation requires stopping.

**Candidate:** Are prompts allowed to contain credentials?

**Interviewer:** No. References to approved runtime variables are allowed; secrets remain in secret management.

## 6. What the Interviewer Is Evaluating

- Artifact and bundle versioning
- Approval, compatibility, and rollout design
- Reproducibility versus emergency revocation
- Distribution, tenancy, and operational governance

## 7. Likely Interviewer Follow-Ups

- How would you detect semantic policy conflicts?
- What happens when clients cannot refresh configuration?
- How do shared and tenant-specific overrides compose?
- Which evaluation evidence is required for promotion?

## 8. Architecture Change Requests

1. A vulnerable tool instruction requires immediate global revocation.
2. Customers require their own approval workflow for tenant overrides.
3. Registry traffic grows 20x across partially disconnected deployments.

## 9. Concept Questions and Interview Answers

### Why release prompts and policies as a bundle?

**Interview answer:**

> Prompt text, schemas, tools, and deterministic rules evolve together. A bundle makes compatibility explicit and gives each workflow one reproducible configuration identity.

### How is rollback different from revocation?

**Interview answer:**

> Rollback changes the default for new work. Revocation declares a version unsafe and may require stopping or escalating workflows already pinned to it.

## 10. Production Discussion

Discuss immutable artifact storage, transactional metadata, approval workflows, compatibility validation, evaluation links, signed manifests, staged pointers, cache distribution, revocation channels, and audit events. Monitor activation failures, stale clients, rollback, override use, and unpinned execution.

## 11. Security / Safety Angle

Use least-privilege publishing roles, separation of duties, integrity signatures, tenant isolation, protected branches or approvals, secret scanning, and audited emergency actions. Untrusted retrieved content must never write registry artifacts.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Version and bundle design | /5 |
| Approval and rollout | /5 |
| Distribution and operations | /5 |
| Security and governance | /5 |
