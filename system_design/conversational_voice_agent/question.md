# Conversational Voice Agent

## 1. Interview Prompt

Design a real-time voice interface for an enterprise support agent. It should stream speech in both directions, handle turn-taking and interruption, and fall back safely when transcription, models, tools, or synthesis are slow or unavailable.

Focus on the application pipeline and latency/safety tradeoffs; deep telephony signaling details are supporting discussion only.

## 2. Requirements

- Accept authenticated browser or telephony audio sessions with tenant policy and locale.
- Stream voice activity detection, speech-to-text, agent processing, and text-to-speech.
- Support barge-in by cancelling obsolete model and synthesis work promptly.
- Maintain explicit turn and conversation state outside model context.
- Distinguish interim transcripts from committed user turns.
- Bound latency, tokens, tool calls, session duration, and buffered audio.
- Require confirmation or human transfer for consequential actions.
- Handle accents, noise, multilingual sessions, silence, and low transcription confidence.
- Preserve consent, retention, redaction, and regional controls for audio and transcripts.
- Degrade to text, callback, or human handoff without pretending success.

## 3. Initial System Context

The initial target is 1,000 concurrent sessions. Users expect the agent to begin responding within about one second after a turn ends. STT, model, and TTS providers stream independently and have different regional availability. Some tools take several seconds.

## 4. Example Input / Output

```text
user speaks -> interim STT -> final turn -> streaming model -> streaming TTS
user interrupts during TTS -> stop playback, cancel obsolete generation, start new turn
low-confidence account number -> ask for confirmation; do not call account tool
TTS unavailable -> offer text or human fallback
```

## 5. Clarifying Questions the Candidate Should Ask

**Candidate:** Is full duplex audio required?

**Interviewer:** The transport can be full duplex, but the interaction needs controlled turn ownership and interruption.

**Candidate:** May interim transcripts trigger tools?

**Interviewer:** No. Consequential interpretation waits for a committed turn and policy checks.

**Candidate:** Is call recording required?

**Interviewer:** It varies by tenant and jurisdiction; design explicit consent and retention policy.

## 6. What the Interviewer Is Evaluating

- Streaming pipeline and perceived-latency reasoning
- Turn state, cancellation, and backpressure
- Accuracy, confirmation, and graceful fallback
- Privacy, safety, and observability

## 7. Likely Interviewer Follow-Ups

- How do you prevent audio from an old turn playing after interruption?
- Which stages can safely run speculatively?
- How do you measure conversational quality beyond latency?
- Where do WebRTC and SIP fit?

## 8. Architecture Change Requests

1. One provider adds 800 ms of latency in a required region.
2. The agent must switch languages mid-session.
3. A customer permits account changes only after step-up authentication.

## 9. Concept Questions and Interview Answers

### Why distinguish interim and final transcripts?

**Interview answer:**

> Interim text reduces perceived latency but can change as recognition improves. It may support speculative preparation, but committed workflow decisions need stable input.

### What is barge-in?

**Interview answer:**

> It is the user interrupting while the agent speaks. The system must stop playback, cancel obsolete work, and establish a new turn without mixing responses.

## 10. Production Discussion

Discuss media gateway, session service, VAD/STT, agent runtime, TTS, cancellation tokens, jitter buffers, regional routing, transcript state, fallbacks, and human transfer. Monitor time to transcript, first audio, interruption success, word error proxies, silence, tool latency, abandonment, and transfers.

## 11. Security / Safety Angle

Authenticate sessions, minimize and encrypt audio, manage consent and deletion, redact sensitive transcripts, prevent voice content from granting authorization, and require step-up verification for high-risk actions. Consider replay and impersonation risk.

## 12. Evaluation Rubric

| Dimension | Score |
| --- | ---: |
| Requirement clarification | /5 |
| Streaming and turn design | /5 |
| Latency and failure handling | /5 |
| Quality and observability | /5 |
| Privacy and safety | /5 |
