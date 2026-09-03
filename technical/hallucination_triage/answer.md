* Retrieval looks healthy:

  * Recall@5 stayed ~flat: `.84 → .85`
  * Relevant evidence in context stayed ~flat: `.82 → .83`
  * Citation validity also stayed stable

* Main regression is generation:

  * Claim support dropped `.91 → .72`
  * Unsupported exceptions jumped `4% → 23%`
  * New prompt explicitly tells the model to infer exceptions

* Likely cause:

  * Prompt/model behavior is the primary failure layer
  * Evaluator also reinforces it because it rewards helpfulness without scoring evidence support

* Confirm with a small A/B:

  * Same queries, same model, same retrieved context
  * Compare old prompt vs new prompt
  * Measure claim support and unsupported exception rate

* Still verify:

  * source version is current
  * authorized context was actually passed
  * citations map to the right chunks
  * post-processing did not alter claims

* Immediate mitigation:

  * Remove “infer reasonable exceptions”
  * Require policy exceptions to be explicitly supported by evidence
  * If evidence is missing or conflicting, abstain or escalate

* Long term:

  * Add claim-level evidence-support evaluation
  * Track unsupported claims separately from helpfulness

**Conclusion:** retrieval is probably not the problem. The rollout changed generation incentives, causing the model to invent plausible-sounding policy exceptions.
