# 100 interview questions based on your GitHub code

This is tailored to the current code in `lattice`, the ML repositories, and the `nirvana-*` TypeScript packages. Each response is deliberately written in first person and avoids claiming metrics that the repositories do not publish. Adapt the wording to your exact contribution on any collaborative or academic project.

## Lattice — knowledge platform and agent runtime

1. **Can you walk me through Lattice’s architecture?**

   I designed Lattice as a multi-tenant knowledge platform with a deliberately clear control plane. Next.js provides the UI, FastAPI owns product policy and authorization, PostgreSQL plus pgvector owns durable application data and retrieval, S3 holds original private files, and Celery/Redis runs indexing asynchronously. External systems such as Clerk, Firecrawl, Gemini, and OpenRouter are providers behind the API boundary, so their capabilities do not become my authorization model.

2. **Why did you use PostgreSQL and pgvector instead of a dedicated vector database?**

   For the first version, keeping transactional resource state, access constraints, lexical search, vectors, and citation provenance in PostgreSQL reduced operational complexity and consistency boundaries. It lets retrieval apply organization and folder constraints where the source-of-truth data lives. I would reconsider a separate vector database when corpus size, latency, or operational scaling makes that trade-off compelling, but I would keep authorization and canonical metadata in the application database.

3. **How do you enforce multi-tenant isolation?**

   Clerk proves who the caller is, but PostgreSQL membership is the authorization source of truth. I map the Clerk subject to a local user and validate active organization membership before organization-scoped operations. Agent folder scopes narrow what a tool can search, but they never replace the user’s membership check, which keeps configuration from becoming an authorization bypass.

4. **Why did you not use Clerk Organizations as the tenant model?**

   I separated identity from product tenancy intentionally. Clerk is excellent for credentials, sessions, verification, and profile workflows, while my application needs its own organization lifecycle, memberships, invitations, root folders, and resource access semantics. Owning that relational model in PostgreSQL makes those product rules explicit and queryable without coupling authorization to an external organization abstraction.

5. **How does a direct browser-to-S3 upload remain secure?**

   The backend creates a pending application resource first and issues short-lived upload instructions for a private, opaque S3 object key. The browser never receives broad bucket credentials. On completion, the backend verifies object length and metadata against the resource before transitioning it to uploaded, so possession of an upload URL alone is not treated as proof that a valid resource exists.

6. **Why use opaque, stable S3 keys?**

   I do not encode names or folder paths into object keys because folders are product metadata that can change. An opaque stable key avoids leaking user-facing names in storage paths and prevents a rename or move from becoming a physical object migration. PostgreSQL remains authoritative for hierarchy and display names.

7. **What is the resource indexing lifecycle?**

   A verified upload or URL resource creates a durable job. A worker claims it, extracts normalized content, chunks it by resource type, embeds the chunks, writes candidate chunks, and atomically activates the completed representation. Metadata generation is intentionally after activation, so a summary or tagging failure produces a warning rather than destroying a successfully searchable index.

8. **How do you make Celery indexing safe when delivery is at least once?**

   I assume tasks can be retried or duplicated. Workers claim jobs using a lease token, validate transitions and the resource snapshot, and make writes conditional on that claim. If a worker no longer owns the lease or the job is no longer eligible, it exits rather than publishing stale results.

9. **How does reindexing avoid a retrieval outage?**

   Reindexing writes a replacement processing job in isolation. The resource continues to point to its current active successful job while the new chunks and embeddings are built. Only after the replacement succeeds do I atomically switch the active-job pointer; if it fails, the prior searchable representation remains live.

10. **What happens when a document has no searchable content?**

   The orchestrator explicitly fails an empty chunk set as an `empty_index` application error rather than silently creating a resource that looks indexed but cannot answer questions. The job records a public-safe failure message and diagnostic detail, which gives the UI a clear state while retaining operational context.

11. **How do you handle different document types?**

   I normalize the source before indexing, then select a chunker by category. Docling handles richer documents, focused processors handle text and structured inputs, Firecrawl acquires web pages and site crawls, and images have their own processor. The common normalized representation lets the downstream indexing, retrieval, and citation layers behave consistently.

12. **Why are web and uploaded documents on one indexing path?**

   Their acquisition differs, but users expect the same search behavior, metadata, citations, and access controls regardless of origin. I normalize both into a resource descriptor and content representation, then run the same chunking, embedding, activation, and metadata stages. That avoids two subtly divergent search systems.

13. **How do you limit a site crawl?**

   A site resource is treated differently from a single webpage and passes a bounded `crawl_max_pages` value to the web acquirer. That cap is product policy, not a suggestion to the provider. It controls cost and prevents an accidental or hostile URL from turning an ingestion request into an unbounded crawl.

14. **How does hybrid retrieval work in Lattice?**

   I retrieve both dense semantic candidates and PostgreSQL full-text candidates, then combine their ranks with reciprocal-rank fusion. This is useful because embeddings capture semantic similarity while lexical search catches exact terms, names, IDs, and uncommon wording. The fused candidate also preserves which retrieval mode matched and the individual scores for observability.

15. **Why reciprocal-rank fusion rather than directly mixing raw scores?**

   Dense similarity and lexical ranking scores have different distributions, so directly adding them is poorly calibrated. Reciprocal-rank fusion works on position rather than score scale and rewards candidates that rank well in either or both lists. It is a simple, robust baseline that I can tune through candidate counts and the rank constant.

16. **How do you keep retrieval context diverse?**

   Before packing context, I deduplicate near-identical text using a normalized prefix fingerprint and cap the number of chunks from any one resource. Then I respect both a character budget and result limit, truncating only the last feasible chunk. That reduces repeated passages and prevents one document from crowding out all other evidence.

17. **Why is there a minimum useful chunk length when packing context?**

   If the remaining budget can only fit a tiny fragment, adding it often makes the prompt less coherent without adding evidence. The code stops when a sub-80-character tail would be added after earlier selections. It is a small guardrail that favors readable, attributable context over filling every available character.

18. **How do citations remain trustworthy?**

   I retain resource identity and location provenance—such as page, slide, sheet, heading, or crawled URL—with each chunk. The runtime returns citations based on the evidence actually retrieved and supplied to the model, rather than creating generic links after generation. That makes the citation traceable to a source passage.

19. **What is resource discovery before content retrieval?**

   Some questions are really asking which file or resource is relevant, not asking for a passage from every document. I distinguish that intent so the system can resolve the likely resource first and then retrieve its content when appropriate. It produces more focused answers and avoids broad retrieval for document-navigation questions.

20. **How do agents interact with knowledge safely?**

   An agent is stored configuration: model, prompt, icon, and enabled tools. The model can request a server-owned Knowledge Search tool, but the backend owns the organization and folder scope, timeouts, result budgets, and citation construction. The model never receives arbitrary database access or a client-defined tool definition.

21. **Why prohibit arbitrary custom tools in v1?**

   Arbitrary tools expand the security and reliability surface dramatically: credentials, side effects, prompt injection, egress, and authorization delegation all become concerns. I chose a bounded set of built-in tools first so I could make scope, timeout, retry, and observability behavior reliable. Custom tools are an extension only after those controls can be generalized safely.

22. **How do you prevent an agent loop from running indefinitely?**

   Each request is governed by an overall timeout, a maximum number of model rounds, a maximum number of tool calls, per-tool call caps, and a final-answer time reserve. The runtime enforces those server-side using a `RunPolicy`, so a model’s intent cannot override them. The user gets a structured error if the system cannot finish within the bounds.

23. **What is the final-answer reserve and why is it important?**

   Tool use should not consume the entire request deadline and leave no time to synthesize a response. I reserve a bounded slice of the total timeout for the final answer, capped at half of the request budget. This makes the runtime behave more predictably under slow tools or repeated tool calls.

24. **How do you handle provider timeouts differently from overall runtime timeouts?**

   I distinguish a timed-out model call from exhaustion of the entire agent runtime and surface separate safe error codes. That distinction matters operationally: a provider timeout points toward gateway behavior or model latency, while a runtime timeout may reflect a sequence of tools and rounds. Both are logged with request context and duration.

25. **How is streaming implemented without losing durability?**

   The runtime emits an initial conversation event, streams typed events over authenticated SSE, and persists the assistant message before the terminal successful event. That ordering means the visible answer corresponds to durable conversation state. Conversation and agent-session identifiers are sent up front so the client can reconcile the streamed turn.

26. **Why use SSE for Playground streaming?**

   The interaction is primarily server-to-client incremental output, so SSE is a simpler fit than a bidirectional persistent protocol. It works naturally with standard HTTP infrastructure and allows typed events for conversation start, tokens, citations, completion, and errors. I would use WebSockets only if the product needed richer bidirectional live collaboration.

27. **How do you serialize concurrent messages to one conversation?**

   The code includes conversation-level locking as part of the runtime boundary. The goal is to preserve a well-defined ordered history and avoid two simultaneous turns each building prompts from an inconsistent prefix. In a horizontally scaled deployment, I would ensure the lock is backed by shared infrastructure or an equivalent database transaction strategy.

28. **How do you avoid duplicate tool calls?**

   The runtime design includes duplicate-call coalescing alongside call budgets and retries. Equivalent pending calls should share work rather than issue repeated provider requests. That improves latency and cost while keeping the loop policy independent from any individual model’s behavior.

29. **Why place OpenRouter behind a model gateway?**

   The application should depend on a streaming-model contract, not on a provider SDK throughout the codebase. A gateway centralizes request shaping, timeouts, provider errors, and metadata handling. That makes provider substitution and testing easier and keeps the runtime focused on product policy.

30. **How do you make agent behavior configurable but controlled?**

   I persist agent configuration, including prompt and model choice, but keep the runtime’s tool registry and policy server-owned. That separation gives product users useful configuration without exposing execution controls that would weaken tenant isolation or reliability. In other words, an agent can be customized without becoming a privileged principal.

31. **How are invitations designed securely?**

   Invitations are application-owned records with expiry, and the system previews an invitation before authentication and accepts it only after the authenticated Clerk user returns. The backend controls organization membership changes; email delivery is through a provider such as Resend. In production, raw tokens and invitation URLs are not printed to logs or console output.

32. **How do you avoid loading an entire organization folder tree?**

   Folder APIs return immediate mixed entries, breadcrumbs, and a cursor rather than recursively materializing the whole tree. That keeps navigation latency and payload size bounded as organizations grow. It also matches the interaction pattern, where a user generally opens one folder at a time.

33. **How do folder-scoped agent knowledge sources work with nested folders?**

   A selected folder scope includes its descendants for retrieval configuration, which is convenient for organizing a knowledge base. However, that scope is applied only after the caller’s active organization membership is verified. It limits what an agent can search, not who is allowed to access the organization.

34. **What are your indexing observability signals?**

   I persist processing stages and make them visible through resource responses so the frontend can poll meaningful status. Jobs also retain failure code, safe public message, and diagnostic detail. At runtime, structured logs include turn context, outcome, duration, limits, and tool configuration, which supports both debugging and aggregate monitoring.

35. **How do you protect secrets and environment-specific configuration?**

   The repository ships safe `.env.example` files with placeholders and keeps provider credentials outside version control. The backend validates configuration such as its async PostgreSQL URL and uses the standard AWS credential chain where possible, so deployment can rely on IAM roles rather than long-lived keys in environment files.

36. **Why use async SQLAlchemy with FastAPI?**

   The API handles I/O-bound work such as database calls, provider calls, and streaming. Async SQLAlchemy lets request handlers avoid blocking the event loop while waiting on PostgreSQL, provided I maintain disciplined session lifecycle and avoid doing CPU-heavy extraction on API workers. The heavy indexing work is explicitly moved to Celery.

37. **What belongs in Celery rather than a request handler?**

   Extraction, crawling, chunking, embedding, and derived metadata generation can take seconds or minutes and can fail independently of the upload request. I make them durable background jobs so the user gets an immediate resource state and can observe progress. Request handlers handle validation and state transitions, not long-running provider workflows.

38. **How would you scale indexing?**

   I would scale workers independently from the API and route work to the dedicated indexing queue. I would monitor queue depth, job age, provider latency, lease expirations, and error rates, then set concurrency according to CPU, memory, and provider limits. Because jobs are durable and claimed conditionally, scaling workers does not require changing the resource API.

39. **How do you handle embedding-provider failures?**

   I validate that the provider returns one embedding per draft chunk before candidate chunks are written. A mismatch becomes a controlled application error rather than a corrupted partial index. Any exception records failure for that candidate job; importantly, a failed reindex does not replace the active index.

40. **What testing strategy would you apply to Lattice?**

   I would test pure units such as rank fusion, context packing, policy decisions, and chunking independently; integration-test repositories and migrations against disposable PostgreSQL; and contract-test providers with fakes. For high-risk flows, I would test authorization matrices, upload completion verification, idempotent job claims, reindex rollback behavior, and streaming event order.

41. **How would you test tenant isolation?**

   I would create at least two organizations with resources, conversations, and agents in each, then attempt every cross-organization read and write using valid users and tokens. Tests should cover direct endpoints, nested folders, retrieval filters, tool calls, invitation acceptance, and guessed identifiers. I would assert both that data is absent and that no citation or metadata leaks through error paths.

42. **How would you improve retrieval quality?**

   I would first build an evaluation set of real, permissioned questions with expected sources, then measure recall, citation correctness, answer groundedness, and latency. From there I would tune chunking, candidate limits, rank-fusion settings, reranking, and context packing. I would avoid optimizing only answer fluency because a polished but unsupported answer is the failure mode this product must resist.

43. **What would you do about prompt injection in indexed content?**

   I would treat retrieved text as untrusted data, clearly delimit it in prompts, and instruct the model not to follow instructions embedded in sources. More importantly, tool scope and data access are enforced outside the model, so an injected passage cannot grant new tools or organization access. I would add adversarial retrieval tests and logging for suspicious tool-request patterns.

44. **Why did you defer workflow automation and multi-agent coordination?**

   Those features introduce durable execution state, scheduling, idempotent external side effects, handoffs, and much more complicated failure recovery. Lattice v1 focuses on a narrower but useful foundation: grounded support agents with controlled retrieval and bounded runtime behavior. I prefer extending from reliable primitives rather than labeling an unbounded orchestration layer as an agent platform.

45. **What would be your next production priorities for Lattice?**

   I would prioritize evaluation and observability, stronger operational dashboards for indexing and retrieval, rate limits and quotas by organization, robust deletion and retention semantics, and deployment hardening. I would then add carefully scoped capabilities such as versioned agents or more ingestion sources. The key principle would remain that new convenience features cannot weaken the access, provenance, and runtime boundaries already established.

## Emergency dispatch triage

46. **Why did you frame emergency dispatch as a multi-task problem?**

   The same transcript can imply incident category, urgency, and needed response teams, and those outputs share language signals. I used a shared DeBERTa encoder with multiple task heads so the representation can benefit from related supervision while retaining task-specific predictions. I also included independent variants to compare whether sharing is actually helpful.

47. **What is the benefit and risk of a shared encoder?**

   The benefit is parameter efficiency and potentially better generalization when tasks are related. The risk is negative transfer: optimizing one task can harm another if their signals conflict or labels are noisy. I would compare per-task validation metrics against independent models and consider task-loss weighting or partially shared architectures if the trade-off is unfavorable.

48. **How did you address class imbalance?**

   The project includes distribution analysis, sampling, and stratified splitting so label prevalence is visible and represented across splits. I would report class-level precision, recall, F1, and confusion matrices rather than relying on accuracy, especially because rare high-consequence labels are where an apparently strong aggregate score can be misleading.

49. **Why use stratified splitting?**

   Stratification reduces the chance that a rare category or urgency class disappears from validation or test data. It makes metrics more comparable across splits and helps reveal whether the model generalizes beyond the most frequent patterns. For multiple labels, I would verify that the chosen stratification method preserves the important marginal and co-occurrence distributions.

50. **How does transcription affect the model?**

   Transcription is upstream of every downstream decision, so errors in names, locations, negations, or urgency phrases can become classification errors. The pipeline includes audio transcription and cleanup as distinct stages so I can inspect and evaluate that boundary. In a real system I would measure end-to-end performance as well as performance on clean transcripts.

51. **What are the risks of synthetic transcripts and labels?**

   Synthetic data can improve coverage and help prototype a pipeline, but it can also encode unrealistic language, label shortcuts, or generator artifacts. I would keep synthetic and real-data results separate, audit samples, and never represent synthetic evaluation as operational dispatch performance. Human review and real, permissioned data are essential before any safety-critical use.

52. **How would you evaluate a dispatch-triage model?**

   I would report each task’s loss, precision, recall, F1, and confusion matrix, then evaluate by operationally meaningful slices such as rare incidents, unclear calls, and noisy transcripts. I would prioritize recall or calibrated risk thresholds for dangerous misses, but that decision must be made with domain experts. The repository correctly treats this as research, not an automated dispatch decision system.

53. **How would you prevent data leakage in this dataset?**

   I would split by incident, caller, source recording, or time window before creating derivative records, rather than randomly splitting transcript fragments. I would also ensure synthetic examples derived from one source do not cross splits. Leakage can produce impressive metrics while telling us almost nothing about performance on new calls.

54. **How would you deploy this safely?**

   I would not deploy it as an autonomous decision maker. A safer progression is an offline analysis tool, then a human-facing triage aid with uncertainty displayed, audit logs, and explicit escalation procedures. It would require prospective validation, monitoring for drift and disparities, privacy controls for recordings, and governance from dispatch professionals.

55. **What does your code structure say about maintainability?**

   I separated extraction, synthetic-data generation, preprocessing, dataset handling, model definitions, training, evaluation, and plotting. That makes it easier to swap a transcription client or compare model architectures without rewriting the pipeline. It also makes each experimental assumption easier to inspect than a monolithic notebook.

## Clinical de-identification, language-model reasoning, and vision-language data

56. **How does the clinical de-identification project work end to end?**

   I start with synthetic Synthea structured records, inspect and format them into clinical sections, generate readable notes through a local Ollama workflow, build original/de-identified training pairs, and fine-tune Gemma using LoRA. I then perform a small local inference check. The important boundary is that synthetic data makes experimentation safer, but it does not prove safety on real clinical text.

57. **Why use synthetic Synthea records?**

   Synthetic records let me develop note generation, dataset construction, and fine-tuning workflows without putting real patient data into a student or local experimentation environment. They are useful for engineering the pipeline, but I would not assume their language and identifier distributions fully represent real clinical notes. Real-world validation would require governed data access and privacy review.

58. **Why LoRA for clinical de-identification?**

   LoRA adapts a base model by training small low-rank updates rather than all model weights, which reduces memory and storage requirements. That makes it practical to test task-specific adaptation locally and keeps the resulting artifact smaller. It does not reduce the need for rigorous privacy evaluation; efficient fine-tuning and safe de-identification are separate concerns.

59. **Can an LLM guarantee de-identification?**

   No. A language model can miss identifiers, alter clinical meaning, or create a false sense of safety through fluent output. I state that clearly in the project: outputs need separate privacy testing before storage, sharing, or use with real clinical text. I would combine automated detection, adversarial test sets, human review, and a documented risk threshold rather than relying on one model.

60. **How would you evaluate de-identification quality?**

   I would measure identifier recall by type because missed identifiers are the primary privacy risk, along with precision to avoid unnecessary clinical-information loss. I would use held-out, annotated examples and adversarial cases involving dates, locations, relatives, and indirect identifiers. I would also assess semantic preservation, because deleting private information must not change medications, conditions, or treatment meaning.

61. **What did the small-language-model reasoning project compare?**

   I compared direct generation, a short worked-example prompt, supervised LoRA fine-tuning, and rejection fine-tuning for unit conversion using SmolLM2-360M-Instruct. The project separates prompt baselines from adapter training and evaluates numeric correctness within a relative tolerance as well as parseable-answer rate. That lets me distinguish solving the problem from merely producing well-formed output.

62. **What is rejection fine-tuning in this context?**

   I generate candidate reasoning traces, filter them using the task’s correctness criteria, and fine-tune on the retained examples. The goal is to bias the model toward trajectories associated with correct answers without requiring every trace to be manually authored. I would be careful not to call the resulting text a faithful explanation; a correct final number does not prove the generated rationale is valid.

63. **Why use a relative tolerance for unit-conversion accuracy?**

   Numeric answers can differ slightly because of rounding or representation, so exact string match would mark reasonable answers incorrect. Relative tolerance scales the permitted error with the value and is more appropriate for floating-point quantities. I would still define special handling near zero and document the tolerance so the benchmark is reproducible.

64. **How does the vision-language data pipeline generate training examples?**

   It parses structured driving-scene annotations and turns object identities and relative positions into question-answer pairs. A JSON manifest then links image file, question, and answer for training or evaluation with SmolVLM. This separates label generation from model training and makes the template assumptions visible in code.

65. **What are the limitations of its spatial reasoning labels?**

   The labels are derived from two-dimensional bounding-box centers, with one near-center object treated as the reference vehicle. That is an efficient controlled dataset construction method, but it does not represent depth, occlusion, or full scene geometry. I would present it as a constrained VQA task, not as validated driving perception.

66. **Why is exact-match accuracy insufficient for VQA?**

   It is useful when answers are short and canonical, because it is simple and deterministic. But it misses semantically equivalent wording and gives no partial credit, so it can understate useful behavior or hide nuanced failures. I would supplement it with normalized matching, answer-type metrics, and human or semantic evaluation where the task permits free-form answers.

## Image tokenization and memory-efficient training

67. **What is the image-tokenization pipeline?**

   I encode image patches with an autoencoder, quantize the latent representation into discrete binary codes, map those codes to integer tokens, and train a causal transformer to model token sequences. Generation samples tokens autoregressively and decodes them back to images. This makes image generation structurally similar to language modeling while keeping the visual tokenizer explicit.

68. **Why tokenize images into discrete codes?**

   Discrete tokens let an autoregressive model work over a finite vocabulary instead of continuous pixel values or latents. They provide a clean interface between compression, reconstruction, and generation. The trade-off is that the tokenizer’s reconstruction quality limits the generator’s ceiling, and a poorly used code space can reduce image diversity.

69. **What is binary spherical quantization in your implementation?**

   The encoder projects latents into a codebook-bit space, normalizes them, and applies a differentiable sign operation to produce values in `{−1, +1}`. The signs correspond directly to bit positions, which are packed into integer token IDs. This avoids learning a large explicit codebook while giving a fixed vocabulary of up to `2^bits` codes.

70. **How can you backpropagate through a sign function?**

   A hard sign has zero or undefined gradients, so I use a straight-through estimator. The forward pass uses discrete signs, while the backward pass treats the operation like the identity through `x + (sign - x).detach()`. It is an approximation, but it lets the encoder learn under a discrete forward representation.

71. **How are integer tokens encoded and decoded?**

   Each nonnegative quantized bit is interpreted as 1 and each negative bit as 0, then weighted by powers of two and summed into an integer. Decoding reverses that bit extraction and maps 0/1 back to −1/+1 before the decoder projection. I keep that mapping explicit so tokenization is deterministic and inspectable.

72. **Why track unused and low-usage codebook entries?**

   A discrete tokenizer can collapse onto a small part of its available vocabulary, which wastes capacity and makes the token distribution less expressive. The model computes the fraction of codes never used and used very rarely across a batch. These are diagnostic signals, not complete quality metrics, but they highlight codebook collapse early.

73. **How does the autoregressive image model preserve generation order?**

   The transformer is causal, so each token prediction may attend only to previously generated tokens. During sampling, the token sequence is reconstructed into its spatial grid and then decoded through the tokenizer. The chosen raster order is a modeling assumption; alternate scan orders or two-dimensional attention could change locality and quality.

74. **What is the compression experiment doing?**

   The project uses predicted token probabilities as the basis for an experimental compression path. Conceptually, a model that assigns high probability to likely tokens can support entropy coding. I label it experimental because a production codec needs careful bitstream design, performance work, error handling, and comparisons to established codecs.

75. **Explain your 4-bit blockwise quantization.**

   I flatten a weight tensor into fixed-size groups, calculate one absolute-max scale per group, map normalized values into 16 unsigned levels, and pack two 4-bit values per byte. At inference, I unpack and dequantize to FP32 before reshaping for a linear layer. The grouping reduces scale overhead while allowing the quantization range to adapt locally.

76. **Why store scales in FP16 but compute with FP32?**

   Scales are stored in FP16 to reduce model storage, while dequantization and the linear operation use FP32 for a clearer and more stable reference implementation. This is a reasonable educational trade-off: it demonstrates memory effects without claiming the speed of production fused kernels. A performance-focused implementation would use optimized low-bit kernels.

77. **What is the difference between LoRA and QLoRA in your project?**

   LoRA freezes the original higher-precision weights and learns low-rank adapter matrices. QLoRA applies the same adapter idea on top of a quantized base, reducing base-weight storage further. The project compares logical parameters, trainable parameters, storage, and numerical output differences to show that these methods optimize different constraints.

78. **Why does the quantized layer dequantize weights on every forward pass?**

   It keeps the implementation compact and makes the quantization math easy to inspect, which is appropriate for a learning-oriented residual-network test bed. I explicitly would not represent it as an optimized inference layer. Production use would require fused kernels, careful memory layout, and hardware-aware benchmarking.

79. **How would you validate a compression technique beyond parameter counts?**

   I would compare storage, peak memory, throughput, latency, numerical error, and task quality on a held-out workload. Parameter count alone misses scale metadata and runtime activation costs, while numerical closeness alone does not prove task-level preservation. The right comparison depends on whether the deployment bottleneck is memory, bandwidth, latency, or quality.

80. **What are common pitfalls in low-bit quantization?**

   Outliers can dominate a group’s scale and reduce resolution for most weights, group size changes the accuracy-versus-overhead trade-off, and bias or activation precision can matter as much as weight precision. I would check shape constraints, test zero and extreme values, and compare per-layer error rather than relying on one whole-model average.

## React and TypeScript packages

81. **What problem do the Nirvana packages solve?**

   I split reusable frontend functionality into focused packages: helpers for common TypeScript utilities, hooks for browser interactions and timing, UI controls for consistent components and themes, and tables for stateful sorting, filtering, pagination, and URL synchronization. This creates composable building blocks rather than repeatedly copying patterns across applications.

82. **Why separate helpers, hooks, UI, and table packages?**

   They have different dependency and release profiles. A pure formatting helper should not pull in React, while a table can depend on UI styles without forcing every application to adopt all components. The separation also makes APIs easier to understand and lets consumers use the smallest package that meets their need.

83. **How does `useTable` manage complexity?**

   The hook centralizes filter state, sorting, pagination, individual filter debounce delays, and optional query-string synchronization. UI components such as headers and pagination can stay mostly declarative because the state transitions live in one tested abstraction. I would clearly document controlled versus uncontrolled behavior so consumers know who owns the source of truth.

84. **Why synchronize table state with the URL?**

   URL state makes filtered and sorted views bookmarkable, shareable, and resilient to a page refresh. It is especially useful for admin and data-heavy interfaces. I make it optional because not every table should mutate navigation state, and parsing and serialization must be backward-compatible.

85. **How would you avoid URL-sync feedback loops?**

   I would normalize serialized values, compare the next state with current state before writing, and distinguish a navigation-driven update from a user-driven update. Effects should depend on stable, minimal values rather than fresh object references. I would also test browser back/forward navigation and invalid or stale query parameters.

86. **Why support per-filter debounce rather than one global delay?**

   Different filters have different interaction costs: typing a search string benefits from a delay, while choosing a status checkbox may need to apply immediately. Per-filter configuration avoids making the entire table feel sluggish or overly chatty. It also lets an application align client behavior with the cost of its server queries.

87. **How would you design a robust `useInfiniteScroll` hook?**

   I would use `IntersectionObserver` with a sentinel element, guard against concurrent loads, expose loading and exhaustion state, and disconnect observers during cleanup. I would handle changed callbacks with refs or stable callbacks so an observer does not constantly recreate. The hook should not assume a particular pagination API; it should simply signal when more data should be requested.

88. **What are the limitations of device detection in `useDeviceType`?**

   The hook uses user-agent and touch heuristics, which are useful for presentation choices but cannot reliably identify hardware or capability. Browsers can spoof user agents and many devices blur the mobile/desktop distinction. I would feature-detect the actual capability I need whenever possible and treat the heuristic as advisory.

89. **How would you prevent timer and polling hook leaks?**

   I would create intervals or timeouts inside effects, clear them in cleanup, and avoid capturing stale callbacks through a ref or correctly specified dependencies. Polling should pause when appropriate, avoid overlap if a request is still running, and expose cancellation or enabled state. These details matter because a hook that works in a demo can quietly multiply network work in a real application.

90. **How does the dropdown hook coordinate trigger and target elements?**

   The contract is explicit: a trigger names its menu with `data-dropdown-toggle`, and the target uses that matching ID plus expected classes. That makes the behavior reusable without tightly coupling it to a single component implementation. I would complement it with keyboard navigation, focus management, escape handling, and ARIA semantics for production accessibility.

91. **Why do your UI packages require style imports?**

   Package components ship behavior and class names, while the consumer imports the corresponding styles once near the application root. That keeps the package easy to integrate in different build systems and makes styling dependency explicit. I would document import order, theming hooks, and any peer dependencies to prevent visually broken installations.

92. **How would you design a searchable select that supports local and remote data?**

   For local data, filtering can be immediate and deterministic. For remote data, I would debounce input, cancel or ignore stale requests, display loading and error states, and make the selection model independent from result pages. The package’s `onSearch` option creates that extension point without forcing every select to fetch data.

93. **What accessibility concerns matter for custom selects and modals?**

   They need correct semantic roles, keyboard navigation, a visible focus state, focus trapping for modals, escape-to-close where appropriate, and focus restoration on close. I would also ensure screen readers receive labels, selected state, and validation feedback. Custom controls are where native browser accessibility guarantees are easiest to accidentally lose.

94. **How should a component library manage breaking changes?**

   I would use semantic versioning, publish a concise migration guide, and avoid changing props or CSS contracts casually. For a breaking improvement, I would often introduce a new API with a deprecation period instead of silently changing behavior. I would also test exports and consumer build compatibility before release.

95. **Why are helpers like currency and phone validation intentionally scoped?**

   Utilities can become misleading when they pretend to be universal. The current currency formatter uses `en-US`, phone validation targets North American-style numbers, and state data covers the US and Canada. I prefer documenting those boundaries so a consumer knows when to supply an internationalized or domain-specific implementation instead.

96. **How would you internationalize those helpers?**

   I would accept locale, currency, region, and timezone as explicit options and rely on `Intl` where it models the problem well. For phone numbers, I would use a maintained international numbering library rather than expanding regexes indefinitely. The default behavior should remain stable, while applications can opt into the required regional rules.

97. **How do you think about client-side password validation?**

   Client validation gives quick feedback, such as length and character-class requirements or rejecting a contained username. But it is only a usability layer; the server must enforce the canonical policy and securely hash the password. I would avoid exposing overly prescriptive rules unless they align with the authentication system’s actual policy.

98. **How would you test these packages?**

   I would use unit tests for pure helpers, hook tests with fake timers and mocked browser APIs, component tests for keyboard and screen-reader semantics, and small integration tests for table URL state. I would also run TypeScript type checks, package build checks, and a consumer fixture to catch export, CSS, or peer-dependency regressions.

99. **How do you avoid over-abstracting a component library?**

   I start from recurring application needs and create small, composable primitives with clear contracts. I avoid adding a generic prop for every hypothetical design because that makes APIs harder to use and maintain. When a feature is truly application-specific, I keep it in the application until a second or third use demonstrates the right abstraction.

100. **What does this portfolio show about how you approach software engineering?**

   Across the repositories, my pattern is to make boundaries explicit: data provenance and tenant access in Lattice, stages and metrics in ML pipelines, quantization assumptions in model experiments, and contracts in reusable frontend utilities. I value practical prototypes, but I document limitations rather than overstating readiness. In an interview, I would emphasize that I can move from a focused implementation to production thinking by identifying the reliability, evaluation, security, and maintainability work that remains.

## 1. What problem are Evals solving in Lattice?

Before Evals, I could manually ask an agent questions and inspect whether the answers looked reasonable, but that does not give me a reproducible way to measure changes.

Evals introduce a fixed benchmark suite where the same agent can be run against the same questions repeatedly. I can then measure retrieval quality, answer quality, latency, token usage, and cost.

The important distinction is that evaluation becomes part of the engineering feedback loop rather than subjective manual testing. If I change chunking, reranking, prompts, retrieval parameters, or models, I can see whether the system actually improved or regressed.

---

## 2. Why use a fixed benchmark instead of letting users create arbitrary eval questions?

For the first version, I wanted the benchmark to behave more like an engineering test suite than a product feature.

The benchmark has known documents, expected answers, expected facts, and expected resources. That means results between runs are comparable.

Allowing arbitrary user-created eval sets would introduce additional concerns like authoring UX, benchmark quality, permissions, lifecycle management, and versioning. Those are not necessary to validate the underlying eval architecture, so they are explicitly deferred.

---

## 3. Why are benchmark resources separate from normal organization resources?

Because benchmark data has a fundamentally different ownership model.

Normal resources belong to an organization and organization membership determines whether they are retrievable. Benchmark resources are platform-owned and must never accidentally appear in a customer's filesystem or normal Knowledge Search.

Rather than weakening the normal `Resource` ownership model with nullable organization IDs or creating a fake benchmark organization, benchmark resources live in a distinct persistence domain.

During an eval run, the backend explicitly replaces the normal organization knowledge scope with a benchmark scope.

That preserves tenant isolation instead of introducing exceptions into it.

---

## 4. Why doesn't the eval system have its own Agent runtime?

Because then I would be testing a different system from the one users actually use.

An eval uses the selected agent's current model, system prompt, enabled tools, retrieval behavior, reranking, context packing, citations, and final generation path.

The only meaningful difference is the knowledge scope: during an eval, normal organizational knowledge is replaced with the benchmark corpus.

That means performance measured by the benchmark is representative of production Playground behavior.

---

## 5. How do you prevent the LLM from accessing benchmark resources it should not?

The model never controls retrieval scope.

The backend determines the eval set, resolves its benchmark corpus, and constructs the allowed retrieval scope before tool execution. The LLM can request Knowledge Search, but it cannot provide arbitrary resource IDs or widen the benchmark scope.

That is consistent with the broader Lattice architecture: agent knowledge configuration is never treated as authorization, and retrieval boundaries are resolved server-side before content reaches the model.

---

## 6. What retrieval metrics would you use, and why not just evaluate the final answer?

I separate **retrieval quality from generation quality**.

For retrieval I capture metrics such as:

- expected-resource hit/miss
- expected-resource rank
- Recall@K
- reciprocal rank
- retrieved resource and chunk IDs
- citations

Suppose the correct document was ranked first but the LLM produced a bad answer. That is primarily a generation failure.

Conversely, if the answer is wrong because the correct document never entered the context window, that is primarily a retrieval failure.

Without separating those stages, you cannot diagnose where the RAG pipeline actually failed.

---

## 7. What is Recall@K in the context of Lattice?

Recall@K asks whether the expected relevant resource appears in the first **K retrieved results**.

For example, if an eval question should be answered from `refund-policy.pdf`, and that resource appears within the top five retrieved resources, Recall@5 succeeds for that expected resource.

It is especially useful for determining whether retrieval is finding the correct material before reranking and generation.

I would complement it with rank-sensitive metrics like reciprocal rank because finding the document at rank 1 is more useful than finding it at rank 20.

---

## 8. Why use LLM-as-judge instead of only deterministic metrics?

Some answer qualities are not easy to evaluate deterministically.

I can objectively measure whether the correct resource was retrieved, latency, cost, token counts, and ranks. But properties like completeness, groundedness, whether the answer satisfies the expected facts, or whether citations genuinely support the answer require semantic evaluation.

So the design combines both.

**Deterministic metrics** answer:

> What objectively happened?

**LLM-as-judge** answers:

> Was this response actually good?

I deliberately do not collapse both into one opaque overall number.

---

## 9. Why must the judge model be independent from the Agent model?

Separating them reduces coupling between the system being evaluated and the evaluator.

The judge receives the question, expected answer, expected assertions, judging policy, retrieved provenance, actual answer, and citations.

It returns structured fields such as correctness, completeness, groundedness, citation support, policy compliance, and pass/fail.

The judge model can therefore be changed independently without changing what agent was tested.

---

## 10. Why are `EvalCaseResult` and `Judgment` separate entities?

Because execution evidence is immutable historical fact, while judgment is an interpretation of that evidence.

Conceptually:

```text
EvalRun
  -> EvalCaseResult
      -> Judgment
```

`EvalCaseResult` stores what happened: answer, retrieved resources, latency, tokens, cost, citations, tool calls, and so on.

`Judgment` stores how a particular judge model and judging policy evaluated that result.

That separation allows me to take an old execution result and re-score it with a better judge model without spending money and time rerunning the original agent.

---

## 11. Why snapshot Agent configuration during an EvalRun?

Because an agent is mutable.

If I run an eval today and then change its system prompt or model tomorrow, simply storing `agent_id` would not tell me what configuration produced yesterday's result.

So each eval run snapshots relevant execution configuration such as:

- model ID
- system prompt
- enabled tools
- retrieval configuration
- benchmark version
- eval-set version
- judge model
- judge policy version

This gives historical reproducibility even though full Agent versioning has not been implemented yet.

---

## 12. Why store execution-time cost instead of recalculating cost later?

Model pricing changes.

If I recomputed the cost of a six-month-old eval using today's pricing, historical dashboards would change even though the original run did not.

So I normalize and persist the provider's execution-time usage and cost when available.

I also keep **agent execution cost** and **judge cost** separate because they are different workloads, while total eval cost is simply their sum.

---

## 13. How do benchmark documents get indexed without duplicating the ingestion system?

Benchmark resources reuse the same downstream pipeline as normal resources:

```text
S3 / Firecrawl
    -> normalization
    -> structure-aware chunking
    -> Gemini embeddings
    -> PostgreSQL lexical representation
    -> generated metadata
    -> searchable representation
```

The ownership adapter differs, but the processing implementation stays shared.

That matters because having separate "eval chunking" and "production chunking" would invalidate the benchmark: I would be evaluating a retrieval pipeline that users do not actually use.

---

## 14. How do you make benchmark synchronization idempotent?

The S3 manifest defines stable domain identities.

I do not use filenames, array positions, or S3 listing order as IDs. Instead, resources and eval cases have stable keys such as:

```text
(eval_version, resource_key)
(eval_set_id, case_key)
```

Bootstrap then performs upserts using those identities.

That means running bootstrap repeatedly, restarting deployments, or rediscovering the same S3 benchmark should update existing projections rather than creating duplicates.

---

## 15. How would you debug an eval case that suddenly starts failing?

I would avoid immediately blaming the LLM and inspect the pipeline stage-by-stage.

First I would check the execution snapshot to see whether the model, prompt, tools, retrieval configuration, or benchmark changed.

Then I would inspect retrieval traces:

```text
query
  -> dense candidates
  -> lexical candidates
  -> fused results
  -> reranked results
  -> selected context
  -> citations
```

If retrieval looks correct, I would inspect the generated answer and judge rationale.

I would also inspect model and tool call counts, latency, token usage, finish reason, and provider errors.

The point of the eval observability design is to answer **why** something failed, not just tell me that its pass rate dropped.

