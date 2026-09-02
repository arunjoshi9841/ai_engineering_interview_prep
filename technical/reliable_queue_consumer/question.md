# Reliable Queue Consumer

## 1. Interview Prompt

An agent workflow consumes requests from a queue and calls an external provisioning tool. A production incident shows that some requests disappear, while others create duplicate provisions and repeatedly consume worker capacity. Review the consumer below, identify the failure modes, and describe the smallest safe changes you would make first.

```ts
interface Message<T> {
  id: string;
  body: T;
}

async function consume(message: Message<{ userId: string }>) {
  try {
    await queue.ack(message.id);
    await provisioningTool.createUser(message.body.userId);
  } catch {
    await queue.publish("provisioning", message.body);
  }
}
```

## 2. Requirements

- A request must not be silently lost when the tool, worker, or queue operation fails.
- Delivery is at least once; duplicate messages and client retries are expected.
- Poison messages must not retry indefinitely or block healthy work.
- Transient failures should be retried with bounded delay.
- Operators must be able to identify a message's attempts, final disposition, and correlation with the external tool call.
- Keep the initial diagnosis bounded; do not redesign the whole messaging platform.

## 3. Example Input / Output

```text
Message m-12: { operationId: "op-9", userId: "u-4", attempt: 1 }
Tool timeout after the external system may have created the user

Expected initial disposition: retry only through the operation's idempotent path,
or mark the outcome for reconciliation; do not create an unbounded immediate loop.
```

## 4. What the Interviewer Is Evaluating

- Diagnosis of acknowledgement ordering and duplicate-side-effect risks
- Delivery-semantics, backoff, and poison-message reasoning
- Practical observability for asynchronous workflows
- Ability to make a bounded, safe first change

## 5. Concept Questions and Interview Answers

### Why is acknowledgement timing important?

**Interview answer:**

> Acknowledging means the queue can discard its delivery. I only acknowledge once the message has reached a durable terminal disposition; otherwise a crash can turn a transient failure into silent data loss.

### What distinguishes a poison message from a transient failure?

**Interview answer:**

> A poison message is unlikely to succeed without a change, such as invalid input or an incompatible schema. A transient failure is expected to recover, so it deserves bounded delayed retries rather than immediate dead-lettering.
