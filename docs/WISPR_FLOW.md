# Wispr Flow in CONFLUENCE — Voice Interface Architecture

> **Wispr Flow is the voice interface of CONFLUENCE, converting natural spoken language into structured organizational memory actions.**

Think of Wispr Flow as the **voice interface, not the AI brain**. It empowers leaders and engineers to interact with organizational memory by speaking naturally rather than typing.

---

## 1. Where Wispr Flow Fits in the CONFLUENCE Pipeline

```
  ┌────────────────┐
  │  User Speaks   │  "Why is our January platform launch at risk?"
  └───────┬────────┘
          │ Speech audio
  ┌───────▼────────┐
  │   Wispr Flow   │  Converts speech into text and types directly
  │  (Voice Input) │  into the focused CONFLUENCE search/input field
  └───────┬────────┘
          │ Dictated text prompt
  ┌───────▼────────┐
  │ Context Router │  Determines relevant Space (Backend, Launch, HR),
  │ & Permissions  │  project scope, and user access permissions
  └───────┬────────┘
          │ Scoped retrieval request
  ┌───────▼────────┐
  │ Memory Engine  │  Retrieves relevant Decisions, Tasks, Blockers,
  │   & Postgres   │  and Transcript Segments
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
* *"Why was the platform launch date put at risk?"*
* *"What did the backend team decide in its last meeting?"*
* *"Why was single-node Redis caching superseded?"*
* *"Which unresolved blockers are affecting recruitment and engineering?"*

**Result**: CONFLUENCE queries across permitted Space boundaries and delivers an evidence-backed answer citing verified transcript quotes with speaker names and timestamps.

---

### Mode B: Voice-Driven Task & Commitment Management
Users command and navigate execution state verbally:
* *"Show me all high-priority tasks in Backend."*
* *"Find all active blockers affecting March 15 launch."*
* *"Create a follow-up commitment for Elena to prepare Alembic partition scripts."*

**Result**: CONFLUENCE filters execution state or proposes a new commitment draft in the **Action Review Drawer** for human approval before persisting to canonical storage.

---

### Mode C: Correcting Meeting Intelligence
Meeting transcripts and automated extractions can have nuances that require human refinement:
* *"The database partition deadline is tentative, not final."*
* *"This decision belongs to Engineering → Backend, not Infrastructure."*
* *"The platform launch depends on the Senior Backend hire capacity."*

**Result**: CONFLUENCE interprets the dictated correction, verifies against existing evidence, and creates a proposed update with full audit logging upon user approval.

---

## 3. Technical Integration

1. **External Desktop Wispr Flow Integration**:
   Wispr Flow operates system-wide, directly inserting transcribed speech into whichever text field is currently focused inside CONFLUENCE (zero proprietary API coupling required).
2. **Native Web Speech API Fallback**:
   For browser environments where the desktop Wispr Flow client is not installed, CONFLUENCE includes an in-app microphone listener (`webkitSpeechRecognition` / `SpeechRecognition`) that streams spoken input directly into the input bar.
3. **Deterministic Enforcement**:
   Regardless of whether input is typed or dictated via Wispr Flow, no database state is mutated without human review and approval.
