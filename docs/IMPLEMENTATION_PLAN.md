# Implementation Plan

## 1. Delivery strategy

Build one end-to-end workflow first:

**Upload transcript → choose Space → extract structured records → review
evidence → persist → connect to history → ask a question → inspect the
decision trail.**

This vertical slice is more valuable than implementing many disconnected
screens or agents.

## 2. Suggested team split

For a four-person team:

  -----------------------------------------------------------------------
  Owner                   Primary responsibility  Deliverables
  ----------------------- ----------------------- -----------------------
  Person A                Frontend / product UI   App shell, Spaces,
                                                  meeting detail, graph,
                                                  dashboard

  Person B                Backend / data          FastAPI, PostgreSQL
                                                  schema, migrations,
                                                  APIs, seed data

  Person C                Agent workflow          Context Router,
                                                  extraction, linking,
                                                  audit, answer
                                                  generation

  Person D                Integration /           End-to-end wiring,
                          evaluation / demo       tests, KPI benchmark,
                                                  demo script, polish
  -----------------------------------------------------------------------

Everyone should agree on API schemas and database contracts before
parallel implementation. One person owns integration and final branch
stability.

## 3. Milestones

### Milestone 0 --- Repository and contracts

-   Create monorepo structure.
-   Configure frontend and backend.
-   Add `.env.example`.
-   Agree on entity names, enums, API response shapes.
-   Create a working health endpoint and app shell.

**Acceptance:** frontend can call backend; database connection works; no
secrets committed.

### Milestone 1 --- Spaces and seeded organisation

-   Create organisation, departments, Spaces, users/memberships.
-   Build Space selector and Space overview.
-   Add permission helper functions.
-   Seed Engineering/Backend, HR/Recruitment, Product/Platform Launch.

**Acceptance:** a user can select a Space and see only permitted data.

### Milestone 2 --- Meeting ingestion

-   Upload or paste transcript.
-   Validate file type and size.
-   Parse transcript into segments.
-   Create meeting record and processing status.
-   Show transcript and processing state.

**Acceptance:** uploaded transcript is stored and rendered with stable
segment IDs.

### Milestone 3 --- Structured extraction

-   Define Pydantic schemas for decisions, tasks, blockers, questions,
    and evidence.
-   Implement Meeting Analyst.
-   Validate all evidence segment IDs and quote spans.
-   Display extracted candidates in a review interface.

**Acceptance:** reviewer can inspect candidate items and source
evidence; invalid model output is rejected safely.

### Milestone 4 --- Approval and persistence

-   Approve/reject individual candidates.
-   Persist canonical records and evidence links transactionally.
-   Create graph nodes and `DECIDED_IN` / `EVIDENCED_BY` / `OWNED_BY`
    edges.
-   Record audit events.

**Acceptance:** approved records appear in the relevant Space and can be
opened from the meeting.

### Milestone 5 --- Contextual memory and linking

-   Implement Context Router.
-   Retrieve prior records from the selected Space.
-   Add keyword + vector retrieval if embeddings are ready; keyword
    retrieval is acceptable as the fallback.
-   Implement Memory Linker for candidate duplicates and relationships.
-   Show related meetings and prior decisions.

**Acceptance:** a new meeting can link to a prior decision without
creating duplicate canonical records.

### Milestone 6 --- Decision Integrity Engine

-   Implement decision lifecycle.
-   Detect supersession candidates.
-   Detect repeated blockers and overlapping tasks.
-   Trace dependencies from changed decisions.
-   Create findings requiring review.

**Acceptance:** a new January launch decision can supersede December's
decision and produce downstream impact findings.

### Milestone 7 --- Decision Network and execution

-   Build interactive graph with filters and focus mode.
-   Build task table with owner, due date, status, Space, and source.
-   Build Command Centre cards using real database queries.

**Acceptance:** every displayed graph node and task opens a detail view
with source/evidence.

### Milestone 8 --- Cross-Space executive intelligence

-   Add permission-filtered cross-Space retrieval.
-   Build executive view with cross-team risks.
-   Add safe aggregation for restricted records if required.
-   Add decision trail explanation.

**Acceptance:** demo question about launch risk connects Product,
Engineering, and HR evidence without exposing restricted content.

### Milestone 9 --- Evaluation and polish

-   Run labelled benchmark.
-   Fix high-impact failures.
-   Test permissions and failure states.
-   Polish graph and loading states.
-   Rehearse demo on a clean environment.

**Acceptance:** demo works repeatedly with seeded data; measured results
and limitations are documented.

## 4. Critical path

``` text
Contracts + schema
       ↓
Spaces + permissions
       ↓
Transcript ingestion
       ↓
Extraction + evidence
       ↓
Review + persistence
       ↓
Retrieval + linking
       ↓
Decision integrity
       ↓
Graph + dashboards
       ↓
Executive cross-Space demo
```

Do not block the entire team on advanced vector search. Start with SQL
and keyword retrieval, then add embeddings as a ranking improvement.

## 5. MVP acceptance checklist

-   [ ] User can choose a primary Space before ingesting a meeting.
-   [ ] Meeting transcript is segmented and stored.
-   [ ] Decisions/tasks/blockers/questions are extracted into typed
    candidates.
-   [ ] Every candidate displays its evidence.
-   [ ] User can approve or reject candidates.
-   [ ] Approved records persist with canonical IDs.
-   [ ] New meetings can link to prior records.
-   [ ] Decision history preserves superseded decisions.
-   [ ] Findings show why an issue was flagged.
-   [ ] Graph supports search and focused inspection.
-   [ ] Execution view shows owner, status, due date, and source.
-   [ ] Ask answers cite evidence.
-   [ ] Cross-Space retrieval respects permissions.
-   [ ] Demo seed script recreates a consistent scenario.
-   [ ] No API keys or private transcripts are committed.

## 6. Scope cuts if time runs short

Cut in this order: 1. Live integrations 2. Voice interface 3. Advanced
charts 4. Complex role administration 5. Automated reminders 6. Fancy
graph physics or animation

Do not cut: - Evidence links - Space-scoped retrieval - Decision
history - Human review - Permission checks - The end-to-end demo path

## 7. Engineering workflow

-   Use feature branches and small pull requests.
-   Merge only when the app still runs.
-   Keep API schemas in a shared documented location.
-   Add seed data early so frontend and agent work can proceed in
    parallel.
-   Keep a `DEMO_MODE` flag or seeded workspace for reliable judging.
-   Freeze features before the final demo; spend the remaining time on
    reliability.
