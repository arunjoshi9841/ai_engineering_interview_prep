# AI Engineer Interview Fundamentals Cheat Sheet
## 30–90 Second Interview Answers

> Fast-review document for AI Engineer / Applied AI interviews.
>
> Use each answer as a spoken template: **definition → when it matters → tradeoff → example**.
> The goal is fluency, not memorizing textbook wording.

---

# Distributed Systems & Backend Fundamentals

## CAP Theorem

**Interview answer:**  
> CAP says that during a network partition, a distributed system cannot guarantee both perfect consistency and full availability for the same operation. Since partitions are unavoidable, the real question is which behavior the business can tolerate. Authorization or financial state may favor consistency, while analytics or a search index can often tolerate eventual consistency.

## Strong vs Eventual Consistency

**Interview answer:**  
> Strong consistency means a successful read reflects the latest committed write. Eventual consistency allows replicas or derived systems to lag temporarily. I choose based on the invariant: permissions or workflow ownership may need stronger consistency, while a vector index can often be eventually consistent if freshness is monitored.

## Read-Your-Writes Consistency

**Interview answer:**  
> Read-your-writes guarantees that after I update something, my subsequent reads see that update even if other replicas are still catching up. You can implement it by reading from the primary after a write, sticky routing, or tracking a minimum version.

## Idempotency

**Interview answer:**  
> Idempotency matters whenever retries are possible. If a call times out, I may not know whether the downstream side effect completed. I use a stable idempotency key for the logical operation and persist its execution state so retries return the existing result instead of executing the side effect again.

## At-Most-Once vs At-Least-Once

**Interview answer:**  
> At-most-once avoids duplicate delivery but may lose work. At-least-once retries until acknowledged but may deliver duplicates. Most production job systems are easier to reason about as at-least-once, so consumers should be idempotent.

## Exactly-Once Semantics

**Interview answer:**  
> True exactly-once behavior is difficult once a workflow crosses databases, queues, and external APIs. A broker may offer exactly-once guarantees inside its own boundaries, but external side effects break that. In practice I aim for effectively-once behavior using idempotency, transactions, deduplication, and reconciliation.

## Optimistic Locking

**Interview answer:**  
> Optimistic locking uses a version or timestamp. I update the row only if the version I read is still current. If another worker changed it first, my write fails and I retry or resolve the conflict. It works well when contention is moderate and avoids holding long locks.

## Pessimistic Locking

**Interview answer:**  
> Pessimistic locking takes a lock before modifying a resource, preventing concurrent writers. It provides stronger coordination but reduces concurrency and can introduce lock contention or deadlocks. For long-running agent workflows I generally prefer optimistic concurrency or leases.

## SQL vs NoSQL

**Interview answer:**  
> I choose based on access patterns and invariants. SQL is my default for transactions, relationships, constraints, and flexible querying. NoSQL is useful when document flexibility or horizontal key-based access dominates. An AI system may legitimately use PostgreSQL for workflow state, object storage for files, Redis for ephemeral state, and a vector store for retrieval.

## Sharding vs Partitioning

**Interview answer:**  
> Partitioning divides data into subsets, for example by tenant or date. Sharding usually means distributing those partitions across separate database nodes. It improves scale but makes rebalancing, cross-shard queries, and transactions harder, so I avoid it until a single datastore is actually the bottleneck.

## Replication

**Interview answer:**  
> Replication keeps multiple copies of data for availability and read scale. The tradeoff is replication lag and coordination. If a read requires the newest state, I may need the primary or a consistency guarantee rather than assuming a replica is current.

## Consistent Hashing

**Interview answer:**  
> Consistent hashing distributes keys across nodes so adding or removing a node remaps only a small portion of keys. It's useful for distributed caches or partitioned services where normal modulo hashing would cause a large reshuffle.

## Leader Election & Consensus

**Interview answer:**  
> Leader election chooses one node to coordinate work such as scheduling or partition ownership. Consensus algorithms like Raft let distributed nodes agree on state and leadership despite failures. I normally rely on infrastructure that implements this rather than writing the protocol myself, but I understand the quorum and availability tradeoffs.

## Distributed Transactions & Saga

**Interview answer:**  
> A normal database transaction does not span independent services well. I often use a saga: each service performs a local transaction, and failures trigger compensating actions. This gives eventual consistency while keeping the workflow explicit and recoverable.

## Transactional Outbox

**Interview answer:**  
> The outbox pattern solves the database-plus-message dual-write problem. I commit the business change and an outbox record in the same database transaction. A worker later publishes the event. That prevents losing the event if the process crashes after the database commit.

## Queue vs Pub/Sub

**Interview answer:**  
> A queue distributes work so one logical consumer handles a job. Pub/sub broadcasts an event to multiple independent subscribers. I might queue document indexing work, while publishing a document-changed event to indexing, analytics, and notifications.

## Message Queue vs Event Stream

**Interview answer:**  
> Queues are optimized for task delivery and acknowledgements. Event streams such as Kafka retain an ordered replayable log that multiple consumers can process independently. I use queues for jobs and streams when replay, ordered history, and multiple independent consumers matter.

## Kafka vs RabbitMQ

**Interview answer:**  
> Kafka is a durable partitioned event log optimized for throughput, replay, and consumer groups. RabbitMQ is a message broker with flexible routing and classic work-queue semantics. I choose based on workload rather than treating one as universally better.

## Retry / Backoff / Jitter

**Interview answer:**  
> I retry only transient failures. Exponential backoff increases delay across attempts, and jitter prevents many workers from retrying at the same instant. I also cap attempts, enforce timeouts, and require idempotency for side effects so retries do not amplify an outage.

## Circuit Breaker

**Interview answer:**  
> A circuit breaker stops repeatedly calling an unhealthy dependency. After enough failures it opens and fails fast or uses a fallback, then periodically probes for recovery. It prevents cascading failures and gives the dependency time to recover.

## Graceful Degradation

**Interview answer:**  
> Graceful degradation means preserving the safest useful behavior when a dependency fails. If a reranker is unavailable I may fall back to first-stage retrieval; if a high-risk tool is unavailable I may escalate to a human instead of letting the workflow behave unpredictably.

## SLI / SLO / SLA

**Interview answer:**  
> An SLI is what I measure, such as request success rate. An SLO is the reliability target, such as 99.9%. An SLA is the contractual customer commitment. For AI systems I often combine infrastructure SLIs with quality measures such as task success or groundedness.

## REST vs gRPC

**Interview answer:**  
> REST is widely interoperable and convenient for public APIs. gRPC uses strongly typed protobuf contracts and efficient binary transport, which is attractive for internal service-to-service calls and streaming. I choose based on client ecosystem, latency, typing, and operational requirements.

## REST vs GraphQL

**Interview answer:**  
> REST gives server-defined resource endpoints, while GraphQL lets clients request exactly the fields they need. GraphQL is useful for flexible clients but adds complexity around authorization, query cost, caching, and N+1 behavior.

## API Gateway

**Interview answer:**  
> An API gateway centralizes cross-cutting concerns such as authentication, rate limiting, routing, request validation, and telemetry. I keep domain logic out of it so it does not become a hard-to-change monolith.

## Rate Limiting

**Interview answer:**  
> Rate limiting protects the platform and downstream dependencies. Common algorithms include fixed window, sliding window, and token bucket. I scope limits by the identity that matters—user, tenant, API key, or tool—and use shared state if multiple instances must enforce one distributed limit.

## Caching Strategies

**Interview answer:**  
> Cache-aside loads the cache after a miss. Write-through updates cache and storage together. Write-back writes the cache first and persists asynchronously, trading durability for latency. Write-around bypasses the cache on writes. The right strategy depends on consistency, durability, and access patterns.

## Cache Stampede

**Interview answer:**  
> A cache stampede happens when a popular key expires and many callers hit the source simultaneously. I mitigate it using single-flight locking, request coalescing, randomized TTLs, stale-while-revalidate, or background refresh.

## Backpressure

**Interview answer:**  
> Backpressure prevents producers from overwhelming consumers. I can enforce bounded queues, concurrency limits, admission control, or rate limits. Without it, latency and memory can grow until the entire system fails.

## Dead-Letter Queue / Poison Message

**Interview answer:**  
> A poison message repeatedly fails because its data or assumptions are invalid. After bounded retries I move it to a dead-letter queue so normal work can continue and the failed item can be inspected or replayed safely.

## Containers

**Interview answer:**  
> A container packages an application and dependencies into a reproducible runtime image. It improves environment consistency and deployment portability. Persistent state should generally live outside the container.

## Kubernetes

**Interview answer:**  
> Kubernetes orchestrates containers across a cluster. Deployments manage replicas and rollouts, Services provide networking, probes determine readiness and liveness, and autoscaling adjusts capacity. I think of it as operational infrastructure, not application business logic.


---
# Data Processing, APIs & Production

## Batch vs Stream Processing

**Interview answer:**  
> Batch processing handles bounded datasets periodically and is simpler for bulk work. Stream processing handles events continuously with lower latency but requires ordering, replay, duplicates, and state management. Many systems combine streaming for freshness with batch reconciliation for correctness.

## ETL

**Interview answer:**  
> ETL means extract, transform, and load. In an AI ingestion pipeline, transformation may include parsing, OCR, normalization, metadata extraction, chunking, and validation. I also care about lineage and replay so failed or changed inputs can be reprocessed safely.

## Event Sourcing

**Interview answer:**  
> Event sourcing stores state changes as an append-only event history and derives current state from those events. It gives auditability and replay, but adds complexity around projections, event evolution, and eventual consistency.

## CQRS

**Interview answer:**  
> CQRS separates the write model from the read model. It helps when reads and writes have very different scaling or modeling needs, but it increases complexity, so I only introduce it when the workload benefits justify it.

## MapReduce

**Interview answer:**  
> MapReduce is a distributed batch model where map operations process partitions independently and reducers aggregate by key. Modern systems often use higher-level engines, but the core idea is parallelizing partitionable transformations and aggregation.

## Feature Store

**Interview answer:**  
> A feature store centralizes reusable ML features and helps keep training and serving definitions consistent. It usually provides offline historical features for training and optionally low-latency online features for inference.

## Model Serving / GPU Management

**Interview answer:**  
> Model serving is about exposing models with acceptable latency, throughput, versioning, and reliability. Self-hosted models also require GPU memory, batching, concurrency, autoscaling, and utilization management. I would self-host only when privacy, cost, latency, or control justify the operational burden.

## SSE vs WebSocket

**Interview answer:**  
> SSE is simple one-way server-to-client streaming over HTTP and works well for model tokens or progress updates. WebSockets are bidirectional and better when both sides need frequent real-time communication.

## Streaming Cancellation

**Interview answer:**  
> If the client disconnects, I want cancellation to propagate so unnecessary work stops. For durable background workflows I distinguish canceling the client connection from canceling the actual workflow, because those are not necessarily the same operation.

## Observability: Logs, Metrics, Traces

**Interview answer:**  
> Logs explain discrete events, metrics show aggregate trends and alert conditions, and traces follow one request across components. For agents I also capture workflow IDs, model and prompt versions, retrieval, tool calls, retries, approvals, token usage, and final outcomes.

## Contract Testing

**Interview answer:**  
> Contract tests verify that two components agree on their interface without requiring a full end-to-end environment. They are useful for external APIs, tool schemas, event contracts, and model adapters because they catch interface drift early.

## Canary Deployment

**Interview answer:**  
> A canary rollout exposes a new version to a small percentage of traffic and compares errors, latency, and relevant quality metrics before increasing exposure. For AI systems I may canary prompts, models, retrieval configurations, or policies as well as code.

## CI/CD for AI Systems

**Interview answer:**  
> AI CI/CD includes normal code tests plus evaluations for prompts, retrieval, structured outputs, and agent behavior. I version model and prompt configuration, run regression datasets before promotion, and use production failures to expand those regression sets.


---
# RAG, Search & Evaluation

## RAG

**Interview answer:**  
> RAG retrieves external evidence at query time and gives it to the model as context. The basic pipeline is ingest, chunk, index, retrieve, optionally rerank, assemble context, and generate with evidence. The hardest production issues are retrieval quality, authorization, freshness, and evaluation.

## Embeddings

**Interview answer:**  
> Embeddings map content into dense vectors where semantic similarity becomes geometric proximity. They're good for meaning-based retrieval but weaker for exact IDs or rare keywords, so I often combine them with lexical search and metadata filters.

## Vector Search / HNSW

**Interview answer:**  
> Vector search finds nearest embeddings to a query. At scale, approximate indexes like HNSW trade a little recall for much lower latency. HNSW is graph-based and usually offers strong recall, but uses more memory and has tuning tradeoffs during indexing and search.

## pgvector vs Dedicated Vector DB

**Interview answer:**  
> pgvector is attractive when relational metadata and vector search belong together and PostgreSQL can handle the scale. A dedicated vector database may provide more specialized indexing and scaling. I choose based on operational simplicity, filtering needs, scale, and workload.

## Qdrant

**Interview answer:**  
> Qdrant is a vector database focused on similarity search with payload metadata and filtering. It's useful when semantic retrieval is central. The vector store itself does not solve access control, so tenant and permission filters still have to be designed explicitly.

## Hybrid Retrieval

**Interview answer:**  
> Hybrid retrieval combines lexical search such as BM25 with vector search. Lexical retrieval is strong for exact terms and rare identifiers, while vector retrieval handles semantic similarity. I merge candidates with rank fusion and may rerank the combined set.

## Reciprocal Rank Fusion

**Interview answer:**  
> RRF combines multiple ranked lists using rank positions instead of trying to normalize incomparable raw scores. Each document gets points based on where it appears in each list. It's simple and effective for combining lexical and vector retrieval.

## Reranking

**Interview answer:**  
> First-stage retrieval is optimized for fast recall. A reranker spends more compute on a smaller candidate set to improve precision. I retrieve broadly, rerank a limited set, then send only the strongest evidence to the model.

## Precision@K / Recall@K

**Interview answer:**  
> Precision@K asks what fraction of the top K retrieved results are relevant. Recall@K asks what fraction of all relevant results were found in the top K. I often optimize first-stage retrieval for recall, then use reranking to improve precision.

## MRR / nDCG

**Interview answer:**  
> MRR rewards putting the first relevant result near the top. nDCG handles graded relevance and rewards highly relevant results appearing earlier in the ranking. I choose the metric based on what success means for the retrieval experience.

## Groundedness

**Interview answer:**  
> Groundedness asks whether the generated claims are supported by the supplied evidence. It differs from factual correctness because an answer might accidentally be true without being supported by the retrieved context.

## LLM-as-Judge

**Interview answer:**  
> LLM-as-judge uses a model to evaluate outputs against criteria such as groundedness or correctness. It's scalable for regression testing, but the judge is probabilistic and biased, so I validate it against human-labeled examples and avoid treating the score as absolute truth.

## RAG Evaluation

**Interview answer:**  
> I separate retrieval from generation evaluation. Retrieval uses metrics such as Precision@K and Recall@K. Generation can measure correctness, groundedness, citation quality, refusal behavior, and task success. That separation tells me whether a failure came from retrieval, prompting, the model, or post-processing.

## Chunking

**Interview answer:**  
> Chunking defines the retrieval unit. Tiny chunks lose context and huge chunks dilute relevance and consume tokens. I prefer structure-aware chunking where possible and evaluate chunk size empirically rather than assuming one fixed value works for every document.

## Reindexing / Freshness

**Interview answer:**  
> When source content changes, the retrieval index can become stale. I like event-triggered versioned indexing jobs, idempotent workers, explicit delete/update handling, and a periodic reconciliation process to catch missed events.

## Data Lineage

**Interview answer:**  
> Data lineage records where an artifact came from and which transformations produced it. In RAG that can include document version, parser, chunking config, embedding model, and index version. It makes debugging, reprocessing, and auditing much easier.


---
# Agents, LLM Integration & Safety

## Tool Calling

**Interview answer:**  
> Tool calling lets the model propose a structured operation such as searching or invoking an API. I treat it as a request, not authorization. Application code validates the tool and arguments, checks permissions, executes the operation, logs it, and returns only appropriate results to the model.

## Tool Registry

**Interview answer:**  
> A tool registry maps stable tool names to typed definitions and handlers. It centralizes schemas, permissions, descriptions, and execution policies and prevents arbitrary dynamic execution.

## Structured Outputs

**Interview answer:**  
> Structured outputs constrain model responses to a schema so downstream code can parse them reliably. I still validate at runtime and apply deterministic business rules before performing any real action.

## Prompt Injection

**Interview answer:**  
> Prompt injection is when untrusted input tries to alter the model's intended instructions. Indirect injection can arrive through retrieved documents or tool output. I treat external content as untrusted data, enforce authorization outside the model, use least-privilege tools, validate actions, and require human approval for high-risk operations.

## Direct vs Indirect Prompt Injection

**Interview answer:**  
> Direct injection comes from the user. Indirect injection is hidden inside content the agent consumes, such as a PDF or webpage. The key rule is that untrusted content can provide data, but it can never grant permission or redefine system policy.

## Prompt Versioning

**Interview answer:**  
> I treat prompts as versioned software artifacts. A deployed prompt version should be tied to model configuration and evaluation results so behavior is reproducible, comparable, and rollable back.

## Few-Shot Prompting

**Interview answer:**  
> Few-shot prompting gives representative examples of desired behavior. It's useful when instructions alone are ambiguous or formatting matters. I keep examples concise because they add token cost and can over-specialize behavior.

## Chain-of-Thought

**Interview answer:**  
> Chain-of-thought refers to intermediate reasoning that can improve complex task performance. In production I do not depend on exposing private model reasoning. I prefer structured plans, verifiable intermediate outputs, and tool traces that the system can inspect.

## ReAct

**Interview answer:**  
> ReAct alternates reasoning, action, and observation. It's flexible for tool use, but can produce expensive or unpredictable loops, so I bound steps, time, tokens, repeated calls, and allowed tools and define explicit termination and escalation.

## Sequential / Parallel / Hierarchical Agents

**Interview answer:**  
> Sequential orchestration fits dependent steps. Parallel execution reduces latency for independent tasks. Hierarchical orchestration uses a supervisor to delegate to specialists. I only use multiple agents when specialization, parallelism, or isolation clearly improves the system.

## Multi-Agent Systems

**Interview answer:**  
> Multi-agent systems split work across specialized model-driven components. Benefits include specialization and parallelism; costs include latency, tokens, shared-state complexity, disagreement handling, and debugging. My default is the simplest architecture that solves the problem.

## Agent Memory

**Interview answer:**  
> I separate working context, conversation history, semantic retrieval, long-term facts, and durable workflow state. The database owns critical workflow state; the prompt does not become the source of truth.

## Vector Memory vs Knowledge Graph

**Interview answer:**  
> Vector memory is good for semantic recall from unstructured information. Knowledge graphs are better for explicit entities and relationships. I choose based on whether the task needs similarity retrieval or structured relationship traversal.

## Human-in-the-Loop

**Interview answer:**  
> HITL inserts human review for risky or ambiguous decisions. I base escalation on risk, confidence, reversibility, policy, and impact. Read-only retrieval may be fully autonomous, while account suspension or financial changes may require explicit approval.

## Agent Guardrails

**Interview answer:**  
> Guardrails are deterministic controls around model behavior: schema validation, tool allowlists, authorization, rate limits, step budgets, moderation, human approval, and monitoring. I do not treat a system prompt as a security boundary.

## Hallucination Mitigation

**Interview answer:**  
> I cannot guarantee zero hallucination, so I layer mitigations: retrieval grounding, structured outputs, deterministic tools for facts and calculations, citations, validation, refusal behavior, evaluation, and human verification for high-risk actions.

## Model Routing

**Interview answer:**  
> Model routing chooses a model based on capability, cost, latency, privacy, and availability. I keep routing policy explicit and observable so switching providers or models does not silently alter business behavior.

## Model Fallback

**Interview answer:**  
> Fallback improves availability but can change output quality or semantics. I validate compatibility, define when fallback is allowed, keep side effects idempotent, and record which model handled each step.

## Agent Cost / Token Budgets

**Interview answer:**  
> I control cost with bounded steps and tokens, focused retrieval, state summarization, cheaper models for simpler tasks, caching when safe, and usage attribution by tenant or workflow. Cost needs telemetry just like latency and errors.

## Context Window / Context Engineering

**Interview answer:**  
> A larger context window does not mean I should fill it. Context engineering is choosing the right instructions, evidence, memory, state, and tool results for each step. Targeted context is usually cheaper and more reliable than dumping everything into the prompt.

## Deterministic Code vs LLM Reasoning

**Interview answer:**  
> I use models for interpretation, fuzzy reasoning, and language tasks. I keep permissions, calculations, policy enforcement, workflow transitions, and irreversible controls deterministic. Good agent architecture deliberately separates probabilistic reasoning from deterministic control.

## Safety Boundary

**Interview answer:**  
> A safety boundary is where model suggestions stop and enforced application policy takes over. Examples are tool authorization, allowed workflow transitions, spend limits, or human approvals. The system should stay safe even if the model produces nonsense or malicious output.


---
# Frameworks & Named Concepts

## LangChain

**Interview answer:**  
> LangChain provides abstractions for prompts, retrieval, tools, agents, and provider integrations. It can speed development, but abstractions can hide state and failure behavior. I prefer understanding the underlying architecture so the framework remains replaceable.

## LangGraph

**Interview answer:**  
> LangGraph models agent workflows as explicit graphs with nodes, state, and transitions. It is useful for branching or durable workflows where control flow needs to be clearer than an unconstrained agent loop.

## CrewAI

**Interview answer:**  
> CrewAI focuses on role-based teams of agents collaborating on tasks. It can be convenient for prototypes, but in production I would scrutinize state control, tool permissions, failure recovery, observability, and whether multiple agents are actually needed.

## AutoGPT

**Interview answer:**  
> AutoGPT popularized autonomous goal-driven loops where an LLM plans and repeatedly acts. It is useful conceptually, but unconstrained autonomy is usually too unpredictable for enterprise systems. I prefer bounded workflows with explicit state, tools, budgets, and approvals.

## HTN — Hierarchical Task Networks

**Interview answer:**  
> HTN planning decomposes a high-level task into smaller tasks using predefined methods. It gives more structure than purely LLM-generated planning and can be useful when a workflow has known decompositions but still needs planning flexibility.

## PDDL

**Interview answer:**  
> PDDL formally describes states, actions, preconditions, effects, and goals so a planner can search for a valid action sequence. I would consider it when explicit planning correctness matters, not as a default replacement for normal application workflows.

## AI SDK

**Interview answer:**  
> An AI SDK provides application abstractions around model calls, streaming, tools, structured outputs, and provider integrations. I use those conveniences while keeping business rules, authorization, and workflow state in my own application layer.


---
# Python & Practical AI Service Concepts

## FastAPI

**Interview answer:**  
> FastAPI is an ASGI Python framework built around type hints and schema validation. It's convenient for AI services because async endpoints, request models, streaming, and generated API docs are straightforward. I still keep business logic out of route handlers.

## Python Async

**Interview answer:**  
> Python async helps with I/O-bound concurrency such as model APIs, databases, and HTTP calls. While one task awaits I/O, the event loop can run another. It does not make CPU-bound Python work parallel; that usually needs processes, native code, or separate workers.

## Celery

**Interview answer:**  
> Celery is a distributed Python task queue used for background and long-running jobs. The request path enqueues work through a broker such as Redis or RabbitMQ and workers process it independently. Tasks should be idempotent because retries and redelivery happen.

## Redis

**Interview answer:**  
> Redis is an in-memory store commonly used for caching, rate limiting, ephemeral state, queues, and coordination. It's fast, but I don't treat it as the durable source of truth unless persistence and recovery are deliberately configured.


---
# Security, Authorization & Responsible AI

## Authentication vs Authorization

**Interview answer:**  
> Authentication answers who the caller is. Authorization answers what that identity may do. In an agent platform, authorization controls which documents, tools, and actions are available. I enforce it in application code, never through model instructions alone.

## RBAC vs ABAC

**Interview answer:**  
> RBAC grants permissions through roles such as admin or analyst. ABAC evaluates contextual attributes such as tenant, resource sensitivity, region, or workflow state. RBAC is simpler; ABAC supports finer-grained enterprise policies.

## Least Privilege

**Interview answer:**  
> Least privilege means every user, service, or agent receives only the permissions required for its task. I prefer specialized scoped tools and credentials instead of one general-purpose agent with access to everything.

## Tenant Isolation

**Interview answer:**  
> Tenant isolation prevents one customer's data or workload from affecting another. For RAG, permission filtering must happen before or during retrieval so unauthorized content never reaches the model context.

## Signed Webhooks

**Interview answer:**  
> Signed webhooks let the receiver verify origin and integrity, commonly with an HMAC. I validate the signature and timestamp to prevent replay and make processing idempotent because providers may redeliver events.

## Secrets Management

**Interview answer:**  
> Secrets belong in a dedicated secret manager, not source control or normal config. Services get only the credentials they need, credentials are rotated, and tool secrets should never be exposed to the model itself.

## Audit Logging

**Interview answer:**  
> Audit logs record consequential actions so they can be reconstructed later. I capture identity, workflow, action, authorization context, result, and relevant versions while minimizing sensitive prompt or data exposure.

## Bias & Fairness

**Interview answer:**  
> Fairness has to be defined for the specific task. I evaluate relevant subgroups, compare error rates, inspect data representation, and monitor changes over time. One aggregate metric cannot prove a system is unbiased.

## Auditability vs Explainability

**Interview answer:**  
> Explainability is about understanding why a decision was made; auditability is about reconstructing what happened. Even if model reasoning is not fully explainable, I can provide strong auditability through inputs, evidence, versions, tool calls, approvals, and outcomes.


---
# Voice & Multimodal

## STT / TTS Pipeline

**Interview answer:**  
> A voice agent streams audio into speech-to-text, sends the transcript through the conversational system, and streams text-to-speech back. The main issues are latency, partial transcripts, turn detection, interruption, transcription errors, accents, and fallback behavior.

## WebRTC

**Interview answer:**  
> WebRTC is used for low-latency real-time audio and video in browsers and apps. It handles media transport, NAT traversal, codecs, and peer connectivity. It's a natural choice when a voice agent needs bidirectional real-time audio.

## SIP

**Interview answer:**  
> SIP is a signaling protocol widely used in telephony to establish, manage, and terminate calls. In an AI voice system it can connect the application to phone infrastructure while a separate media path carries the audio.

## Turn-Taking / Barge-In

**Interview answer:**  
> A voice system needs to know when the user starts and stops speaking and should support interruption while the assistant is talking. That requires voice-activity detection, streaming STT, cancelable TTS, and state management to prevent responses to stale transcripts.

## Multimodal Input Handling

**Interview answer:**  
> Multimodal systems combine text, image, audio, or documents. The engineering challenge includes ingestion, normalization, permissions, file limits, latency, and deciding which modalities should be transformed before reaching the model.


---
# Applied ML Concepts From the Candidate Profile

## LoRA

**Interview answer:**  
> LoRA fine-tunes a model by learning small low-rank adapter matrices while keeping the base weights frozen. It dramatically reduces trainable parameters and memory compared with full fine-tuning.

## QLoRA

**Interview answer:**  
> QLoRA keeps the base model quantized, often at 4-bit, and trains LoRA adapters on top. It makes fine-tuning larger models possible with much less memory while preserving much of the quality of higher-precision training.

## Quantization

**Interview answer:**  
> Quantization represents model weights or activations with fewer bits, such as 8-bit or 4-bit instead of 16- or 32-bit. It reduces memory and can improve inference efficiency, with a potential tradeoff in numerical precision and quality.

## Precision vs Recall

**Interview answer:**  
> Precision asks how often positive predictions are correct. Recall asks how many actual positives were found. I choose the tradeoff based on false-positive versus false-negative cost rather than optimizing one metric blindly.

## Macro F1 vs Micro F1

**Interview answer:**  
> Macro F1 computes F1 per class and averages classes equally, so minority classes matter. Micro F1 aggregates predictions across examples first, so common classes contribute more. Macro F1 is useful when balanced performance across classes matters.

## Classification Threshold

**Interview answer:**  
> The threshold converts a model score into a decision. I select it using validation data and the business cost of false positives and false negatives, not simply accuracy. With imbalanced classes I often inspect precision-recall curves and may use class-specific thresholds.

## Class Imbalance

**Interview answer:**  
> Class imbalance can make accuracy misleading because the majority class dominates. I use per-class metrics, macro F1, confusion matrices, weighting or resampling, threshold tuning, and error analysis depending on the problem.

## Confusion Matrix

**Interview answer:**  
> A confusion matrix shows which true classes are being predicted as which other classes. It exposes systematic errors that aggregate metrics hide and is one of my first tools during classification error analysis.

## Overfitting

**Interview answer:**  
> Overfitting means the model learns training-specific patterns that do not generalize. A classic signal is training loss improving while validation performance stalls or degrades. Responses include better data, regularization, early stopping, smaller models, or simpler features.

## Error Analysis

**Interview answer:**  
> Error analysis means grouping and inspecting failures to find systematic patterns. I look at false positives, false negatives, label ambiguity, data quality, subgroup performance, and confidence before deciding what model or data change is actually worth making.


---
# Fast Recall Table


| Concept | One-line recall |
|---|---|
| CAP | During a partition, consistency and availability trade off. |
| Idempotency | Same logical operation can be retried safely. |
| At-least-once | Reliable delivery, duplicates possible. |
| Outbox | Commit business state and event record atomically. |
| Saga | Local transactions plus compensating actions. |
| Circuit breaker | Stop hammering an unhealthy dependency. |
| Backoff + jitter | Retry progressively without synchronized storms. |
| Queue | Distribute work to a logical consumer. |
| Pub/Sub | Fan one event out to multiple subscribers. |
| Kafka | Durable replayable event log. |
| SLI | Measurement. |
| SLO | Reliability target. |
| SLA | Customer commitment. |
| RAG | Retrieve evidence, then generate. |
| Hybrid retrieval | Lexical + vector search. |
| Reranking | Expensive second-stage relevance ordering. |
| Precision@K | How clean are the top K? |
| Recall@K | How much relevant evidence did top K capture? |
| ReAct | Reason → act → observe. |
| Tool calling | Model proposes; application authorizes and executes. |
| Guardrail | Deterministic control around model behavior. |
| HITL | Human review for risky or ambiguous actions. |
| Prompt injection | Untrusted data attempts to influence control instructions. |
| Structured output | Schema-constrained output plus validation. |
| Agent memory | Separate context, retrieval, history, and durable state. |
| LangGraph | Explicit graph/state orchestration. |
| HTN | Hierarchical decomposition of tasks. |
| PDDL | Formal actions, preconditions, effects, goals. |
| SSE | One-way HTTP streaming. |
| WebSocket | Bidirectional real-time communication. |
| Kubernetes | Container orchestration and rollout infrastructure. |
| LoRA | Train low-rank adapters, freeze base model. |
| Macro F1 | Equal class weighting. |
| Micro F1 | Aggregate instance-level performance. |


---

# Rehearsal Method

For each concept:

1. Read only the heading.
2. Explain it aloud without looking.
3. Aim for **30–60 seconds**.
4. Reveal the reference answer.
5. If you missed the definition, tradeoff, or example, answer it once more.
6. Move on.

A strong interview answer usually follows:

> **What it is → where I use it → main tradeoff → concrete example**

Do not turn a 45-second question into a five-minute lecture unless the interviewer asks for depth.
