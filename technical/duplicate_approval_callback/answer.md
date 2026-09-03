The main bugs in the original code are:

* It trusts callback fields too much.
* It lets later callbacks overwrite earlier decisions.
* It has no duplicate/concurrency protection.
* It executes immediately from the callback.
* It doesn’t check expiry or superseded state.

Here is how i would solve it

* Authenticate the callback first.
* Load the approval request from the DB.
* Only allow a decision if the request is still `pending`.
* If the same callback arrives twice, return success without doing anything again.
* If a different second decision arrives, return a conflict.
* Reject it if the request is expired or superseded.
* Save the decision and outbox event in the same transaction.
* Don’t execute the tool directly in the callback; enqueue it through an outbox/job.
* When the worker executes, recheck that the action is still authorized and still the same action that was approved.



The key sentence I’d use in the interview:

**“An approval should only transition a pending request once, and execution should happen separately after revalidating the approved action.”**


```ts
async function approvalCallback(rawBody: string, signature: string) {
  // 1. Authenticate the callback before trusting it
  if (!verifySignature(rawBody, signature)) {
    throw new Error("Invalid signature");
  }

  const body = JSON.parse(rawBody);

  // 2. Run the state change + outbox insert atomically
  return db.transaction(async (tx) => {
    // 3. Lock/load the request so concurrent callbacks cannot both win getForUpdate(...) is meant to represent a database read using a row-level lock.
    const request = await tx.approvals.getForUpdate(body.requestId);

    if (!request) throw new Error("Not found");

    const decision = body.approved ? "approved" : "rejected";

    // 4. Same decision again = duplicate/idempotent callback
    if (request.status === decision) {
      return { ok: true, duplicate: true };
    }

    // 5. Only pending requests can transition
    //    Prevents overwriting approved/rejected/cancelled/etc.
    if (request.status !== "pending") {
      return { ok: false, error: "decision_conflict" };
    }

    // 6. Reject stale approvals
    if (request.expiresAt < Date.now()) {
      return { ok: false, error: "expired" };
    }

    // 7. Make sure approval is still for the current action/version
    if (request.actionDigest !== request.currentActionDigest) {
      return { ok: false, error: "superseded" };
    }

    // 8. Persist the decision first
    await tx.approvals.update(request.id, {
      status: decision,
      reviewer: body.reviewer,
    });

    // 9. Do not execute directly.
    //    Add execution intent to the outbox in the same transaction.
    if (decision === "approved") {
      await tx.outbox.insert({
        type: "execute_approved_action",
        requestId: request.id,
      });
    }

    return { ok: true };
  });
}
```