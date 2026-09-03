# AI Engineering Interview Prep

A practical interview-preparation bank for AI engineering and applied-AI roles. It combines implementation prompts, system-design exercises, data-structures practice, behavioral questions, and concise review notes on the production concerns that matter for AI systems.

## What's included

| Area | Contents |
| --- | --- |
| `technical/` | 45 AI-engineering exercises covering async/API fluency, agent workflows, RAG, tool safety, reliability, evaluation, observability, and security. |
| `system_design/` | 20 system-design prompts for enterprise AI platforms and services. |
| `dsa/` | 40 programming and data-structures questions. |
| `behavioral/` | Behavioral prompts with targeted follow-up questions. |
| `ai-engineer-interview-cheatsheet.md` | Fast-review answers for core backend, distributed-systems, and AI engineering topics. |
| `questions.jsonl` | Machine-readable catalog of the question bank. |

Selected technical exercises also include reference implementations in Python and TypeScript.

## How to use this repository

1. Pick one question from a track that matches the interview format.
2. Read the prompt and clarify the stated requirements before designing a solution.
3. Implement or outline the solution within a time box.
4. Use the follow-up questions and rubric in each prompt to assess your answer.
5. Review the cheatsheet regularly to build concise, spoken explanations of important tradeoffs.

For an implementation exercise, start with its `question.md`. For example:

```text
technical/ttl_cache/question.md
technical/bounded_parallel_tool_runner/question.md
system_design/permission_aware_rag_service/question.md
dsa/sliding_window_maximum/question.md
```

## Suggested practice loop

- **Technical coding:** 45–60 minutes to implement, then 10 minutes to discuss tests, failure modes, and production hardening.
- **System design:** 35–45 minutes to clarify requirements, draw the architecture, and explain scaling, reliability, security, and cost tradeoffs.
- **Behavioral:** Answer using Situation, Task, Action, and Result (STAR); prepare concrete metrics and decisions you personally owned.

## Repository layout

```text
.
├── behavioral/       # Behavioral interview prompts
├── dsa/              # Data structures and algorithms questions
├── system_design/    # AI-system architecture prompts
├── technical/        # Production AI engineering exercises
├── questions.jsonl   # Question catalog
└── ai-engineer-interview-cheatsheet.md
```

## Focus areas

The question bank emphasizes the parts of AI engineering that distinguish a production-ready answer: authorization-aware retrieval, prompt and tool injection defenses, idempotency, retries, queues, durable workflows, model routing, evaluations, observability, human approval, and cost controls.

## Contributing

Keep additions focused and practical. New exercises should state the interview prompt, requirements, clarifying questions, follow-ups, production considerations, and an evaluation rubric. Add a catalog entry to `questions.jsonl` when applicable.
