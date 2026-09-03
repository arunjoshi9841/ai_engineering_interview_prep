# Secret Leakage Review

## 1. Interview Prompt

Review the agent endpoint below after a credential was found in traces. Identify every material leakage path, prioritize containment, and propose targeted code, configuration, and test changes.

Do not rewrite the application or give generic compliance advice.

## 2. Requirements

Your review should cover:

- Prompts, logs, traces, errors, tool arguments and outputs, and client responses.
- Broad environment export and credential lifetime.
- Redaction limitations and structured allowlisting.
- Immediate revocation and exposure investigation.
- Least-privilege secret retrieval and rotation.
- Safe debugging and observability without raw sensitive payloads.
- Tests and scanning that prevent regression.

## 3. Provided Code

```text
export async function run(req: Request) {
  const context = {
    user: req.user,
    headers: req.headers,
    environment: process.env,
  };

  logger.info("agent request", { body: req.body, context });
  const span = tracer.startSpan("agent", { attributes: { prompt: JSON.stringify(context) } });

  try {
    const toolResult = await callCustomerApi({
      apiKey: process.env.CUSTOMER_ADMIN_KEY,
      args: req.body.toolArgs,
    });
    logger.debug("tool result", toolResult);
    return { answer: await model.generate(`Context: ${JSON.stringify(context)}\nTool: ${JSON.stringify(toolResult)}`) };
  } catch (error) {
    span.recordException(error as Error);
    return { status: 500, error: String(error) };
  } finally {
    span.end();
  }
}
```

The tracing backend is accessible to a broad engineering group and retained for 90 days.

## 4. Example Review Outcome

A strong review should immediately revoke the exposed credential, restrict trace access, preserve evidence safely, and identify that secrets and PII reach prompt text, logs, span attributes, exceptions, tool structures, and client errors. It should prefer explicit safe fields over attempts to redact arbitrary objects after serialization.

## 5. What the Interviewer Is Evaluating

- Prioritized security review and incident containment
- Data-flow analysis across observability and model boundaries
- Least privilege, rotation, and safe logging design
- Concrete regression tests

## 6. Concept Questions and Interview Answers

### Why is redaction not the primary control?

**Interview answer:**

> Secrets have many formats and can be nested, transformed, or included in exception text. The safer default is never collecting arbitrary sensitive fields and allowlisting only required telemetry.

### Why rotate after removing the log statement?

**Interview answer:**

> Once a secret was exposed, its confidentiality cannot be restored by a code fix. Rotation invalidates the compromised value while access review determines impact.
