# Safe Async API Fetch

## 1. Interview Question

Write a small async function that fetches JSON from an external document-classification API and returns the classification. It should distinguish transport failures from HTTP error responses, validate the response status, handle invalid JSON, and propagate an error that is useful to the caller without leaking a large or sensitive response body.

Explain the same approach for TypeScript `fetch` and a Python async HTTP client. If this code is called by a FastAPI endpoint, explain where the error should be translated into an HTTP response.

## 2. What the Interviewer Is Testing

- The language-agnostic request lifecycle: send, validate status, parse, validate data, return
- The difference between network/transport errors and HTTP error status codes
- Correct modern Node.js `fetch` usage and conceptual `httpx.AsyncClient` usage
- Meaningful error propagation across an API boundary
- Awareness of malformed or unexpected external data

## 3. Strong Candidate Answer

An HTTP call has multiple failure layers. A DNS error, refused connection, or some abort conditions reject/raise at the transport layer. A completed HTTP exchange with a `404` or `500` is still a response. In particular, `fetch` normally resolves for HTTP errors, so I must check `response.ok` or `response.status` before treating the request as successful. With `httpx`, I can check the status or use `raise_for_status()`.

After a successful status, JSON parsing can still fail and the decoded value can have the wrong shape, so parsing and basic validation are separate steps. I would attach safe context such as the dependency name, status, and operation—not tokens, full documents, or an unbounded response body. A reusable client is preferable in production for connection pooling. In FastAPI, the service function should raise a domain/dependency error and the endpoint or an exception handler should translate it to an appropriate, stable HTTP response.

## 4. TypeScript Example

```ts
type Classification = { label: string; confidence: number };

async function classifyDocument(text: string): Promise<Classification> {
  let response: Response;
  try {
    response = await fetch("https://classifier.example/v1/classify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    throw new Error("Classifier request could not reach the service", {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(`Classifier returned HTTP ${response.status}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Classifier returned invalid JSON", { cause: error });
  }

  if (!isClassification(data)) {
    throw new Error("Classifier returned an unexpected response shape");
  }
  return data;
}
```

Assume `isClassification` is a small runtime type guard supplied by the interviewer.

## 5. Python Example

```py
import httpx

class ClassifierError(Exception):
    pass


async def classify_document(
    text: str,
    client: httpx.AsyncClient,
) -> dict[str, object]:
    try:
        response = await client.post("/v1/classify", json={"text": text})
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ClassifierError(
            f"classifier returned HTTP {exc.response.status_code}"
        ) from exc
    except httpx.RequestError as exc:
        raise ClassifierError("classifier transport failure") from exc

    try:
        data = response.json()
    except ValueError as exc:
        raise ClassifierError("classifier returned invalid JSON") from exc

    confidence = data.get("confidence") if isinstance(data, dict) else None
    if (
        not isinstance(data, dict)
        or not isinstance(data.get("label"), str)
        or isinstance(confidence, bool)
        or not isinstance(confidence, (int, float))
    ):
        raise ClassifierError("classifier returned an unexpected response shape")
    return data
```

A FastAPI route can catch `ClassifierError` (or use an exception handler), log the internal cause safely, and return a stable `502 Bad Gateway` response. The HTTP client should usually be created during application startup and reused rather than constructed for every request.

## 6. Likely Follow-Up Questions

1. Does `fetch` throw when the server returns HTTP 500?
2. Which status codes would you expose to a caller, and which would you translate?
3. Why validate decoded JSON if TypeScript already has a return type annotation?
4. Where would authentication, timeout configuration, and correlation IDs go?
5. How would you test a transport failure, an HTTP failure, and malformed JSON?

## 7. Common Mistakes / Red Flags

- Assuming `fetch` rejects for `4xx` or `5xx` responses
- Calling `.json()` without first deciding how to handle a non-success status
- Treating every exception as retryable or returning every failure as HTTP 500
- Trusting a TypeScript cast or decoded Python dictionary as runtime validation
- Logging access tokens, full documents, or arbitrary upstream response bodies
