# Signed Webhook Intake

## 1. Interview Prompt

An enterprise integration sends webhook events that may trigger agent workflows. Implement the intake boundary in a language of your choice that verifies the sender, rejects replays, validates the event, and suppresses duplicate delivery before handing it to a trusted enqueue function.

Keep the initial state in one process. Do not build the HTTP server, durable queue, or workflow itself.

## 2. Requirements

- Require `x-event-id`, `x-timestamp`, and `x-signature` headers.
- The signature is lowercase hexadecimal HMAC-SHA256 over the exact bytes `timestamp + "." + rawBody`, using a configured shared secret.
- Compare signatures without a timing-sensitive string comparison.
- Reject timestamps more than five minutes from the injected current time.
- Verify the signature before parsing or trusting JSON fields.
- Accept only JSON objects with `type`, `tenantExternalId`, and `payload`; reject unknown top-level fields.
- Accept only configured event types and cap the raw body at 256 KiB.
- A repeated valid event ID returns `duplicate` and must not enqueue again, including under concurrent calls in the process.
- Do not record invalid signatures as processed event IDs.
- Return typed outcomes safe for an HTTP layer to map to responses.

## 3. Example Input / Output

```text
valid signature + fresh timestamp + new event ID -> accepted; enqueue once
same valid event delivered concurrently          -> one accepted, one duplicate
validly signed event older than five minutes     -> rejected: stale
JSON body reserialized before verification       -> signature does not match the original bytes
```

## 4. What the Interviewer Is Evaluating

- Cryptographic boundary and raw-body reasoning
- Replay versus duplicate-delivery semantics
- Runtime validation and atomic in-process claiming
- Explicit failure contracts

## 5. Concept Questions and Interview Answers

### Why verify the exact raw body rather than parsed JSON?

**Interview answer:**

> Parsing and reserializing can change whitespace, field order, or number representation. The sender signed a byte sequence, so verification must use that same sequence before any semantic processing.

### How are replay protection and idempotency different?

**Interview answer:**

> The timestamp limits reuse of a valid signed request outside an allowed window. Idempotency handles legitimate redelivery of the same event inside or across that window so it does not trigger the workflow twice.
