# Agent Cost Control Plane

**Interviewer:** Design a cost-control plane for a multi-tenant agent platform.

**Me:** I would separate cost estimation, reservation, settlement, and reporting. They serve different purposes. Estimation protects the request path, reservation prevents concurrent overspending, settlement records provider truth, and reporting gives finance an auditable view.

Before an expensive model or tool call, the caller sends the tenant, workspace, workflow, user, operation ID, estimated tokens or cost, and requested capability. The cost service checks the relevant hierarchical budgets and makes a reservation. The reservation must update tenant and workflow limits consistently, so parallel workers cannot each believe the same remaining budget is available.

The request path needs a decision within about 20 milliseconds. I would keep current budget counters and policy data in a strongly consistent store or partitioned reservation service. Policy and price metadata can be cached with versions. A reservation has an expiry so a crashed worker does not hold budget forever.

After the provider responds, a settlement event records actual usage. Provider request IDs and operation IDs make settlement idempotent. If the final usage arrives later or is corrected, we append an adjustment rather than rewriting history. Each ledger entry references the price and accounting version used for that calculation.

The system should expose soft warnings before hard limits. When a reservation is rejected, policy-approved degradation can include a smaller context, cached work, a lower-cost eligible model, partial completion, or human confirmation. Cost must never cause us to select a model that violates residency, safety, capability, or tenant policy.

Cache hits and shared work need an explicit attribution policy. The system should not claim that cached work was free if the customer policy says to attribute the original or shared cost. The same policy should be used consistently in reporting.

If the cost service is unavailable, the behavior depends on the budget type and risk. A hard prepaid budget should fail closed or use a very small emergency allowance. An alert-only internal budget may continue with local limits and reconcile later. That choice must be explicit and observable.

For a tenant running a large batch job, I would use separate capacity pools or reservations for interactive and batch traffic. Per-tenant fairness and backpressure prevent a noisy neighbor from consuming all capacity.

**Interviewer:** What if actual usage exceeds the reservation?

**Me:** I would record the actual overage honestly, expose the estimation error, and reduce or block later work according to policy. The reservation is a control mechanism, not permission to hide the final cost.

**Interviewer:** How would you handle a retroactive pricing change?

**Me:** I would preserve the original provider usage and price version in the ledger, then add a clearly labeled adjustment for the current invoice period. Historical reports remain reproducible, while current financial views can include the correction.
