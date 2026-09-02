# Prompt Version Resolver

## 1. Interview Prompt

A platform stores prompt versions outside application code and rolls them out gradually. Implement a deterministic TypeScript resolver that chooses the prompt version for a workflow request and returns the metadata needed to reproduce that choice later.

Do not build prompt storage or deployment APIs. Focus on selection from trusted configuration already loaded into memory.

## 2. Requirements

- Resolve within one tenant and prompt name.
- A request may pin an exact active version; otherwise use rollout rules.
- A rollout contains a stable version, an optional candidate version, and a candidate percentage from 0 through 100.
- Assignment must be deterministic for the same tenant, prompt, actor key, and rollout ID.
- Different application instances given the same inputs must choose the same version.
- Never return inactive, missing, or mismatched prompt versions.
- Fail closed with a typed error when configuration is invalid; do not silently choose a different prompt.
- Return the chosen version, rollout ID, and selection reason. Do not return or log prompt content.

## 3. Example Input / Output

```text
rollout r-12: stable=v4, candidate=v5, candidatePercent=10

same tenant + prompt + actor + r-12 -> always v4 or always v5
pinnedVersion=v4                 -> v4, reason=pinned
pinnedVersion=v3 (inactive)       -> version_unavailable
candidate=v5 missing              -> invalid_config
```

## 4. What the Interviewer Is Evaluating

- Deterministic rollout and validation logic
- Tenant and prompt scoping
- Reproducibility metadata and explicit failure behavior
- Awareness of configuration and audit boundaries

## 5. Concept Questions and Interview Answers

### Why is deterministic assignment useful for prompt rollouts?

**Interview answer:**

> It keeps a caller on a consistent experience without storing every assignment and makes debugging easier because the same inputs reproduce the decision.

### Why record the selected version rather than resolving it again later?

**Interview answer:**

> Rollout configuration can change. Persisting the actual version and decision metadata lets me reconstruct what the workflow used instead of inferring it from today's rules.
