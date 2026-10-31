# Wispr Flow in CONFLUENCE — Voice Interface Architecture

> **Wispr Flow is the voice interface of CONFLUENCE, converting natural spoken language into structured organizational memory actions.**

Think of Wispr Flow as the **voice interface, not the AI brain**. It empowers leaders and engineers to interact with organizational memory by speaking naturally rather than typing.

---

## 1. Where Wispr Flow Fits in the CONFLUENCE Pipeline

```
  ┌────────────────┐
  │  User Speaks   │  "Why was the Smart Routing rollout paused?"
  └───────┬────────┘
          │ Speech audio
  ┌───────▼────────┐
  │   Wispr Flow   │  Converts speech into text and types directly
  │  (Voice Input) │  into the focused CONFLUENCE search/input field
  └───────┬────────┘
          │ Dictated text prompt
  ┌───────▼────────┐
  │ Context Router │  Determines relevant Space (Payments, SRE, Risk),
  │ & Permissions  │  project scope, and user access permissions
  └───────┬────────┘
          │ Scoped retrieval request
  ┌───────▼────────┐
  │ Memory Engine  │  Retrieves relevant Decisions, Tasks, Blockers,
  │   & Database   │  and Transcript Segments
  └───────┬────────┘
          │ Evidence candidates
  ┌───────▼────────┐
  │ Agent Pipeline │  Synthesizes dependencies, cross-space conflicts,
  │  & Integrity   │  and supersession lineage
  └───────┬────────┘
          │
  ┌───────▼─────────────────────────────────────────────────────┐
  │ Evidence-Backed Answer & Action Proposal                    │
  │ Cites transcript quotes, speakers, and linked decision trail│
  └─────────────────────────────────────────────────────────────┘
```

---

## 2. The Three Voice Interaction Modes

### Mode A: Voice-Powered Organisational Search
Users dictate complex, cross-team questions without manual typing:
* *"Why was the Smart Routing rollout paused?"*
* *"What changed from the original rollout plan?"*
* *"What must happen before we can expand to 20%?"*
* *"Which teams still have launch blockers, and who owns each action?"*
* *"Can Merchant Operations confirm the pilot expansion date?"*

**Result**: CONFLUENCE queries across permitted Space boundaries and delivers an evidence-backed answer citing verified transcript quotes with speaker names and timestamps.

---

### Mode B: Voice-Driven Task & Commitment Management
Users command and navigate execution state verbally:
* *"Show me all high-priority tasks in Payments Platform."*
* *"Find all active blockers affecting the 14 November readiness review."*
* *"Create a follow-up commitment for Daniel Foster to verify idempotent failover retry logic."*

**Result**: CONFLUENCE filters execution state or proposes a new commitment draft in the **Action Review Drawer** for human approval before persisting to canonical storage.

---

### Mode C: Correcting Meeting Intelligence
Meeting transcripts and automated extractions can have nuances that require human refinement:
* *"The 20% pilot expansion was superseded, not approved."*
* *"Risk team sign-off requires shadow mode data through 13 November."*
* *"Merchant communications must remain on hold until the 14 November gate."*

**Result**: CONFLUENCE interprets the dictated correction, verifies against existing evidence, and creates a proposed update with full audit logging upon user approval.

---

## 3. Technical Integration

1. **External Desktop Wispr Flow Integration**:
   Wispr Flow operates system-wide, directly inserting transcribed speech into whichever text field is currently focused inside CONFLUENCE (zero proprietary API coupling required).
2. **Native Web Speech API Fallback**:
   For browser environments where the desktop Wispr Flow client is not installed, CONFLUENCE includes an in-app microphone listener (`webkitSpeechRecognition` / `SpeechRecognition`) that streams spoken input directly into the input bar.
3. **Deterministic Enforcement**:
   Regardless of whether input is typed or dictated via Wispr Flow, no database state is mutated without human review and approval.
