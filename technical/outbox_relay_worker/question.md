# Outbox Relay Worker

## 1. Interview Prompt

A service writes business data and an outbox row in one database transaction. Implement the TypeScript relay worker that claims unpublished rows, publishes them to a broker, and records progress without pretending delivery is exactly once.

Do not implement the database transaction that creates rows or the broker.

## 2. Requirements

- Claim at most a configured batch size using the injected store.
- Publish each record with its stable outbox ID as event ID.
- Mark a record published only after broker acknowledgement.
- On failure, release it with a safe error code and incremented attempt count.
- If broker acknowledgement succeeds but `markPublished` fails, count the row as uncertain and leave its lease to expire; do not classify it as a confirmed publish failure.
- Continue processing other claimed records after one failure.
- Pass an abort signal and stop starting new publishes after cancellation.
- A crash after publish but before marking may cause republish; consumers must deduplicate.
- Return batch counts for published, failed, uncertain, and skipped-on-cancel.
- Do not log event payloads.

## 3. Example Input / Output

```text
claim [e1,e2,e3]
e1 publish + mark succeed
e2 publish fails -> releaseFailed
abort before e3 starts -> cancelled
summary={published:1, failed:1, uncertain:0, cancelled:1}
```

## 4. What the Interviewer Is Evaluating

- Outbox delivery semantics
- Correct acknowledgement ordering
- Partial failure and cancellation handling
- Honest reasoning about duplicate publication

## 5. Concept Questions and Interview Answers

### What consistency problem does an outbox solve?

**Interview answer:**

> It lets the business update and intent to publish commit in one local database transaction, avoiding the gap where one succeeds and the other is lost.

### Why can the relay still publish duplicates?

**Interview answer:**

> Broker acknowledgement and marking the row are separate commits. A crash between them leaves an unpublished row even though the event was delivered.
