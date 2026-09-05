# Designing a Real-Time Voice Agent

A voice agent is not simply text chat with a microphone attached. It is a real-time media system, a conversation manager, an AI workflow, and a privacy-sensitive recorder. It succeeds when the person can interrupt naturally and receive a useful response quickly, without an unfinished transcript or a stale response triggering the wrong action.

## 1. Move audio with a latency budget in mind

The client captures microphone frames and sends a continuous audio stream to a nearby media service. **WebRTC** is usually the best fit for browser and mobile real-time media because it handles network adaptation, NAT traversal, and audio transport. **WebSockets** can work when the application manages its own streaming protocol and needs a simpler bidirectional connection.

Audio codecs compress speech. Small packets reduce delay but increase overhead; large packets are efficient but make an interruption feel slower. Networks also deliver packets unevenly. A **jitter buffer** holds a small amount of audio to smooth that variation. It should be just large enough to avoid choppy playback; a very large buffer makes the agent sound like it is responding from another room.

Treat latency as a budget rather than one number:

```text
microphone → network → speech-to-text → model first token → tools → TTS → speaker
```

Instrument every stage. A good total target may still feel bad if the speech recognizer waits too long before deciding the user has stopped talking.

## 2. Turn audio into a committed turn

**Voice activity detection (VAD)** distinguishes likely speech from silence or background noise. **Endpointing** decides when a turn has ended. They are related but different: VAD may detect a pause; endpointing decides that the pause is long enough, or the sentence complete enough, to let the agent respond.

Streaming speech-to-text (STT) sends **partial transcripts** as the speaker talks. They make the interface feel alive and can let the agent prepare retrieval, but they are guesses. Only a committed, final transcript may update durable workflow state or invoke a tool. Otherwise a recognition correction such as “transfer ten” becoming “transfer ten thousand” could cause an incorrect action.

The language model should stream its response text as it generates it. Streaming text-to-speech (TTS) can begin synthesizing and playing the first safe sentence before the final sentence exists. Keep tool claims behind a confirmation boundary: the agent can say it is checking an account, but must not say a change succeeded until the tool result is known and validated.

## 3. Make interruption a first-class feature

Humans routinely speak over a voice assistant. This is called **barge-in**. Give each input turn a sequence number and a cancellation token. When a new turn begins while the agent is speaking:

1. Stop current audio playback.
2. Cancel obsolete model generation and TTS work.
3. Drop buffered output associated with the old sequence number.
4. Begin STT and state processing for the new turn.

Providers may not cancel instantly, so sequence numbers matter: a late response from turn 14 must never be played after the user has reached turn 15. Persist only the committed conversation state. Temporary partial transcripts and cancelled output should be short-lived.

Some responses need several tool calls, such as checking an order and its delivery status. Run independent calls concurrently only within a limit, join their results, and make cancellation propagate to every child task. High-impact actions require a spoken or visual confirmation and still go through deterministic authorization and approval controls; voice is a user interface, not an exception to security.

## 4. Keep the session alive through failure

The session service authenticates the user, applies locale and retention settings, and assigns a session ID. Keep minimal durable state—committed turns, current workflow, approvals, and important results—outside the media process so a reconnect can resume safely. **Session affinity** routes an active call to the same worker where possible, reducing transfer overhead, but it must not make the session unrecoverable if that worker dies.

Deploy media and AI services regionally near users. Health-aware routing and provider failover can move a new or reconnected session away from a degraded region. If STT, the model, or TTS is slow, respond honestly with a short acknowledgement, text fallback, callback option, or human transfer. Never imply that an unavailable tool action was completed.

Scale based on concurrent sessions, active media streams, codec CPU, network bandwidth, TTS/STT connections, model throughput, and provider quotas. Request count alone is misleading: one hour-long call and one short request put very different load on the platform.

## 5. Treat voice as sensitive data

Audio can contain names, payment information, health information, and bystanders. Obtain recording consent before storing audio, state whether transcripts are stored, and apply tenant and regional retention rules. Encrypt recordings and transcripts, restrict access, redact PII from normal telemetry, and support deletion consistent with legal and contractual requirements.

Finally, measure cost per minute: capture and transport, STT, model tokens, TTS, storage, and human handoff all contribute. That makes it possible to choose a quality level that is both useful to the caller and sustainable for the product.
