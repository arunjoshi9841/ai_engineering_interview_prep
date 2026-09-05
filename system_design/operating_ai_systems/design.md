# Operating AI Systems in Production

Putting an AI feature in production is not the end of the build. Models change, prompts regress, documents become stale, providers slow down, costs vary, and a technically successful request can still give a harmful or useless answer. Operating the system means continually answering four questions: is it available, is it working well, is it safe, and is it affordable?

## 1. Create a record of what happened

Use three complementary forms of telemetry.

- **Structured logs** record discrete events with named fields: `workflow_id`, `attempt`, `provider`, `error_class`, and `duration_ms`. They are for inspecting a specific event.
- **Metrics** are numeric aggregates over time: request count, latency, queue age, and error rate. They are for detecting trends and alerting.
- **Distributed traces** connect one request across services. A trace is made of **spans**, timed records for operations such as “validate request,” “wait in queue,” “retrieve documents,” “call model,” and “call tool.”

Give a request a correlation ID, then propagate its **W3C trace context** through HTTP headers and queue messages. When a background worker continues a job, it should create a child span of the original request, not start an unrelated trace. Otherwise an engineer cannot explain why an end-user request took three minutes.

Capture versions—prompt, model, retrieval index, workflow, tool, and policy—as trace attributes. Store raw prompts and outputs only under governed retention rules; broad operational telemetry generally needs IDs, hashes, redacted references, and timing rather than customer content.

## 2. Define what “healthy” means

An **SLI** (service-level indicator) is a measurement that describes user experience. Examples include API availability, workflow-completion rate, p50/p95/p99 latency, queue age, time to first token, model success rate, tool success rate, and authorization rejection rate. Percentiles matter because an average can hide a painful tail: p99 tells you how the slowest one percent of requests behave.

An **SLO** is the target for an SLI, such as “99.5% of interactive requests complete within ten seconds.” It creates an error budget: the amount of failure the service can afford before reliability work takes priority over new features. Alert on sustained user impact or rapid error-budget burn, not every individual bad model response.

Break metrics down by meaningful, bounded dimensions: provider, model family, workflow, region, tenant tier, and error class. Do not put an unbounded user or request ID into a metric label; those belong in traces or logs.

## 3. Measure quality before a user reports a problem

Build a versioned **golden dataset** of representative inputs, expected evidence, safety cases, and difficult edge cases. A regression suite runs it whenever a prompt, model, retrieval pipeline, tool contract, or policy changes. Compare candidates with a pinned baseline by cohort. Overall improvement must not hide a serious regression for finance, security, a language, or a tenant class.

Evaluate the components separately. For retrieval, ask whether the right evidence was found and ranked. For generation, measure correctness, groundedness (whether claims are supported by evidence), citation correctness, completeness, and abstention when evidence is insufficient. For tools, measure selection, argument validity, and policy compliance. End-to-end completion alone is too blunt.

**LLM-as-judge** can score many examples, but it is another model with bias and variance. Calibrate it against human-rated examples, version the judge, track disagreement, and use human evaluation for high-risk or ambiguous cases. Production sampling and user corrections catch gaps that offline datasets miss. Watch for **drift**: the distribution of users, documents, traffic, or provider behavior may change even though your code has not.

## 4. Release changes progressively

Never treat a prompt or model change as a harmless text edit. Put changes behind **feature flags** so they can be enabled for selected tenants or traffic percentages. A **canary** exposes a small live audience to a candidate. **Shadow traffic** sends a copy of production requests to a candidate without using its result, allowing comparison with no user impact. An A/B test routes comparable groups to alternatives when the product needs a measured outcome comparison.

Record exactly which configuration served each request. If a change harms latency, cost, citation quality, or safety, turn the flag off or roll back to a known-good immutable version. Do not rewrite historical results to make a dashboard look cleaner.

## 5. Respond to incidents and control cost

An incident workflow should let an operator move from an alert to the relevant trace, inspect the durable job checkpoint and external operation IDs, classify the failure, and replay only a safe incomplete step. A timeout after a side effect is indeterminate until reconciled. Keep diagnostic observability, which may be sampled and short-lived, separate from audit evidence, which has stronger integrity and retention requirements.

Cost has to be measured at request, workflow, tenant, feature, and provider levels. Before a costly model or tool call, estimate and reserve budget. After it completes, settle the actual usage and record any variance. Budgets, quotas, queue priority, model choice rules, and graceful degradation protect both a customer’s limit and platform capacity.

Capacity planning combines expected traffic, peak concurrency, queue age targets, provider quotas, model latency, worker resources, and failure headroom. The system should still meet its essential SLOs when a provider slows down or a region fails. Reliable AI operation is a feedback loop: observe real behavior, evaluate quality, release carefully, learn from incidents, and adjust the system before its users pay the price.
