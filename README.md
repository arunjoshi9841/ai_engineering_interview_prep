# AI Engineering Interview Prep

A practical, hands-on preparation library for AI engineering, applied-AI, and backend interviews. It combines production-oriented coding prompts, system-design case studies, data-structures practice, behavioral preparation, and concise review notes.

## Start here

| If you want to practice... | Start with... |
| --- | --- |
| Production AI engineering | [Technical exercises](technical/) — 45 prompts on agents, RAG, evaluation, safety, reliability, and observability. |
| Architecture and tradeoffs | [System design notes](system_design/) — 20 interview-oriented architecture case studies. |
| Coding fundamentals | [DSA problems](dsa/) — 40 data-structures and algorithms questions. |
| Interview stories | [Behavioral questions](behavioral/questions.md). |
| Rapid review | [AI engineering cheatsheet](cheatsheet/ai_engineering.md) and [LLM concepts](cheatsheet/llm.md). |
| Codebase-based discussion | [Interview questions based on GitHub code](interview-questions-based-on-github-code.md). |

## How to use this repository

1. Choose a track that matches the format of the interview you are preparing for.
2. Read the prompt, clarify requirements, and set a realistic time box.
3. Explain your approach before writing code or drawing an architecture.
4. Review tradeoffs, failure modes, security, cost, and observability before you finish.
5. Use the cheatsheets to practice concise spoken answers after each session.

For technical and DSA exercises, begin with the folder’s `question.md`; some also include reference answers or implementations. For system design, each topic is a self-contained `design.md` case study. NotebookLM audio is linked from the relevant notes, so the repository stays lightweight.

## System design library

### AI systems and platform engineering

- [Production agent platform](system_design/production_agent_platform/design.md)
- [Enterprise knowledge system](system_design/enterprise_knowledge_system/design.md)
- [Operating AI systems in production](system_design/operating_ai_systems/design.md)
- [Safe AI actions](system_design/safe_ai_actions/design.md)
- [Security investigation assistant](system_design/security_investigation_assistant/design.md)
- [Real-time voice agent](system_design/real_time_voice_agent/design.md)
- [Reliable external integrations](system_design/reliable_external_integrations/design.md)
- [Distributed systems data layer](system_design/distributed_systems_data_layer/design.md)

### Systems at scale

- [AWS Lambda at scale](system_design/aws_lambda_at_scale/design.md)
- [Checkout payment system](system_design/checkout_payment_system/design.md)
- [Global hotel bookings](system_design/global_hotel_bookings/design.md)
- [High-scale social feed](system_design/high_scale_social_feed/design.md)
- [Instagram’s Python scaling](system_design/instagram_python_at_scale/design.md)
- [Music streaming at scale](system_design/music_streaming_at_scale/design.md)
- [Reddit at scale](system_design/reddit_at_scale/design.md)
- [Slack concurrency](system_design/slack_concurrent_users/design.md)
- [Twitter timeline frontend](system_design/twitter_timeline_frontend/design.md)
- [Uber’s hexagonal maps](system_design/uber_hexagonal_maps/design.md)
- [WhatsApp message delivery](system_design/whatsapp_message_delivery/design.md)
- [YouTube daily users](system_design/youtube_daily_users/design.md)

## Practice tracks

### Technical exercises

The [technical](technical/) track focuses on the production details that distinguish a strong AI-engineering answer: authorization-aware retrieval, prompt and tool-injection defenses, idempotency, retries, queues, durable workflows, model routing, evaluations, observability, approvals, and cost control.

Good starting points:

- [TTL cache](technical/ttl_cache/question.md)
- [Bounded parallel tool runner](technical/bounded_parallel_tool_runner/question.md)
- [Permission-aware RAG context](technical/permission_aware_rag_context/question.md)
- [Reliable queue consumer](technical/reliable_queue_consumer/question.md)
- [Prompt-injection code review](technical/prompt_injection_code_review/question.md)
- [Retrieval evaluation harness](technical/retrieval_evaluation_harness/question.md)

### Data structures and algorithms

The [DSA](dsa/) track covers arrays, strings, trees, graphs, heaps, intervals, caching, and concurrency-style data structures.

Good starting points:

- [Two sum](dsa/two_sum_target_pair/question.md)
- [LRU cache](dsa/o1_lru_cache/question.md)
- [Merge K sorted feeds](dsa/merge_k_sorted_feeds/question.md)
- [Sliding-window maximum](dsa/sliding_window_maximum/question.md)
- [Shortest path through a grid](dsa/shortest_path_through_grid/question.md)
- [Serialize and restore a binary tree](dsa/serialize_restore_binary_tree/question.md)

### Behavioral preparation

Use the [behavioral question guide](behavioral/questions.md) to prepare concise STAR stories. Anchor each story in a decision you made, the tradeoff you evaluated, the result you measured, and what you would change next time.

## Suggested practice loop

- **Technical coding:** 45–60 minutes to implement, then 10 minutes to discuss tests, failure modes, and production hardening.
- **System design:** 35–45 minutes to clarify requirements, draw the architecture, and explain scaling, reliability, security, and cost tradeoffs.
- **Behavioral:** 5–10 minutes per story, with concrete metrics and clear personal ownership.

## Repository layout

```text
.
├── behavioral/      # Behavioral interview guide
├── cheatsheet/      # AI engineering and LLM review notes
├── dsa/             # 40 DSA questions and selected answers
├── system_design/   # 20 architecture case studies
├── technical/       # 45 production AI engineering exercises
├── interview-questions-based-on-github-code.md
└── questions.jsonl  # Machine-readable question catalog
```

## Contributing

Keep additions practical and interview-ready. New exercises should state the prompt, requirements, clarifying questions, follow-ups, production considerations, and evaluation rubric. Add a catalog entry to `questions.jsonl` when applicable.
