# Tenant Filter Regression

## 1. Interview Prompt

After a retrieval refactor, one tenant occasionally receives titles from another tenant's documents. Review the provided code and traces, identify the authorization regression, and propose a fail-closed correction and regression tests.

Do not redesign the search engine. Focus on how trusted scope reaches retrieval and fallback paths.

## 2. Requirements

Your diagnosis should:

- Trace tenant and permission scope from authenticated context to every backend query.
- Identify untrusted fields that can override trusted filters.
- Explain why broad fallback search is unsafe.
- Ensure empty or invalid authorization scope returns no results.
- Define tests for cross-tenant, role, fallback, cache, and logging behavior.
- Recommend bounded telemetry that proves filters were applied without exposing document data.

## 3. Provided Code

```text
interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>; // model-proposed refinements
}

async function retrieve(ctx: AuthContext, request: SearchRequest) {
  const filter = {
    tenantId: ctx.tenantId,
    allowedRoles: ctx.roles,
    ...request.filters,
  };

  let results = await index.search(request.query, filter, 8);

  if (results.length === 0) {
    results = await index.search(request.query, {}, 8);
  }

  return resultCache.get(request.query) ?? results;
}
```

One trace contains `request.filters.tenantId="other"`. Another returns a cached result created for the same query text by a different tenant.

## 4. Example Input / Output

```text
authenticated tenant=acme, model filter tenantId=other
current behavior -> searches tenant=other
required behavior -> model cannot set tenant scope

authorized search returns zero results
current behavior -> unscoped fallback
required behavior -> empty result
```

## 5. What the Interviewer Is Evaluating

- Root-cause analysis across query, fallback, and cache paths
- Trusted-versus-untrusted input separation
- Fail-closed authorization behavior
- Security regression testing and observability

## 6. Concept Questions and Interview Answers

### Why is post-retrieval filtering insufficient?

**Interview answer:**

> Unauthorized text has already crossed the retrieval boundary and may be logged, cached, or sent to the model. Authorization must constrain candidate retrieval itself.

### Why should zero authorized results fail closed?

**Interview answer:**

> Lack of results does not grant permission to broaden scope. The correct outcome is empty context or an explicit access-safe response.
