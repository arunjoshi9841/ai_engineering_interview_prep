# Multi-Agent Deadlock

## 1. Interview Prompt

A supervisor runs two specialist agents concurrently. Some workflows never finish even though both specialists are healthy and their tool calls have completed. Diagnose the trace and coordinator code, explain the liveness failure, and outline the smallest safe correction.

Focus on ownership, waiting, and recovery. Do not redesign the whole agent platform.

## 2. Requirements

- Identify every wait dependency in the supplied trace.
- Distinguish a true wait cycle from a slow or failed dependency.
- Preserve the rule that only the current task owner may publish its terminal result.
- Ensure every wait has a deadline, cancellation path, and observable reason.
- Avoid resolving the incident by allowing agents to overwrite each other's state.
- Define what the supervisor should do with already completed tool effects.
- Prevent an automatic retry from creating two owners for one logical task.
- Propose a bounded recovery that can be applied to already-stuck workflows.

## 3. Example Input / Output

```text
wait graph: agent-a -> agent-b -> agent-a
classification: deadlock, not merely slow execution
unsafe recovery: let either agent write the other's terminal task state
required outcome: bounded cancellation or deterministic victim selection,
                  then lease-safe resumption using persisted tool results
```

## 4. What the Interviewer Is Evaluating

- Wait-for graph and liveness reasoning
- Ownership, leases, and conditional-update discipline
- Timeout, cancellation, and recovery design
- Reuse of durable results without duplicating side effects

## 5. Concept Questions and Interview Answers

### Why is a timeout not, by itself, a deadlock fix?

**Interview answer:**

> A timeout restores bounded waiting, but if every retry recreates the same dependency cycle, the workflow still makes no progress. I would remove or reject the cycle and make recovery ownership explicit.

### Why retain completed tool results during recovery?

**Interview answer:**

> The tool may have produced a costly or irreversible effect before coordination stalled. A stable operation record lets the resumed workflow reuse or reconcile that outcome instead of blindly executing it again.
