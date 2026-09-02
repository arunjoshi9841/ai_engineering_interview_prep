# Conversational Voice Agent

**Interviewer:** Design a real-time voice interface for an enterprise support agent.

**Me:** I would design a streaming pipeline with explicit turn ownership: audio session, voice activity detection, speech-to-text, agent processing, and text-to-speech. The system should optimize perceived latency, but it must never let an interim guess trigger a consequential action.

The session service authenticates the user, applies tenant locale and retention policy, and creates a session ID. Audio streams to the media layer, which sends interim and final transcripts to the agent runtime. Interim transcripts can support speculative preparation, but only a committed turn can update workflow state or call a tool.

Each turn has a sequence number and cancellation token. When the user interrupts while the agent is speaking, the media layer stops playback, cancels obsolete model and synthesis work, clears stale buffered audio, and starts the new turn. This prevents an old response from playing after the conversation has moved on.

The model can stream text to TTS, but tool calls remain behind a deterministic gateway. Low-confidence values such as account numbers require confirmation. Account changes, payments, or other high-impact actions require policy checks, step-up authentication, or human transfer.

Providers need separate deadlines, circuit breakers, and regional health. If STT, the model, or TTS is slow, the agent should communicate that it is working or offer text, callback, or human support. It should never pretend that a tool action succeeded. Tool calls that time out after possible side effects become indeterminate and are reconciled.

Audio and transcripts are sensitive. Consent, regional storage, encryption, redaction, retention, and deletion are tenant settings. Routine logs should contain timing and IDs rather than recordings or raw transcripts.

**Interviewer:** What is the target latency?

**Me:** I would target roughly one second from the end of a committed turn to the first response audio, while measuring each stage separately. We can reduce perceived delay with streaming and short acknowledgments, but correctness and interruption handling matter as much as raw latency.

**Interviewer:** What if the user switches languages mid-session?

**Me:** Detect the change with the speech service, confirm if confidence is low, and switch the locale for subsequent turns. The session state should record the language version and preserve the same authorization and safety rules.
